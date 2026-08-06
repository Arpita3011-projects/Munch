const mongoose = require('mongoose');

/**
 * Review subdocument/collection for menu items.
 *
 * A review is created by a user who ordered the item (enforced in the
 * ReviewService against the Order model). Each user may leave at most one
 * review per menu item (enforced by a unique compound index).
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
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

// A user can review a menu item only once.
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });

// Efficient listing of reviews for a menu item, newest first.
reviewSchema.index({ menuItem: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

