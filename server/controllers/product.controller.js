import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import mongoose from 'mongoose';

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { productName, description, price, category, brand, image, stock, isActive } = req.body;

        // Check if product already exists
        const existingProduct = await Product.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product with this name already exists"
            });
        }

        // Validate category exists
        if (category && category.length > 0) {
            const categoryExists = await Category.find({ _id: { $in: category } });
            if (categoryExists.length !== category.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more categories don't exist"
                });
            }
        }

        const product = new Product({
            productName,
            description,
            price,
            category,
            brand,
            image,
            stock,
            isActive: isActive !== undefined ? isActive : true
        });

        await product.save();
        
        const populatedProduct = await Product.findById(product._id).populate('category', 'name');

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message
        });
    }
};

// Get all products with filtering, sorting, and pagination
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            isActive
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (category) filter.category = { $in: Array.isArray(category) ? category : [category] };
        if (brand) filter.brand = new RegExp(brand, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$or = [
                { productName: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Validate category if provided
        if (updateData.category && updateData.category.length > 0) {
            const categoryExists = await Category.find({ _id: { $in: updateData.category } });
            if (categoryExists.length !== updateData.category.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more categories don't exist"
                });
            }
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find({ 
            category: categoryId,
            isActive: true 
        })
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments({ 
            category: categoryId,
            isActive: true 
        });
        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products by category",
            error: error.message
        });
    }
};

// Search products
const searchProducts = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find({
            $and: [
                {
                    $or: [
                        { productName: new RegExp(q, 'i') },
                        { description: new RegExp(q, 'i') },
                        { brand: new RegExp(q, 'i') }
                    ]
                },
                { isActive: true }
            ]
        })
            .populate('category', 'name')
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments({
            $and: [
                {
                    $or: [
                        { productName: new RegExp(q, 'i') },
                        { description: new RegExp(q, 'i') },
                        { brand: new RegExp(q, 'i') }
                    ]
                },
                { isActive: true }
            ]
        });

        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error searching products",
            error: error.message
        });
    }
};

// Update product stock
const updateProductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid stock value"
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { stock },
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product stock updated successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product stock",
            error: error.message
        });
    }
};

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts,
    updateProductStock
};
