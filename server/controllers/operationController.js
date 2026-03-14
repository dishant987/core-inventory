import { Operation, Stock, StockLedger, Product, Location, Counter } from '../models/index.js';
import { sendEmail } from '../utils/sendEmail.js';

// Helper to generate professional reference numbers: WH/IN/0001
const generateReference = async (type) => {
  const opMap = {
    'Receipt': 'IN',
    'Delivery': 'OUT',
    'Internal Transfer': 'TRANS',
    'Adjustment': 'ADJ'
  };
  const opCode = opMap[type] || 'OP';
  const prefix = 'WH'; // Default Warehouse Prefix
  
  // Find or create sequence for this specific prefix/code combo
  const counterId = `op_${opCode.toLowerCase()}`;
  const counter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  const sequence = String(counter.seq).padStart(4, '0');
  return `${prefix}/${opCode}/${sequence}`;
};

// Helper to check if a user role has permission for an operation type
const checkOperationPermission = (user, opType) => {
  if (user.role === 'Admin') return true;
  
  if (user.role === 'Inventory Manager') {
    return ['Receipt', 'Delivery'].includes(opType);
  }
  
  if (user.role === 'Warehouse Staff') {
    return ['Internal Transfer', 'Adjustment'].includes(opType);
  }
  
  return false;
};

