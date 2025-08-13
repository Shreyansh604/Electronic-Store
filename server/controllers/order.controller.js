import { Order } from '../models/order.model.js';
import { OrderItem } from '../models/orderItem.model.js';
import { Product } from '../models/product.model.js';
import { Cart } from '../models/cart.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// Create order from cart
const createOrderFromCart = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

        // Validate required fields
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Shipping address and payment method are required"
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Validate cart items and check stock
        const orderItems = [];
        let subtotal = 0;

        for (const cartItem of cart.items) {
            const product = cartItem.productId;
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "Product not found in cart"
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.productName} is no longer available`
                });
            }

            if (product.stock < cartItem.totalQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.productName}. Available: ${product.stock}, Requested: ${cartItem.totalQuantity}`
                });
            }

            const itemTotal = product.price * cartItem.totalQuantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: product._id,
                quantity: cartItem.totalQuantity,
                price: product.price,
                totalPrice: itemTotal,
                productName: product.productName,
                productImage: product.image
            });
        }

        // Calculate totals
        const shippingFee = subtotal > 500 ? 0 : 50; // Free shipping above 500
        const tax = subtotal * 0.18; // 18% GST
        const discount = 0; // Can be implemented later
        const totalAmount = subtotal + shippingFee + tax - discount;
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.totalQuantity, 0);

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            subtotal,
            shippingFee,
            tax,
            discount,
            totalAmount,
            totalQuantity,
            shippingAddress,
            billingAddress: billingAddress || { ...shippingAddress, sameAsShipping: true },
            paymentMethod,
            notes,
            expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        await order.save({ session });

        // Create order items
        const orderItemDocuments = orderItems.map(item => ({
            orderId: order._id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.totalPrice,
            productName: item.productName,
            productImage: item.productImage
        }));

        await OrderItem.insertMany(orderItemDocuments, { session });

        // Update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { userId },
            { 
                items: [],
                totalPrice: 0,
                totalQuantity: 0
            },
            { session }
        );

        await session.commitTransaction();

        // Fetch the complete order with populated data
        const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'fullName email')
            .populate('items.productId', 'productName price image category');

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: populatedOrder
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Create order directly (without cart)
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

        // Validate required fields
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items are required"
            });
        }

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Shipping address and payment method are required"
            });
        }

        // Validate and process items
        const orderItems = [];
        let subtotal = 0;
        let totalQuantity = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.productName} is not available`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.productName}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            totalQuantity += item.quantity;

            orderItems.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
                totalPrice: itemTotal,
                productName: product.productName,
                productImage: product.image
            });
        }

        // Calculate totals
        const shippingFee = subtotal > 500 ? 0 : 50;
        const tax = subtotal * 0.18;
        const discount = 0;
        const totalAmount = subtotal + shippingFee + tax - discount;

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            subtotal,
            shippingFee,
            tax,
            discount,
            totalAmount,
            totalQuantity,
            shippingAddress,
            billingAddress: billingAddress || { ...shippingAddress, sameAsShipping: true },
            paymentMethod,
            notes,
            expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await order.save({ session });

        // Create order items
        const orderItemDocuments = orderItems.map(item => ({
            orderId: order._id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.totalPrice,
            productName: item.productName,
            productImage: item.productImage
        }));

        await OrderItem.insertMany(orderItemDocuments, { session });

        // Update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        await session.commitTransaction();

        // Fetch the complete order with populated data
        const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'fullName email')
            .populate('items.productId', 'productName price image category');

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: populatedOrder
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        // Build filter
        const filter = { userId };
        if (status) {
            filter.status = status;
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate('items.productId', 'productName price image category')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / parseInt(limit));

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalOrders,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
};

// Get single order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({ _id: orderId, userId })
            .populate('userId', 'fullName email phoneNumber')
            .populate('items.productId', 'productName price image category brand');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order items details
        const orderItems = await OrderItem.find({ orderId })
            .populate('productId', 'productName price image category brand');

        res.status(200).json({
            success: true,
            data: {
                ...order.toObject(),
                orderItems
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching order",
            error: error.message
        });
    }
};

// Get order by order number
const getOrderByNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ orderNumber, userId })
            .populate('userId', 'fullName email phoneNumber')
            .populate('items.productId', 'productName price image category brand');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order items details
        const orderItems = await OrderItem.find({ orderId: order._id })
            .populate('productId', 'productName price image category brand');

        res.status(200).json({
            success: true,
            data: {
                ...order.toObject(),
                orderItems
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching order",
            error: error.message
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled in current status"
            });
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save({ session });

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }

        // Update order items status
        await OrderItem.updateMany(
            { orderId },
            { status: 'cancelled' },
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({
            success: false,
            message: "Error cancelling order",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            paymentStatus,
            userId,
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            search
        } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (userId) filter.userId = userId;
        if (search) {
            filter.$or = [
                { orderNumber: new RegExp(search, 'i') },
                { 'shippingAddress.fullName': new RegExp(search, 'i') }
            ];
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate('userId', 'fullName email phoneNumber')
            .populate('items.productId', 'productName price image')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / parseInt(limit));

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalOrders,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber, expectedDeliveryDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const updateData = { status };
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (expectedDeliveryDate) updateData.expectedDeliveryDate = expectedDeliveryDate;
        if (status === 'delivered') updateData.actualDeliveryDate = new Date();

        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true, runValidators: true }
        ).populate('userId', 'fullName email')
          .populate('items.productId', 'productName price image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update order items status
        await OrderItem.updateMany(
            { orderId },
            { status },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: error.message
        });
    }
};

// Admin: Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus, paymentId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const validPaymentStatuses = ["pending", "paid", "failed", "refunded", "partially_refunded"];
        if (!validPaymentStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const updateData = { paymentStatus };
        if (paymentId) updateData.paymentId = paymentId;

        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true, runValidators: true }
        ).populate('userId', 'fullName email')
          .populate('items.productId', 'productName price image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating payment status",
            error: error.message
        });
    }
};

// Get order statistics
const getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    avgOrderValue: { $avg: "$totalAmount" },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    confirmedOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
                    },
                    shippedOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    }
                }
            }
        ]);

        const monthlyStats = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalOrders: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0,
                    pendingOrders: 0,
                    confirmedOrders: 0,
                    shippedOrders: 0,
                    deliveredOrders: 0,
                    cancelledOrders: 0
                },
                monthlyStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching order statistics",
            error: error.message
        });
    }
};

export {
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
};
