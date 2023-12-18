const express = require('express');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.get('/get-orders', orderController.geOrders);
router.get('/get-user-orders/:userId', orderController.getOrderById);
router.post('/create-order', orderController.createOrder);
router.post('/create-checkout-session', orderController.createCheckoutSession);

export default router;