import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            totalQuantity: {
                type: Number,
                required: true,
            },
            totalPrice: {
                type: Number,
                required: true,
            },
        }],
        totalPrice: {
            type: Number,
            required: true,
        },
        totalQuantity: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true
    }
);

export const Cart = mongoose.model("Cart", cartSchema);
