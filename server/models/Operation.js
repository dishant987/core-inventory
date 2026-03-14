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
        // Source location is required for Deliveries and Internal Transfers
        return ['Delivery', 'Internal Transfer'].includes(this.type);
      },
    },
    destinationLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: function () {
        // Destination location is required for Receipts, Internal Transfers, and Adjustments
        return ['Receipt', 'Internal Transfer', 'Adjustment'].includes(this.type);
      },
    },
    items: [operationItemSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
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
