import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        orderNumber: {
            type: String,
            unique: true,
            required: true
        },
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
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
            }
        }],
        subtotal: {
            type: Number,
            required: true
        },
        shippingFee: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        },
        totalQuantity: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
            default: "pending",
            index: true
        },
        shippingAddress: {
            fullName: {
                type: String,
                required: true
            },
            phoneNumber: {
                type: String,
                required: true
            },
            streetAddress: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            }
        },
        billingAddress: {
            fullName: String,
            phoneNumber: String,
            streetAddress: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            sameAsShipping: {
                type: Boolean,
                default: true
            }
        },
        paymentMethod: {
            type: String,
            enum: ["cash_on_delivery", "credit_card", "debit_card", "upi", "net_banking", "wallet"],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
            default: "pending",
            index: true
        },
        paymentId: {
            type: String // For external payment gateway IDs
        },
        expectedDeliveryDate: {
            type: Date
        },
        actualDeliveryDate: {
            type: Date
        },
        trackingNumber: {
            type: String
        },
        notes: {
            type: String
        },
        cancellationReason: {
            type: String
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        refundReason: {
            type: String
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
    next();
});

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
