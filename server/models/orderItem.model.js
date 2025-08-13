import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        productImage: {
            type: String
        },
        productSku: {
            type: String
        },
        discount: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
            default: "pending"
        },
        returnRequested: {
            type: Boolean,
            default: false
        },
        returnReason: {
            type: String
        },
        returnStatus: {
            type: String,
            enum: ["none", "requested", "approved", "rejected", "completed"],
            default: "none"
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better query performance
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });
orderItemSchema.index({ orderId: 1, productId: 1 });

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
