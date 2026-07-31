const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priceAdjustment: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const addOnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Milkshakes', 'Sundaes', 'Ice Cream', 'Cookie Dough', 'Coffee'],
        message: '{VALUE} is not a valid category',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    sizes: {
      type: [sizeSchema],
      default: [{ name: 'Regular', priceAdjustment: 0 }],
    },
    addOns: {
      type: [addOnSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for query performance
menuItemSchema.index({ name: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);

