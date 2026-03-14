import { Operation, Stock, StockLedger, Product, Location } from '../models/index.js';
import { sendEmail } from '../utils/sendEmail.js';

// Helper to generate reference numbers
const generateReference = async (type) => {
  const prefix = {
    'Receipt': 'REC',
    'Delivery': 'DEL',
    'Internal Transfer': 'INT',
    'Adjustment': 'ADJ'
  }[type];
  
  const count = await Operation.countDocuments({ type });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
};

// @desc    Get all operations
// @route   GET /api/operations
// @access  Private
export const getOperations = async (req, res) => {
  try {
    const { type, status, location, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (location && location !== 'all') {
      query.$or = [
        { sourceLocation: location },
        { destinationLocation: location }
      ];
    }

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);

    const total = await Operation.countDocuments(query);
    const operations = await Operation.find(query)
      .populate('sourceLocation', 'name type')
      .populate('destinationLocation', 'name type')
      .populate('createdBy', 'name')
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
    const { type, sourceLocation, destinationLocation, items, notes } = req.body;

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
    const { sourceLocation, destinationLocation, items, notes, status } = req.body;

    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (operation.status === 'Done' || operation.status === 'Canceled') {
      return res.status(400).json({ message: 'Cannot edit a completed or canceled operation' });
    }

    operation.sourceLocation = sourceLocation !== undefined ? sourceLocation : operation.sourceLocation;
    operation.destinationLocation = destinationLocation !== undefined ? destinationLocation : operation.destinationLocation;
    operation.items = items || operation.items;
    operation.notes = notes !== undefined ? notes : operation.notes;
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

    if (operation.status === 'Done' || operation.status === 'Canceled') {
      return res.status(400).json({ message: `Operation is already ${operation.status}` });
    }

    // Process Stock Updates & Ledgers
    for (const item of operation.items) {
      // 1. Decrease Stock from Source Location (if applicable)
      if (operation.sourceLocation) {
        const sourceStock = await Stock.findOne({ product: item.product._id, location: operation.sourceLocation });
        if (sourceStock) {
           sourceStock.quantity -= item.quantity;
           await sourceStock.save();
        } else {
           // For deliveries/transfers, maybe negative stock is allowed or we should throw error.
           // Allowing negative for now, typical of loose inventory systems until counted.
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
