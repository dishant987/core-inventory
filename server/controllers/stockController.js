import { Stock, StockLedger } from '../models/index.js';

// @desc    Get all stock entries
// @route   GET /api/stock
// @access  Private
export const getStock = async (req, res) => {
  try {
    const { product, location } = req.query;
    
    let query = {};
    if (product) query.product = product;
    if (location) query.location = location;

    const stock = await Stock.find(query)
      .populate('product', 'name sku uom')
      .populate('location', 'name type');

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock ledger history
// @route   GET /api/stock/ledger
// @access  Private
export const getLedger = async (req, res) => {
  try {
    const { product, location, limit = 50 } = req.query;
    
    let query = {};
    if (product) query.product = product;
    if (location) {
        query.$or = [
            { fromLocation: location },
            { toLocation: location }
        ];
    }

    const ledger = await StockLedger.find(query)
      .populate('operation', 'referenceNumber type status')
      .populate('product', 'name sku uom')
      .populate('fromLocation', 'name type')
      .populate('toLocation', 'name type')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
