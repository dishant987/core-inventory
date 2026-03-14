import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema(
  {
    operation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operation',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    fromLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      // Nullable if it's a receipt from a vendor not tracked as a location, 
      // though usually vendors are represented as virtual locations.
    },
    toLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      // Nullable if it's a delivery to a customer not tracked as a location.
    },
    quantity: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);

export default StockLedger;
