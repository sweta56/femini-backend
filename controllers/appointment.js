const User = require("../models/user");
const Appointment = require("../models/appointment");
const { validateAppointment } = require("../validators/appointment");

const createAppointment = async (req, res) => {
    const doctorId = req.params.doctorId;
    const { patientPhone } = req.body;
    const user = req.user;

    const errorMsg = validateAppointment({ patientPhone });

    if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
    }

    try {
        // check to see if the doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: "doctor" });

        if (!doctor) {
            return res.status(404).json({ error: "doctor not found" });
        }

        // check to see if the doctor has been approved
        if (!doctor.approved) {
            return res
                .status(404)
                .json({ error: "the doctor has not been approved yet" });
        }

        let appointment = new Appointment({
            patientPhone,
            patient: user._id,
            doctor: doctor._id,
        });

        appointment = await Appointment.create(appointment);

        res.json({ appointment });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: "a server error occured" });
    }
};

const controlAppointment = async (req, res) => {
    const appointmentId = req.params.appointmentId;
    const action = req.query.action;
    const user = req.user;

    if (action !== "acc" && action !== "rej") {
        return res.status(400).send({ error: "invalid action" });
    }

    try {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "appointment not found" });
        }

        if (appointment.doctor.toString() != user._id) {
            return res.status(401).json({
                error: "you are unauthorized to control this appointment",
            });
        }

        //appointment should have status pending to be accepted or rejected
        if (appointment.status !== "pending") {
            return res.status(400).send({
                error: `the appointment has already been ${appointment.status}`,
            });
        }

        await Appointment.findByIdAndUpdate(appointmentId, {
            status: action === "acc" ? "accepted" : "rejected",
        });

        res.json({
            message: `the appointment has been ${
                action === "acc" ? "accepted" : "rejected"
            }`,
        });
    } catch (error) {
        res.status(500).json({ error: "a server error occured" });
    }
};

const deleteAppointment = async (req, res) => {
    const appointmentId = req.params.appointmentId;
    const user = req.user;

    try {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "appointment not found" });
        }

        if (appointment[user.role].toString() != req.user._id) {
            return res.status(401).json({
                error: "you are unauthorized to delete this appointment",
            });
        }

        if (
            (user.role === "patient" && appointment.status === "accepted") ||
            (user.role === "doctor" && appointment.status === "pending")
        ) {
            return res.status(400).send({
                error:
                    user.role === "patient"
                        ? `the appointment has already been accepted`
                        : `the appointment is still pending`,
            });
        }

        await Appointment.findByIdAndDelete(appointmentId);

        res.json({ message: "the appointment has been deleted" });
    } catch (error) {
        res.status(500).json({ error: "a server error occured" });
    }
};

const getAppointments = async (req, res) => {
    const user = req.user;

    try {
        const appointments = await Appointment.find({
            [user.role]: user._id,
        }).populate([{ path: "patient" }, { path: "doctor" }]);

        let filteredAppointments = {
            pending: [],
            accepted: [],
            rejected: [],
        };

        appointments.forEach((appointment) => {
            filteredAppointments[appointment.status].push(appointment);
        });

        res.json({ appointments: filteredAppointments });
    } catch (error) {
        res.status(500).json({ error: "a server error occured" });
    }
};

module.exports = {
    createAppointment,
    controlAppointment,
    deleteAppointment,
    getAppointments,
};