// @desc    Get all operations
// @route   GET /api/operations
// @access  Private
export const getOperations = async (req, res) => {
  try {
    const { type, status, location, search, page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    
    // Date Range Filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.scheduledDate.$lte = end;
      }
    }

    if (location && location !== 'all') {
      query.$or = [
        { sourceLocation: location },
        { destinationLocation: location }
      ];
    }

    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);

    const total = await Operation.countDocuments(query);
    const operations = await Operation.find(query)
      .populate('sourceLocation', 'name type')
      .populate('destinationLocation', 'name type')
      .populate('createdBy', 'name')
      .populate('partner', 'name type')
      .populate('items.product', 'name sku uom')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json({
      data: operations,
      page: currentPage,
      pages: Math.ceil(total / perPage),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single operation
// @route   GET /api/operations/:id
// @access  Private
export const getOperationById = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate('sourceLocation', 'name type')
      .populate('destinationLocation', 'name type')
      .populate('createdBy', 'name')
      .populate('partner', 'name type')
      .populate('items.product', 'name sku uom');

    if (operation) {
      res.json(operation);
    } else {
      res.status(404).json({ message: 'Operation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an operation
// @route   POST /api/operations
// @access  Private
export const createOperation = async (req, res) => {
  try {
    const { type, sourceLocation, destinationLocation, items, notes, partner, scheduledDate } = req.body;

    if (!checkOperationPermission(req.user, type)) {
      return res.status(403).json({ message: `Access Denied: ${req.user.role}s cannot manage ${type}s` });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    const referenceNumber = await generateReference(type);

    const operation = new Operation({
      type,
      referenceNumber,
      sourceLocation: sourceLocation || undefined,
      destinationLocation: destinationLocation || undefined,
      items,
      notes,
      partner: partner || undefined,
      scheduledDate: scheduledDate || undefined,
      createdBy: req.user._id,
      status: 'Draft'
    });

    const createdOperation = await operation.save();
    res.status(201).json(createdOperation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an operation
// @route   PUT /api/operations/:id
// @access  Private
export const updateOperation = async (req, res) => {
  try {
    const { sourceLocation, destinationLocation, items, notes, status, partner, scheduledDate } = req.body;

    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (!checkOperationPermission(req.user, operation.type)) {
      return res.status(403).json({ message: `Access Denied: ${req.user.role}s cannot manage ${operation.type}s` });
    }

    if (operation.status === 'Done' || operation.status === 'Canceled') {
      return res.status(400).json({ message: 'Cannot edit a completed or canceled operation' });
    }

    operation.sourceLocation = sourceLocation !== undefined ? sourceLocation : operation.sourceLocation;
    operation.destinationLocation = destinationLocation !== undefined ? destinationLocation : operation.destinationLocation;
    operation.items = items || operation.items;
    operation.notes = notes !== undefined ? notes : operation.notes;
    operation.partner = partner !== undefined ? partner : operation.partner;
    operation.scheduledDate = scheduledDate !== undefined ? scheduledDate : operation.scheduledDate;
    if (status) operation.status = status;

    const updatedOperation = await operation.save();
    res.json(updatedOperation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate an operation (Moves Stock)
// @route   POST /api/operations/:id/validate
// @access  Private
export const validateOperation = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id).populate('items.product');

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (!checkOperationPermission(req.user, operation.type)) {
      return res.status(403).json({ message: `Access Denied: ${req.user.role}s cannot validate ${operation.type}s` });
    }

    if (operation.status === 'Done' || operation.status === 'Canceled') {
      return res.status(400).json({ message: `Operation is already ${operation.status}` });
    }

    // Process Stock Updates & Ledgers
    for (const item of operation.items) {
      if (operation.type === 'Adjustment') {
        // --- INVENTORY ADJUSTMENT LOGIC ---
        // 'item.quantity' is the PHYSICAL COUNT. We update stock to MATCH this exactly.
        const existingStock = await Stock.findOne({ 
          product: item.product._id, 
          location: operation.destinationLocation 
        });

        const currentQty = existingStock ? existingStock.quantity : 0;
        const delta = item.quantity - currentQty;

        if (existingStock) {
          existingStock.quantity = item.quantity;
          await existingStock.save();
        } else {
          await Stock.create({ 
            product: item.product._id, 
            location: operation.destinationLocation, 
            quantity: item.quantity 
          });
        }

        // Log the DIFF to the ledger so the history makes sense (e.g. +5 or -3)
        await StockLedger.create({
          operation: operation._id,
          product: item.product._id,
          toLocation: operation.destinationLocation,
          quantity: delta,
          date: new Date(),
          notes: `Inventory Adjustment: ${currentQty} -> ${item.quantity}`
        });

      } else {
        // --- STANDARD MOVEMENT LOGIC (Receipt, Delivery, Transfer) ---
        // 1. Decrease Stock from Source Location (if applicable)
        if (operation.sourceLocation) {
          const sourceStock = await Stock.findOne({ product: item.product._id, location: operation.sourceLocation });
          if (sourceStock) {
            sourceStock.quantity -= item.quantity;
            await sourceStock.save();
          } else {
            await Stock.create({ product: item.product._id, location: operation.sourceLocation, quantity: -item.quantity });
          }
        }

        // 2. Increase Stock at Destination Location (if applicable)
        if (operation.destinationLocation) {
          const destStock = await Stock.findOne({ product: item.product._id, location: operation.destinationLocation });
          if (destStock) {
            destStock.quantity += item.quantity;
            await destStock.save();
          } else {
            await Stock.create({ product: item.product._id, location: operation.destinationLocation, quantity: item.quantity });
          }
        }

        // 3. Create Ledger Entry
        await StockLedger.create({
          operation: operation._id,
          product: item.product._id,
          fromLocation: operation.sourceLocation || null,
          toLocation: operation.destinationLocation || null,
          quantity: item.quantity,
          date: new Date()
        });
      }
    }

    operation.status = 'Done';
    await operation.save();

    // Trigger Notification Email logic
    try {
      await sendEmail({
        email: req.user.email,
        subject: `Operation ${operation.referenceNumber} Validated [${operation.type}]`,
        message: `Hello ${req.user.name},\n\nYour Inventory Operation ${operation.referenceNumber} has been successfully validated.\n\nThe physical stock ledgers have been permanently updated across your warehouse ecosystem.\n\nItems Processed: ${operation.items.length}\nType: ${operation.type}\nStatus: ${operation.status}\n\nRegards,\nIMS Automated System`,
      });
    } catch (err) {
      console.log('Stock updated but email notification failed to send:', err.message);
    }

    res.json({ message: 'Operation validated successfully', operation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
