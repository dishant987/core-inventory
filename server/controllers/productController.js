import { Product, Stock, StockLedger } from '../models/index.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;

    let query = {};
    
    if (status === 'deleted') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
      if (status && status !== 'all') {
        query.isActive = status === 'active';
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.categoryId = category;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    
    const total = await Product.countDocuments(query);
    
    // Aggregation to include total quantity
    const products = await Product.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (currentPage - 1) * perPage },
      { $limit: perPage },
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stockData'
        }
      },
      {
        $addFields: {
          totalStock: { $sum: '$stockData.quantity' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryId'
        }
      },
      { $unwind: { path: '$categoryId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
    ]);
      
    res.json({
      data: products,
      page: currentPage,
      pages: Math.ceil(total / perPage),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id })
      .populate('categoryId', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { 
      name, sku, barcode, categoryId, description, uom, 
      costPrice, salePrice, reorderPoint, reorderQty, 
      image, isActive, tags, initialStock, initialLocation
    } = req.body;

    const productExists = await Product.findOne({ sku, isDeleted: false });
    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = new Product({
      name,
      sku,
      barcode,
      categoryId: categoryId || null,
      description,
      uom: uom || 'pcs',
      costPrice: costPrice || 0,
      salePrice: salePrice || 0,
      reorderPoint: reorderPoint || 0,
      reorderQty: reorderQty || 0,
      image,
      isActive: isActive !== undefined ? isActive : true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      createdBy: req.user._id
    });

    const createdProduct = await product.save();

    // Handle Initial Stock if provided
    if (initialStock && initialStock > 0 && initialLocation) {
      // 1. Create/Update Stock record
      await Stock.create({
        product: createdProduct._id,
        location: initialLocation,
        quantity: initialStock
      });

      // 2. Create Ledger entry for audit trail
      await StockLedger.create({
        product: createdProduct._id,
        toLocation: initialLocation,
        quantity: initialStock,
        date: new Date(),
        notes: 'Initial stock during product creation'
      });
    }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { 
      name, barcode, categoryId, description, uom, 
      costPrice, salePrice, reorderPoint, reorderQty, 
      image, isActive, tags, isDeleted
    } = req.body;

    const product = await Product.findOne({ _id: req.params.id });

    if (product) {
      product.name = name || product.name;
      // Note: SKU is intentionally left out to prevent modifications
      product.barcode = barcode !== undefined ? barcode : product.barcode;
      if (categoryId !== undefined) {
        product.categoryId = categoryId === "" ? null : categoryId;
      }
      product.description = description !== undefined ? description : product.description;
      product.uom = uom || product.uom;
      product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
      product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;
      product.reorderPoint = reorderPoint !== undefined ? reorderPoint : product.reorderPoint;
      product.reorderQty = reorderQty !== undefined ? reorderQty : product.reorderQty;
      product.image = image !== undefined ? image : product.image;
      product.isActive = isActive !== undefined ? isActive : product.isActive;
      if (isDeleted !== undefined) product.isDeleted = isDeleted;
      
      if (tags) {
        product.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });

    if (product) {
      product.isDeleted = true;
      product.isActive = false;
      await product.save();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
