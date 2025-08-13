import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryTree,
    getRootCategories
} from '../controllers/category.controller.js';
import { verifyJWT, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.route('/').get(getAllCategories);
router.route('/roots').get(getRootCategories);
router.route('/tree/:id').get(getCategoryTree);

// Protected routes for admin
router.route('/').post(verifyJWT, verifyAdmin, createCategory);
router.route('/:id').put(verifyJWT, verifyAdmin, updateCategory);
router.route('/:id').delete(verifyJWT, verifyAdmin, deleteCategory);
router.route('/:id').get(getCategoryById);

export default router;

