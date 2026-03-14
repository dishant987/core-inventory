import mongoose from 'mongoose';

const operationItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const operationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Receipt', 'Delivery', 'Internal Transfer', 'Adjustment'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'],
      default: 'Draft',
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: function () {
        // Source location is required for Deliveries, Internal Transfers, and Adjustments (sometimes)
        return this.type !== 'Receipt';
      },
    },
    destinationLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: function () {
        // Destination location is required for Receipts, Internal Transfers, and Adjustments (sometimes)
        return this.type !== 'Delivery';
      },
    },
    items: [operationItemSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Operation = mongoose.model('Operation', operationSchema);

export default Operation;
