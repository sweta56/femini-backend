const sgMail = require("@sendgrid/mail");
const { sendEmail } = require("../lib/email");

const User = require("../models/user");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getUsers = async (req, res) => {
    try {
        const data = await User.find({});
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: "a server error occured" });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: "provide a userId" });
    }

    try {
        const user = await User.findByIdAndDelete(userId);

        if (user) {
            sendEmail(
                user.email,
                "Account deletion",
                "html",
                "<p>Your account in Femini has been deleted by the admin</p>"
            );
        }

        res.json({ message: "user has been deleted" });
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: "a server error occured" });
    }
};

exports.controlDoctorStatus = async (req, res) => {
    const doctorId = req.params.doctorId;
    const action = req.query.action;

    if (action !== "appr" && action !== "rej") {
        return res.status(400).json({ error: "invalid action" });
    }

    try {
        const doctor = await User.findOne({ _id: doctorId, role: "doctor" });

        if (!doctor) {
            return res.status(404).json({ error: "doctor not found" });
        }

        if (doctor.approved || !doctor.approvalRequest) {
            return res.status(400).json({
                error: `the doctor has already been ${
                    doctor.approved ? "approved" : "rejected"
                }`,
            });
        }

        let updateInfo = {};

        if (action === "appr") {
            updateInfo = {
                approved: true,
            };
        } else {
            updateInfo = {
                approvalRequest: false,
            };
        }

        await User.findByIdAndUpdate(doctor.id, updateInfo);

        res.json({
            message: `the doctor has been ${
                action === "appr" ? "approved" : "rejected"
            }`,
        });
    } catch (error) {
        return res.status(500).json({ error: "a server error occured" });
    }
};
