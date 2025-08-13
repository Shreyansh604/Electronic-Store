import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts,
    updateProductStock
} from '../controllers/product.controller.js';
import { verifyJWT, verifyAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.route('/').get(getAllProducts);
router.route('/search').get(searchProducts);
router.route('/:id').get(getProductById);
router.route('/category/:categoryId').get(getProductsByCategory);

// Protected routes (authentication required)
// Admin only routes for product management
router.route('/').post(
    verifyJWT,
    verifyAdmin,
    upload.single('image'),
    createProduct
);
router.route('/:id').put(verifyJWT, verifyAdmin, updateProduct);
router.route('/:id').delete(verifyJWT, verifyAdmin, deleteProduct);
router.route('/:id/stock').patch(verifyJWT, verifyAdmin, updateProductStock);

export default router;
