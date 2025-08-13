import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import orderItemRoutes from './routes/orderItem.routes.js';
import healthRoutes from './routes/health.routes.js';
import { generalLimiter, authLimiter, orderLimiter, helmetConfig } from './middleware/security.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Security middleware
app.use(helmetConfig);
app.use(generalLimiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Health check routes (no rate limiting)
app.use('/', healthRoutes);

// Routes with specific rate limiting
app.use('/api/users', authLimiter, userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/order-items', orderItemRoutes);

app.get('/', (req, res) => res.status(200).send('API is running...'));

// Global error handler (must be last)
app.use(errorHandler);

export { app };
