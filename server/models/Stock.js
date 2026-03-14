import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// We want to ensure that each product has only one stock entry per location
stockSchema.index({ product: 1, location: 1 }, { unique: true });

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
