import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    validateCart
} from '../controllers/cart.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected cart routes
router.route('/').get(verifyJWT, getCart);
router.route('/summary').get(verifyJWT, getCartSummary);
router.route('/validate').post(verifyJWT, validateCart);
router.route('/').post(verifyJWT, addToCart);
router.route('/item/:productId').patch(verifyJWT, updateCartItem);
router.route('/item/:productId').delete(verifyJWT, removeFromCart);
router.route('/clear').delete(verifyJWT, clearCart);

export default router;
