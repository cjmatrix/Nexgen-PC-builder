const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // Link this cart to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensures 1 Cart per User
  },

  items: [{
    // We ONLY reference the Product collection.
    // No need for 'custom_build' fields since those go straight to Checkout.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }]

}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);