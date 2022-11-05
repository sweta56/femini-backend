const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        patientPhone: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            default: "pending",
        },
        patient: {
            type: mongoose.ObjectId,
            ref: "User",
        },
        doctor: {
            type: mongoose.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
