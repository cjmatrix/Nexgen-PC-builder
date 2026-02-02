
export const PRICING = {
  // Shipping/Delivery Charge (in paisa)
  SHIPPING_CHARGE: 5000, // ₹50.00

  // Tax Rate (in paisa, or set to 0 for no tax)
  TAX_CHARGE: 0, // ₹0.00

  // Minimum order value for free shipping (in paisa)
  FREE_SHIPPING_THRESHOLD: 0, // Set to 0 to disable free shipping
};


 
export const paisaToRupees = (paisa) => paisa / 100;


export const rupeesToPaisa = (rupees) => Math.round(rupees * 100);
