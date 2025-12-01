const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // --- Basic Identity ---
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true, // Always store emails in lowercase to avoid case-sensitive login issues
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Do not return password by default in queries
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  // --- Security & Verification (OTP) ---
  isVerified: {
    type: Boolean,
    default: false
  },
  // We store the hashed OTP or raw OTP (if short lived) here temporarily
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // --- User Wallet (Financials) ---
  // Stored in the smallest currency unit (e.g., Paise for INR) to avoid float errors
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative'],
    // Ensure we always deal with integers
    get: v => Math.round(v),
    set: v => Math.round(v)
  },

  // --- Shipping Addresses ---
  // Embedded array since users rarely have more than 3-5 addresses
  addresses: [{
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],

  // --- Account Status ---
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // Optional: Link to the order that created a specific community build feature
  original_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

// --- Middleware: Encrypt password using bcrypt before saving ---
userSchema.pre('save', async function(next) {
  // Only run this line if password was actually modified
  if (!this.isModified('password')) {

    return ;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

// --- Method: Match user entered password to hashed password in database ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
