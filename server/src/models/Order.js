const mongoose = require('mongoose');

/**
 * Snapshot subdocument for a single item in an order.
 * Stores the item details at time of purchase so historical
 * orders are not affected by future price changes.
 */
const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
    size: {
      name: { type: String, default: 'Regular' },
      priceAdjustmentCents: { type: Number, default: 0 },
    },
    addOns: [
      {
        name: { type: String, required: true },
        priceCents: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { _id: false }
);

const statusEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotalCents: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFeeCents: {
      type: Number,
      required: true,
      default: 0,
    },
    taxCents: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCents: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: {
      type: [statusEntrySchema],
      default: [],
    },
    addressSnapshot: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      type: { type: String, default: 'home' },
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'UPI', 'Card'],
      default: 'Cash on Delivery',
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

// Index for efficient user order lookups (sorted by newest first)
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
