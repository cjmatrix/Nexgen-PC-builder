/**
 * Pricing Constants
 * All prices are stored in PAISA (smallest currency unit)
 * Example: ₹50.00 = 5000 paisa
 */

export const PRICING = {
  // Shipping/Delivery Charge (in paisa)
  SHIPPING_CHARGE: 5000, // ₹50.00

  // Tax Rate (in paisa, or set to 0 for no tax)
  TAX_CHARGE: 0, // ₹0.00

  // Minimum order value for free shipping (in paisa)
  FREE_SHIPPING_THRESHOLD: 0, // Set to 0 to disable free shipping
};

/**
 * Helper function to convert paisa to rupees for display
 * @param {number} paisa - Amount in paisa
 * @returns {number} Amount in rupees
 */
export const paisaToRupees = (paisa) => paisa / 100;

/**
 * Helper function to convert rupees to paisa for storage
 * @param {number} rupees - Amount in rupees
 * @returns {number} Amount in paisa
 */
export const rupeesToPaisa = (rupees) => Math.round(rupees * 100);
