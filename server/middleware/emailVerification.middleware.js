import { ApiError } from "../utils/ApiError.js";

// Middleware to check if user's email is verified
export const requireEmailVerification = (req, res, next) => {
    // Check if user is authenticated and email is verified
    if (req.user && !req.user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email address to access this resource");
    }
    
    next();
};

// Middleware to add verification status to response
export const addVerificationStatus = (req, _, next) => {
    // Add verification status to user object for client
    if (req.user) {
        req.user.needsEmailVerification = !req.user.isEmailVerified;
    }
    
    next();
};
