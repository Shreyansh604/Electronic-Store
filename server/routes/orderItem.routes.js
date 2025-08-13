import express from 'express';
import {
    getOrderItems,
    getOrderItemById,
    updateOrderItemStatus,
    requestReturn,
    updateReturnStatus,
    getReturnRequests,
    getUserReturnRequests
} from '../controllers/orderItem.controller.js';
import { verifyJWT, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes (authentication required)
router.route('/order/:orderId').get(verifyJWT, getOrderItems);
router.route('/:orderItemId').get(verifyJWT, getOrderItemById);
router.route('/:orderItemId/return').post(verifyJWT, requestReturn);
router.route('/returns/my-requests').get(verifyJWT, getUserReturnRequests);

// Admin routes (authentication + admin required)
router.route('/admin/:orderItemId/status').patch(verifyJWT, verifyAdmin, updateOrderItemStatus);
router.route('/admin/:orderItemId/return-status').patch(verifyJWT, verifyAdmin, updateReturnStatus);
router.route('/admin/returns/all').get(verifyJWT, verifyAdmin, getReturnRequests);

export default router;
