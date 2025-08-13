import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: [Schema.Types.ObjectId],
            ref: "Category",
            required: true,
        },
        brand: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
        },
        stock: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
        }
    },
    {
        timestamps: true,
    }
)

export const Product = mongoose.model("Product", productSchema);