const express = require("express");
const { auth } = require("../middleware/auth");
const {
    signup,
    accountActivation,
    signin,
    forgotPassword,
    resetPassword,
    verifyAccount,
} = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/account-activation", accountActivation);
router.post("/signin", signin);
router.post("/verify", auth, verifyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
