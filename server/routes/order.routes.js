import express from 'express';
import {
    createOrderFromCart,
    createOrder,
    getUserOrders,
    getOrderById,
    getOrderByNumber,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderStats
} from '../controllers/order.controller.js';
import { verifyJWT, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes (authentication required)
router.route('/').get(verifyJWT, getUserOrders);
router.route('/').post(verifyJWT, createOrder);
router.route('/from-cart').post(verifyJWT, createOrderFromCart);
router.route('/:orderId').get(verifyJWT, getOrderById);
router.route('/number/:orderNumber').get(verifyJWT, getOrderByNumber);
router.route('/:orderId/cancel').patch(verifyJWT, cancelOrder);

// Admin routes (authentication + admin required)
router.route('/admin/all').get(verifyJWT, verifyAdmin, getAllOrders);
router.route('/admin/:orderId/status').patch(verifyJWT, verifyAdmin, updateOrderStatus);
router.route('/admin/:orderId/payment').patch(verifyJWT, verifyAdmin, updatePaymentStatus);
router.route('/admin/stats').get(verifyJWT, verifyAdmin, getOrderStats);

export default router;
