import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, _, next) => { // Unused parameter can be replaced with _ to indicate it's not used
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        // Assuming user model has a role field or isAdmin field
        // Adjust this according to your user model structure
        if (req.user.role !== 'admin' && !req.user.isAdmin) {
            throw new ApiError(403, "Admin access required");
        }

        next();
    } catch (error) {
        throw new ApiError(403, error?.message || "Admin access required");
    }
});
