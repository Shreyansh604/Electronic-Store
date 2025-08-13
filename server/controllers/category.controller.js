import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import mongoose from 'mongoose';

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description, parentId, isActive } = req.body;

        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // Validate parent category if provided
        if (parentId) {
            if (!mongoose.Types.ObjectId.isValid(parentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID"
                });
            }

            const parentCategory = await Category.findById(parentId);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Parent category not found"
                });
            }
        }

        const category = new Category({
            name: name.trim(),
            description,
            parentId: parentId || null,
            isActive: isActive !== undefined ? isActive : true
        });

        await category.save();

        const populatedCategory = await Category.findById(category._id)
            .populate('parentId', 'name');

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: populatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating category",
            error: error.message
        });
    }
};

// Get all categories with hierarchy
const getAllCategories = async (req, res) => {
    try {
        const { 
            includeInactive = false, 
            flat = false,
            page = 1,
            limit = 50,
            search
        } = req.query;

        // Build filter
        const filter = {};
        if (!includeInactive || includeInactive === 'false') {
            filter.isActive = true;
        }
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        if (flat === 'true') {
            // Return flat list with pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const categories = await Category.find(filter)
                .populate('parentId', 'name')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit));

            const totalCategories = await Category.countDocuments(filter);
            const totalPages = Math.ceil(totalCategories / parseInt(limit));

            res.status(200).json({
                success: true,
                data: categories,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCategories,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            });
        } else {
            // Return hierarchical structure
            const categories = await Category.find(filter)
                .populate('parentId', 'name')
                .sort({ name: 1 });

            // Build hierarchy
            const categoryMap = new Map();
            const rootCategories = [];

            // First pass: create map of all categories
            categories.forEach(category => {
                categoryMap.set(category._id.toString(), {
                    ...category.toObject(),
                    children: []
                });
            });

            // Second pass: build hierarchy
            categories.forEach(category => {
                const categoryObj = categoryMap.get(category._id.toString());
                
                if (category.parentId) {
                    const parent = categoryMap.get(category.parentId._id.toString());
                    if (parent) {
                        parent.children.push(categoryObj);
                    } else {
                        rootCategories.push(categoryObj);
                    }
                } else {
                    rootCategories.push(categoryObj);
                }
            });

            res.status(200).json({
                success: true,
                data: rootCategories
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id)
            .populate('parentId', 'name description');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Get subcategories
        const subcategories = await Category.find({ parentId: id, isActive: true })
            .select('name description isActive');

        // Get product count
        const productCount = await Product.countDocuments({ 
            category: id, 
            isActive: true 
        });

        res.status(200).json({
            success: true,
            data: {
                ...category.toObject(),
                subcategories,
                productCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching category",
            error: error.message
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        // Check if trying to set self as parent
        if (updateData.parentId && updateData.parentId === id) {
            return res.status(400).json({
                success: false,
                message: "Category cannot be its own parent"
            });
        }

        // Validate parent category if provided
        if (updateData.parentId) {
            if (!mongoose.Types.ObjectId.isValid(updateData.parentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID"
                });
            }

            const parentCategory = await Category.findById(updateData.parentId);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Parent category not found"
                });
            }

            // Check for circular reference
            const isCircular = await checkCircularReference(id, updateData.parentId);
            if (isCircular) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot create circular reference in category hierarchy"
                });
            }
        }

        // Check if name already exists (excluding current category)
        if (updateData.name) {
            const existingCategory = await Category.findOne({ 
                name: updateData.name.trim(),
                _id: { $ne: id }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category with this name already exists"
                });
            }
            updateData.name = updateData.name.trim();
        }

        const category = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('parentId', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message
        });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { force = false } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check for subcategories
        const subcategoriesCount = await Category.countDocuments({ parentId: id });
        if (subcategoriesCount > 0 && force !== 'true') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with subcategories. Use force=true to delete all subcategories.",
                subcategoriesCount
            });
        }

        // Check for products
        const productsCount = await Product.countDocuments({ category: id });
        if (productsCount > 0 && force !== 'true') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with products. Use force=true to remove category from products.",
                productsCount
            });
        }

        if (force === 'true') {
            // Delete all subcategories recursively
            await deleteSubcategoriesRecursive(id);
            
            // Remove category from all products
            await Product.updateMany(
                { category: id },
                { $pull: { category: id } }
            );
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: error.message
        });
    }
};

// Get category tree (specific category with all its descendants)
const getCategoryTree = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id).populate('parentId', 'name');
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Get all descendants
        const descendants = await getCategoryDescendants(id);
        
        res.status(200).json({
            success: true,
            data: {
                category,
                descendants
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching category tree",
            error: error.message
        });
    }
};

// Get root categories only
const getRootCategories = async (req, res) => {
    try {
        const { includeInactive = false } = req.query;

        const filter = { parentId: null };
        if (!includeInactive || includeInactive === 'false') {
            filter.isActive = true;
        }

        const categories = await Category.find(filter)
            .sort({ name: 1 });

        // Get subcategory counts for each root category
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const subcategoryCount = await Category.countDocuments({ 
                    parentId: category._id,
                    isActive: true 
                });
                const productCount = await Product.countDocuments({ 
                    category: category._id,
                    isActive: true 
                });
                
                return {
                    ...category.toObject(),
                    subcategoryCount,
                    productCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: categoriesWithCounts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching root categories",
            error: error.message
        });
    }
};

// Helper function to check circular reference
const checkCircularReference = async (categoryId, parentId) => {
    let currentParentId = parentId;
    const visited = new Set();

    while (currentParentId) {
        if (visited.has(currentParentId)) {
            return true; // Circular reference detected
        }
        
        if (currentParentId === categoryId) {
            return true; // Would create circular reference
        }

        visited.add(currentParentId);
        
        const parent = await Category.findById(currentParentId);
        currentParentId = parent ? parent.parentId : null;
    }

    return false;
};

// Helper function to get all descendants of a category
const getCategoryDescendants = async (categoryId) => {
    const descendants = [];
    const queue = [categoryId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await Category.find({ parentId: currentId, isActive: true });
        
        for (const child of children) {
            descendants.push(child);
            queue.push(child._id);
        }
    }

    return descendants;
};

// Helper function to delete subcategories recursively
const deleteSubcategoriesRecursive = async (categoryId) => {
    const subcategories = await Category.find({ parentId: categoryId });
    
    for (const subcategory of subcategories) {
        await deleteSubcategoriesRecursive(subcategory._id);
        await Category.findByIdAndDelete(subcategory._id);
        
        // Remove from products
        await Product.updateMany(
            { category: subcategory._id },
            { $pull: { category: subcategory._id } }
        );
    }
};

export {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryTree,
    getRootCategories
};
