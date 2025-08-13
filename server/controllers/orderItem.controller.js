import { OrderItem } from '../models/orderItem.model.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import mongoose from 'mongoose';

// Get order items by order ID
const getOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        // Verify order belongs to user (unless admin)
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const orderItems = await OrderItem.find({ orderId })
            .populate('productId', 'productName price image category brand stock')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: orderItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching order items",
            error: error.message
        });
    }
};

// Get single order item
const getOrderItemById = async (req, res) => {
    try {
        const { orderItemId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order item ID"
            });
        }

        const orderItem = await OrderItem.findById(orderItemId)
            .populate('productId', 'productName price image category brand stock')
            .populate('orderId', 'orderNumber userId status');

        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }

        // Verify order belongs to user (unless admin)
        if (orderItem.orderId.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            data: orderItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching order item",
            error: error.message
        });
    }
};

// Update order item status (Admin only)
const updateOrderItemStatus = async (req, res) => {
    try {
        const { orderItemId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order item ID"
            });
        }

        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const orderItem = await OrderItem.findByIdAndUpdate(
            orderItemId,
            { status },
            { new: true, runValidators: true }
        ).populate('productId', 'productName price image')
         .populate('orderId', 'orderNumber userId');

        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order item status updated successfully",
            data: orderItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating order item status",
            error: error.message
        });
    }
};

// Request return for order item
const requestReturn = async (req, res) => {
    try {
        const { orderItemId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order item ID"
            });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Return reason is required"
            });
        }

        const orderItem = await OrderItem.findById(orderItemId)
            .populate('orderId', 'userId status');

        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }

        // Verify order belongs to user
        if (orderItem.orderId.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Check if item is eligible for return
        if (orderItem.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: "Only delivered items can be returned"
            });
        }

        if (orderItem.returnRequested) {
            return res.status(400).json({
                success: false,
                message: "Return already requested for this item"
            });
        }

        // Check if return window is still open (e.g., 30 days)
        const deliveryDate = orderItem.updatedAt; // Assuming updatedAt reflects delivery date
        const returnWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        if (Date.now() - deliveryDate.getTime() > returnWindow) {
            return res.status(400).json({
                success: false,
                message: "Return window has expired"
            });
        }

        // Update order item with return request
        orderItem.returnRequested = true;
        orderItem.returnReason = reason.trim();
        orderItem.returnStatus = 'requested';
        await orderItem.save();

        res.status(200).json({
            success: true,
            message: "Return request submitted successfully",
            data: orderItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error requesting return",
            error: error.message
        });
    }
};

// Update return status (Admin only)
const updateReturnStatus = async (req, res) => {
    try {
        const { orderItemId } = req.params;
        const { returnStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderItemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order item ID"
            });
        }

        const validReturnStatuses = ["none", "requested", "approved", "rejected", "completed"];
        if (!validReturnStatuses.includes(returnStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return status"
            });
        }

        const orderItem = await OrderItem.findById(orderItemId);

        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }

        if (!orderItem.returnRequested && returnStatus !== 'none') {
            return res.status(400).json({
                success: false,
                message: "No return request exists for this item"
            });
        }

        orderItem.returnStatus = returnStatus;
        
        // If return is completed, update item status
        if (returnStatus === 'completed') {
            orderItem.status = 'returned';
        }

        await orderItem.save();

        res.status(200).json({
            success: true,
            message: "Return status updated successfully",
            data: orderItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating return status",
            error: error.message
        });
    }
};

// Get all return requests (Admin only)
const getReturnRequests = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            returnStatus,
            sortBy = 'updatedAt', 
            sortOrder = 'desc' 
        } = req.query;

        // Build filter
        const filter = { returnRequested: true };
        if (returnStatus) {
            filter.returnStatus = returnStatus;
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const returnRequests = await OrderItem.find(filter)
            .populate('productId', 'productName price image')
            .populate('orderId', 'orderNumber userId')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'userId',
                    select: 'fullName email phoneNumber'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalRequests = await OrderItem.countDocuments(filter);
        const totalPages = Math.ceil(totalRequests / parseInt(limit));

        res.status(200).json({
            success: true,
            data: returnRequests,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRequests,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching return requests",
            error: error.message
        });
    }
};

// Get user's return requests
const getUserReturnRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            page = 1, 
            limit = 10, 
            returnStatus,
            sortBy = 'updatedAt', 
            sortOrder = 'desc' 
        } = req.query;

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Find order items with return requests for this user
        const pipeline = [
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            {
                $unwind: '$order'
            },
            {
                $match: {
                    'order.userId': new mongoose.Types.ObjectId(userId),
                    returnRequested: true,
                    ...(returnStatus && { returnStatus })
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $sort: sort
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    orderId: 1,
                    productId: 1,
                    quantity: 1,
                    unitPrice: 1,
                    totalPrice: 1,
                    productName: 1,
                    productImage: 1,
                    status: 1,
                    returnRequested: 1,
                    returnReason: 1,
                    returnStatus: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'order.orderNumber': 1,
                    'product.productName': 1,
                    'product.price': 1,
                    'product.image': 1
                }
            }
        ];

        const returnRequests = await OrderItem.aggregate(pipeline);

        // Get total count
        const countPipeline = [
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            {
                $unwind: '$order'
            },
            {
                $match: {
                    'order.userId': new mongoose.Types.ObjectId(userId),
                    returnRequested: true,
                    ...(returnStatus && { returnStatus })
                }
            },
            {
                $count: 'total'
            }
        ];

        const countResult = await OrderItem.aggregate(countPipeline);
        const totalRequests = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalRequests / parseInt(limit));

        res.status(200).json({
            success: true,
            data: returnRequests,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRequests,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user return requests",
            error: error.message
        });
    }
};

export {
    getOrderItems,
    getOrderItemById,
    updateOrderItemStatus,
    requestReturn,
    updateReturnStatus,
    getReturnRequests,
    getUserReturnRequests
};
