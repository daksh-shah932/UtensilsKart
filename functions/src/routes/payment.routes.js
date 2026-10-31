const express = require("express");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.get("/config", paymentController.getConfig);
router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.get("/order/:id", paymentController.getOrder);

module.exports = router;
