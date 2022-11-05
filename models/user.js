const mongoose = require("mongoose");

// user schema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true,
        },
        userPassword: {
            type: String,
            required: true,
        },
        nmcc: {
            type: Number,
            required: false,
            default: null,
        },
        role: {
            type: String,
            required: true,
        },
        resetPasswordlink: {
            data: String,
            default: "",
        },
        verificationCode: {
            type: Number,
            required: true,
            default: 0000,
        },
        verified: {
            default: false,
            type: Boolean,
        },
        approved: {
            default: false,
            type: Boolean,
        },
        approvalRequest: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
