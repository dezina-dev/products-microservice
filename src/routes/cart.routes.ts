const express = require('express');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/get-cart/:userId', cartController.getCart);
router.post('/add-to-cart/:userId', cartController.addToCart);
router.delete('/remove-item/:userId/:productId', cartController.removeFromCart);
router.put('/update-cart/:userId/:productId/:action', cartController.updateCartItem);

export default router;
