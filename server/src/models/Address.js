const mongoose = require('mongoose');

/**
 * Saved delivery address for a customer.
 *
 * Each address belongs to exactly one user. A user may have many
 * addresses, but at most one can be marked `isDefault` at a time
 * (enforced in AddressService).
 */
const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
    },
    house: {
      type: String,
      required: [true, 'House / Flat No. is required'],
      trim: true,
      maxlength: [100, 'House / Flat No. cannot exceed 100 characters'],
    },
    street: {
      type: String,
      required: [true, 'Street / Area is required'],
      trim: true,
      maxlength: [200, 'Street / Area cannot exceed 200 characters'],
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Landmark cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be a valid 6-digit number'],
    },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
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

// Optimise common queries: a user's addresses, default-first ordering.
addressSchema.index({ user: 1, isDefault: -1, createdAt: -1 });

module.exports = mongoose.model('Address', addressSchema);

