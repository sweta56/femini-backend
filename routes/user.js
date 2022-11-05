const router = require("express").Router();

const { auth } = require("../middleware/auth");

const {
    getUsers,
    deleteUser,
    controlDoctorStatus,
} = require("../controllers/user");

router.get(
    "/",
    (req, res, next) => {
        req.role = "admin";
        auth(req, res, next);
    },
    getUsers
);

router.delete(
    "/:userId",
    (req, res, next) => {
        req.role = "admin";
        auth(req, res, next);
    },
    deleteUser
);

router.patch(
    "/:doctorId",
    (req, res, next) => {
        req.role = "admin";
        auth(req, res, next);
    },
    controlDoctorStatus
);

module.exports = router;
