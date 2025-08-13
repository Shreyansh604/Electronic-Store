import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import Address from "../models/address.model.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "../utils/email.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [
            { email },
            { username },
        ],
    });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        role: "user",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(400, "Something went wrong while registering user");
    }

    // Generate verification token and send email
    try {
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        await sendVerificationEmail(user, verificationToken);
    } catch (error) {
        // If email sending fails, still allow registration but log the error
        console.error('Failed to send verification email:', error.message);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(201).json(
        new ApiResponse(201, {
            user: createdUser,
            accessToken,
            refreshToken,
            message: "User registered successfully. Please check your email to verify your account."
        }, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "Email or username is required");
    }

    const user = await User.findOne(
        {
            $or: [
                { email },
                { username },
            ]
        }
    )

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: user,
                accessToken,
                refreshToken,
            }, "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(400, "User not found");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "Refresh token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refresToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(400, "Invalid refresh token");
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(201, {}, "Password cahnged successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(201, req.user, "Current user fetched successfully")
        )
})

const getUserOrdersHistory = asyncHandler(async (req, res) => {
    const userId = req.body

    const orders = await Order.find({ userId })
        .populate("items.productId", "name images price")
        .sort({ createdAt: -1 })
        .select("-__v");

    if (!orders || orders.length == 0) {
        throw new ApiError(400, "No order history found")
    }

    return res
        .status(200)
        .json(201, orders, "User order history fetched successfully")
})

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken")
        .populate("orderHistory", "-__v");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User profile fetched successfully")
        );
})

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { fullName, email },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User profile updated successfully")
        );
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User avatar updated successfully")
        );
})

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, users, "All users fetched successfully")
        );
})

const getUserById = asyncHandler(async (req, res) => {
    const userId = req.params._id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User fetched successfully")
        );
})

const updateUserStatus = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User status updated successfully")
        );
})

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "User deleted successfully")
        );
})

const addAddress = asyncHandler(async (req, res) => {
    const {
        fullName,
        phoneNumber,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        isDefault,
        addressType
    } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !postalCode || !country) {
        throw new ApiError(400, "All address fields are required");
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
        await Address.updateMany(
            { user: req.user._id, addressType: addressType || 'shipping' },
            { isDefault: false }
        );
    }

    // Create new address
    const address = await Address.create({
        user: req.user._id,
        fullName,
        phoneNumber,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false,
        addressType: addressType || 'shipping'
    });

    return res
        .status(201)
        .json(new ApiResponse(201, address, "Address added successfully"))
});

// Get all user addresses
const getUserAddresses = asyncHandler(async (req, res) => {
    const { type } = req.query; // Optional filter by addressType

    const filter = { user: req.user._id };
    if (type) {
        filter.addressType = type;
    }

    const addresses = await Address.find(filter)
        .sort({ isDefault: -1, createdAt: -1 })
        .select('-__v');

    return res
        .status(200)
        .json(new ApiResponse(200, addresses, "Addresses retrieved successfully"))
});

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const {
        fullName,
        phoneNumber,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        isDefault,
        addressType
    } = req.body;

    // Find address
    const address = await Address.findOne({
        _id: addressId,
        user: req.user._id
    });

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    // If setting as default, unset other default addresses
    if (isDefault && !address.isDefault) {
        await Address.updateMany(
            {
                user: req.user._id,
                addressType: addressType || address.addressType,
                _id: { $ne: address._id }
            },
            { isDefault: false }
        );
    }

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        {
            fullName: fullName || address.fullName,
            phoneNumber: phoneNumber || address.phoneNumber,
            streetAddress: streetAddress || address.streetAddress,
            city: city || address.city,
            state: state || address.state,
            postalCode: postalCode || address.postalCode,
            country: country || address.country,
            isDefault: isDefault !== undefined ? isDefault : address.isDefault,
            addressType: addressType || address.addressType
        },
        { new: true, runValidators: true }
    ).select('-__v');

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAddress, "Address updated successfully"))
});

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const address = await Address.findOne({
        _id: addressId,
        user: req.user._id
    });

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    await Address.findByIdAndDelete(addressId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Address deleted successfully"))
});

const getUserDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Use aggregation to get comprehensive dashboard data
    const userStats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId) // ✅ Correct syntax
            }
        },
        {
            // Lookup orders from separate Order collection
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'userId',
                as: 'orders'
            }
        },
        {
            // Lookup addresses from separate Address collection
            $lookup: {
                from: 'addresses',
                localField: '_id',
                foreignField: 'user',
                as: 'addresses'
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                isEmailVerified: 1,
                createdAt: 1,
                totalOrders: { $size: "$orders" },
                totalAddresses: { $size: "$addresses" },
                totalSpent: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$orders",
                                    cond: { $eq: ["$$this.status", "delivered"] }
                                }
                            },
                            as: "order",
                            in: "$$order.totalAmount"
                        }
                    }
                },
                recentOrders: {
                    $slice: [
                        {
                            $sortArray: {
                                input: "$orders",
                                sortBy: { "createdAt": -1 }
                            }
                        },
                        5
                    ]
                }
            }
        }
    ]);

    if (!userStats || userStats.length === 0) {
        throw new ApiError(404, "User not found");
    }

    const userData = userStats[0]; // ✅ Get first (and only) element

    const dashboardData = {
        user: {
            name: userData.fullName,
            username: userData.username,
            email: userData.email,
            isEmailVerified: userData.isEmailVerified,
            memberSince: userData.createdAt
        },
        stats: {
            totalOrders: userData.totalOrders,
            totalAddresses: userData.totalAddresses,
            totalSpent: userData.totalSpent,
            accountAge: Math.floor((Date.now() - userData.createdAt) / (1000 * 60 * 60 * 24))
        },
        recentActivity: {
            orders: userData.recentOrders
        }
    };

    return res
        .status(200)
        .json(new ApiResponse(200, dashboardData, "User dashboard fetched successfully"));
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail(user, resetToken);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, 
                    {}, 
                    "Password reset link sent to your email successfully"
                )
            );
    } catch (error) {
        // If email sending fails, clear the reset token
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Error sending password reset email. Please try again.");
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        throw new ApiError(400, "New password and confirm password are required");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password do not match");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Password reset token is invalid or has expired");
    }

    // Update password and clear reset token fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password has been reset successfully")
        );
})

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "Current password, new password, and confirm password are required");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password do not match");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isCurrentPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isCurrentPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        );
})

// Email Verification Functions

// Send verification email
const sendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Email is already verified"));
    }

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user, verificationToken);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Verification email sent successfully"));
    } catch (error) {
        // Reset token fields if email sending fails
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Failed to send verification email. Please try again.");
    }
});

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError(400, "Email verification token is required");
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Email verification token is invalid or has expired");
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    
    await user.save({ validateBeforeSave: false });

    // Send welcome email (optional)
    try {
        await sendWelcomeEmail(user);
    } catch (error) {
        console.log("Failed to send welcome email:", error.message);
        // Don't fail the verification if welcome email fails
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Email verified successfully"));
});

// Check verification status
const getEmailVerificationStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("isEmailVerified email");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {
            isEmailVerified: user.isEmailVerified,
            email: user.email
        }, "Verification status retrieved successfully"));
});

// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Email is already verified"));
    }

    // Check if user has requested verification recently (rate limiting)
    if (user.emailVerificationExpiry && user.emailVerificationExpiry > Date.now()) {
        const timeLeft = Math.ceil((user.emailVerificationExpiry - Date.now()) / 1000 / 60);
        return res
            .status(429)
            .json(new ApiResponse(429, null, `Please wait ${timeLeft} minutes before requesting a new verification email`));
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user, verificationToken);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Verification email sent successfully"));
    } catch (error) {
        // Reset token fields if email sending fails
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Failed to send verification email. Please try again.");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateProfile,
    getUserOrdersHistory,
    getUserProfile,
    updateAvatar,
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    addAddress,
    getUserAddresses,
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
}
