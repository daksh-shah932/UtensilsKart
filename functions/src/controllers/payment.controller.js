const paymentService = require("../services/payment.service");

// POST /api/payment/create-order
async function createOrder(req, res) {
  try {
    const { amount, currency, items, customer, deliveryAddress } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid order amount is required" });
    }

    const order = await paymentService.createRazorpayOrder({
      amount,
      currency,
      items,
      customer,
      deliveryAddress,
    });

    return res.status(200).json(order);
  } catch (err) {
    console.error("[createOrder]", err);
    return res.status(500).json({ error: err.message || "Failed to create order" });
  }
}

// POST /api/payment/verify
async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      deliveryAddress,
      items,
      amount,
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ error: "Missing razorpay_payment_id" });
    }

    const result = await paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      deliveryAddress,
      items,
      amount,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("[verifyPayment]", err);
    return res.status(400).json({ error: err.message || "Payment verification failed" });
  }
}

// GET /api/payment/order/:id
async function getOrder(req, res) {
  try {
    const order = await paymentService.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.status(200).json(order);
  } catch (err) {
    console.error("[getOrder]", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
}

// GET /api/payment/config
async function getConfig(req, res) {
  return res.status(200).json({
    keyId: paymentService.RAZORPAY_KEY_ID,
    currency: "INR",
    merchantName: "UtensilKart",
  });
}

module.exports = {
  createOrder,
  verifyPayment,
  getOrder,
  getConfig,
};
