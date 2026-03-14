import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Vendor', 'View', 'Internal', 'Customer', 'Inventory Loss', 'Production'],
      default: 'Internal',
      /*
        View: Used for organizing (e.g., "Main Warehouse" is a view, "Rack A" is Internal)
        Internal: Physical locations within your own warehouses
        Vendor: Virtual location representing your suppliers
        Customer: Virtual location representing stock sent to customers
        Inventory Loss: Virtual location for damaged/lost goods (Adjustments)
        Production: Virtual location for manufacturing
      */
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null, // allows hierarchical locations (e.g., Main Store -> Section A -> Rack 1)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Location = mongoose.model('Location', locationSchema);

export default Location;
