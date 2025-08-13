import { ApiError } from '../utils/ApiError.js';

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new ApiError(404, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ApiError(400, message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new ApiError(401, message);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new ApiError(401, message);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Unhandled Rejection: ${err.message}`);
        // Close server & exit process
        // server.close(() => {
        //     process.exit(1);
        // });
    });
};

// Handle uncaught exceptions
export const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        console.log(`Uncaught Exception: ${err.message}`);
        console.log('Shutting down the server due to Uncaught Exception');
        process.exit(1);
    });
};
