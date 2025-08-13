import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  getUserProfile,
  updateProfile,
  updateAvatar,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getUserDashboard,
  forgotPassword,
  resetPassword,
  changePassword,
  sendEmailVerification,
  verifyEmail,
  getEmailVerificationStatus,
  resendVerificationEmail
} from '../controllers/user.controller.js';
import { verifyJWT, verifyAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = express.Router();

// Authentication Routes
router.route('/register').post(
  // upload.fields([
  //   {
  //     name: "avatar",
  //     maxCount: 1
  //   }
  // ]),
  registerUser
);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);

// Password Management
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);
router.route('/change-password').post(verifyJWT, changePassword);

// User Profile Routes
router.route('/profile').get(verifyJWT, getUserProfile);
router.route('/profile').put(verifyJWT, updateProfile);
router.route('/avatar').put(verifyJWT, upload.single('avatar'), updateAvatar);

// User Management (Admin only)
router.route('/all').get(verifyJWT, verifyAdmin, getAllUsers);
router.route('/:id').get(verifyJWT, verifyAdmin, getUserById);
router.route('/:id/status').put(verifyJWT, verifyAdmin, updateUserStatus);
router.route('/:id').delete(verifyJWT, verifyAdmin, deleteUser);

// User Dashboard
router.route('/dashboard/stats').get(verifyJWT, getUserDashboard);

// Email Verification Routes
router.route('/email/send-verification').post(verifyJWT, sendEmailVerification);
router.route('/email/verify/:token').get(verifyEmail); // Public route
router.route('/email/verification-status').get(verifyJWT, getEmailVerificationStatus);
router.route('/email/resend-verification').post(verifyJWT, resendVerificationEmail);

// Address Management
router.route('/addresses').get(verifyJWT, getUserAddresses);
router.route('/addresses').post(verifyJWT, addAddress);
router.route('/addresses/:addressId').put(verifyJWT, updateAddress);
router.route('/addresses/:addressId').delete(verifyJWT, deleteAddress);

export default router;
