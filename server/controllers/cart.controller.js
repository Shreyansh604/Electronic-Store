import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import mongoose from 'mongoose';

// Get user's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        let cart = await Cart.findOne({ userId })
            .populate({
                path: 'items.productId',
                select: 'productName price image stock isActive',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                totalPrice: 0,
                totalQuantity: 0
            });
            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching cart",
            error: error.message
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1 } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: "Product is not available"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock available"
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                totalPrice: 0,
                totalQuantity: 0
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update existing item
            const newQuantity = cart.items[existingItemIndex].totalQuantity + quantity;
            
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock for requested quantity"
                });
            }

            cart.items[existingItemIndex].totalQuantity = newQuantity;
            cart.items[existingItemIndex].totalPrice = newQuantity * product.price;
        } else {
            // Add new item
            cart.items.push({
                productId,
                totalQuantity: quantity,
                totalPrice: quantity * product.price
            });
        }

        // Recalculate cart totals
        cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalQuantity = cart.items.reduce((total, item) => total + item.totalQuantity, 0);

        await cart.save();

        // Populate cart before sending response
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.productId',
                select: 'productName price image stock isActive',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding item to cart",
            error: error.message
        });
    }
};

// Update item quantity in cart
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Check product stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock available"
            });
        }

        // Update item
        cart.items[itemIndex].totalQuantity = quantity;
        cart.items[itemIndex].totalPrice = quantity * product.price;

        // Recalculate cart totals
        cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalQuantity = cart.items.reduce((total, item) => total + item.totalQuantity, 0);

        await cart.save();

        // Populate cart before sending response
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.productId',
                select: 'productName price image stock isActive',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating cart item",
            error: error.message
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Recalculate cart totals
        cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        cart.totalQuantity = cart.items.reduce((total, item) => total + item.totalQuantity, 0);

        await cart.save();

        // Populate cart before sending response
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.productId',
                select: 'productName price image stock isActive',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error removing item from cart",
            error: error.message
        });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        cart.totalPrice = 0;
        cart.totalQuantity = 0;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error clearing cart",
            error: error.message
        });
    }
};

// Get cart summary (items count and total)
const getCartSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId });
        
        const summary = {
            itemsCount: cart ? cart.items.length : 0,
            totalQuantity: cart ? cart.totalQuantity : 0,
            totalPrice: cart ? cart.totalPrice : 0
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching cart summary",
            error: error.message
        });
    }
};

// Validate cart items (check stock and availability)
const validateCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId })
            .populate('items.productId', 'productName price stock isActive');

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                data: { valid: true, issues: [] }
            });
        }

        const issues = [];
        let hasChanges = false;

        for (let i = cart.items.length - 1; i >= 0; i--) {
            const item = cart.items[i];
            const product = item.productId;

            if (!product) {
                // Product deleted
                cart.items.splice(i, 1);
                hasChanges = true;
                issues.push({
                    type: 'PRODUCT_DELETED',
                    message: 'Product no longer exists and was removed from cart'
                });
                continue;
            }

            if (!product.isActive) {
                // Product inactive
                cart.items.splice(i, 1);
                hasChanges = true;
                issues.push({
                    type: 'PRODUCT_INACTIVE',
                    productName: product.productName,
                    message: `${product.productName} is no longer available and was removed from cart`
                });
                continue;
            }

            if (product.stock < item.totalQuantity) {
                // Insufficient stock
                if (product.stock === 0) {
                    cart.items.splice(i, 1);
                    hasChanges = true;
                    issues.push({
                        type: 'OUT_OF_STOCK',
                        productName: product.productName,
                        message: `${product.productName} is out of stock and was removed from cart`
                    });
                } else {
                    cart.items[i].totalQuantity = product.stock;
                    cart.items[i].totalPrice = product.stock * product.price;
                    hasChanges = true;
                    issues.push({
                        type: 'QUANTITY_ADJUSTED',
                        productName: product.productName,
                        message: `${product.productName} quantity adjusted to available stock (${product.stock})`
                    });
                }
            }
        }

        if (hasChanges) {
            // Recalculate cart totals
            cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
            cart.totalQuantity = cart.items.reduce((total, item) => total + item.totalQuantity, 0);
            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: {
                valid: issues.length === 0,
                issues,
                hasChanges
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error validating cart",
            error: error.message
        });
    }
};

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    validateCart
};
