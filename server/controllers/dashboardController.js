import { Product, Stock, Operation } from '../models/index.js';

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard/kpis
// @access  Private
export const getDashboardKPIs = async (req, res) => {
  try {
    // 1. Total Products Count (Active)
    const totalProducts = await Product.countDocuments({ isActive: true, isDeleted: false });

    // 2. Low/Out of Stock Items (Aggregated per Product)
    const stockStats = await Stock.aggregate([
      {
        $group: {
          _id: '$product',
          totalQty: { $sum: '$quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          totalQty: 1,
          reorderPoint: { $ifNull: ['$productInfo.reorderPoint', 0] },
          name: '$productInfo.name',
          isActive: '$productInfo.isActive',
          isDeleted: '$productInfo.isDeleted'
        }
      },
      { $match: { isActive: true, isDeleted: false } }
    ]);

    let outOfStock = 0;
    let lowStock = 0;
    const outOfStockItems = [];
    const lowStockItems = [];
    const productsWithStock = stockStats.map(s => s._id);
    
    stockStats.forEach(stat => {
      const item = { 
        _id: stat._id, 
        name: stat.name, 
        totalQty: stat.totalQty, 
        reorderPoint: stat.reorderPoint 
      };

      if (stat.totalQty <= 0) {
        outOfStock++;
        outOfStockItems.push(item);
      } else if (stat.totalQty <= stat.reorderPoint) {
        lowStock++;
        lowStockItems.push(item);
      }
    });

    // Handle products with no stock records (strictly 0 qty)
    const noStockProductsFound = await Product.find({
      _id: { $nin: productsWithStock },
      isActive: true,
      isDeleted: false
    }).select('name reorderPoint');

    noStockProductsFound.forEach(p => {
      outOfStock++;
      outOfStockItems.push({
        _id: p._id,
        name: p.name,
        totalQty: 0,
        reorderPoint: p.reorderPoint
      });
    });

    // 3. Pending Operations
    const pendingReceipts = await Operation.countDocuments({ type: 'Receipt', status: { $in: ['Draft', 'Waiting', 'Ready'] } });
    const pendingDeliveries = await Operation.countDocuments({ type: 'Delivery', status: { $in: ['Draft', 'Waiting', 'Ready'] } });
    const pendingTransfers = await Operation.countDocuments({ type: 'Internal Transfer', status: { $in: ['Draft', 'Waiting', 'Ready'] } });

    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      lowStockItems: [...outOfStockItems, ...lowStockItems].slice(0, 10), // Return top 10 alerts
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
