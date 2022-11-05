const Joi = require("joi");
const validate = require("./base.validator.js");

const signupSchema = Joi.object({
    username: Joi.string().min(5).max(30).required().trim(),
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(7).required().trim(),
});

const signinSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(7).required().trim(),
});

const nmccSchema = Joi.object({
    nmcc: Joi.number().positive().required(),
});

const ForgotSchema = Joi.object({
    email: Joi.string().email().required().trim(),
});

const ResetSchema = Joi.object({
    password: Joi.string().min(7).required().trim(),
});

const validateUserSignup = (userInfo, role) => {
    let errorMsg = "";

    if (role === "doctor") {
        errorMsg = validate({ nmcc: userInfo.nmcc }, nmccSchema);
    }

    if (errorMsg) {
        return errorMsg;
    } else {
        return validate(userInfo, signupSchema);
    }
};

const validateUserSignin = (userInfo) => {
    return validate(userInfo, signinSchema);
};

const validateForgot = (userInfo) => {
    return validate(userInfo, ForgotSchema);
};

const validateReset = (userInfo) => {
    return validate(userInfo, ResetSchema);
};

module.exports = {
    validateUserSignup,
    validateUserSignin,
    validateForgot,
    validateReset,
};
