const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
    // You might want to use a pre-save hook to auto-generate this from the name
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'], // e.g., 'Gaming', 'Office', 'Workstation'
    index: true
  },
  base_price: {
    type: Number,
    required: true,
    min: 0,
    // Store in smallest currency unit (Paise/Cents)
    get: v => Math.round(v),
    set: v => Math.round(v)
  },
  
  // Visuals
  images: [{
    type: String // Array of Cloudinary URLs
  }],
  
  // The Configuration: References to the Component Collection
  // This defines what parts are inside this specific PC build
  default_config: {
    cpu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    gpu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    motherboard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    ram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    storage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    psu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    },
    cooler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true
    }
  },

  // --- Community Build Features ---
  is_featured_community_build: {
    type: Boolean,
    default: false,
    index: true // Index this for fast filtering on the Community page
  },
  original_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null // Null for admin-created base models
  },
  
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Optional: Auto-generate slug from name before saving
productSchema.pre('save', function() {
  if (!this.isModified('name')) {
    
    return;
  }
  this.slug = this.name.toLowerCase().split(' ').join('-');
 
});

module.exports = mongoose.model('Product', productSchema);