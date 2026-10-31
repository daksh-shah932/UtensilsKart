const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

/**
 * Fetch Razorpay public configuration
 */
export async function getPaymentConfig() {
  const res = await fetch(`${API_BASE}/api/payment/config`);
  if (!res.ok) throw new Error("Failed to load payment configuration");
  return res.json();
}

/**
 * Create a new payment order
 */
export async function createPaymentOrder({ amount, currency = "INR", items, customer, deliveryAddress }) {
  const res = await fetch(`${API_BASE}/api/payment/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, items, customer, deliveryAddress }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to initialize payment order");
  }
  return res.json();
}

/**
 * Verify Razorpay payment on the server
 */
export async function verifyPaymentResult(paymentPayload) {
  const res = await fetch(`${API_BASE}/api/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Payment verification failed");
  }
  return res.json();
}

/**
 * Fetch confirmed order details
 */
export async function fetchOrderDetails(orderId) {
  const res = await fetch(`${API_BASE}/api/payment/order/${orderId}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}
