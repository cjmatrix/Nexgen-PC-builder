export const getPaypalClientId = async (req, res, next) => {
  try {
    console.log("Sending PayPal Client ID:", process.env.PAYPAL_CLIENT_ID);
    res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
  } catch (error) {
    next(error);
  }
};
