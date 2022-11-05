const express = require("express");

const { auth } = require("../middleware/auth");
const {
    createAppointment,
    controlAppointment,
    deleteAppointment,
    getAppointments,
} = require("../controllers/appointment");

const router = express.Router();

router.post(
    "/:doctorId",
    (req, res, next) => {
        req.role = "patient";
        auth(req, res, next);
    },
    createAppointment
);

router.patch(
    "/:appointmentId",
    (req, res, next) => {
        req.role = "doctor";
        auth(req, res, next);
    },
    controlAppointment
);

router.delete("/:appointmentId", auth, deleteAppointment);

router.get("/", auth, getAppointments);

module.exports = router;
