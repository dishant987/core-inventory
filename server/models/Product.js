import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    uom: {
      // Unit of Measure
      type: String,
      required: [true, 'Unit of measure is required'],
      enum: ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'pack', 'set', 'm', 'cm', 'ft'],
      default: 'pcs',
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      // Alert when stock falls below this
      type: Number,
      default: 0,
      min: 0,
    },
    reorderQty: {
      // Suggested qty to reorder
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: total stock across all locations
productSchema.virtual('stockRecords', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
