import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },

    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    uom: {
      // Unit of Measure
      type: String,
      required: [true, "Unit of measure is required"],
      enum: ["pcs", "kg", "g", "ltr", "ml", "box", "pack", "set", "m", "cm", "ft"],
      default: "pcs",
    },

    costPrice: {
      type: Number,
      default: 0,
      min: [0, "Cost price cannot be negative"],
    },

    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= this.costPrice;
        },
        message: "Sale price must be greater than or equal to cost price",
      },
    },

    reorderPoint: {
      // Alert when stock falls below this
      type: Number,
      default: 0,
      min: [0, "Reorder point cannot be negative"],
    },

    reorderQty: {
      // Suggested qty to reorder
      type: Number,
      default: 0,
      min: [0, "Reorder quantity cannot be negative"],
    },

    image: {
      type: String,
      default: "",
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
      ref: "User",
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

/* ------------------ Virtual ------------------ */

productSchema.virtual("stockRecords", {
  ref: "Stock",
  localField: "_id",
  foreignField: "product",
});

/* ------------------ Indexes ------------------ */

productSchema.index({ name: "text", sku: "text", barcode: "text" });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;