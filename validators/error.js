const Joi = require("joi");
const validate = require("./base.validator");

const nameRegex = new RegExp(/^[a-zA-Z]/);

const getErrorMessage = (validationRes) => {
    const {
        type,
        context: { label, limit, regex },
        message,
    } = validationRes.error.details[0];

    if (regex) {
        if (regex.toString() === nameRegex.toString()) {
            return `${label} must start with a character`;
        }
    }

    if (type.includes("min")) {
        return `${label} must be atleast ${limit} characters long`;
    }

    if (type.includes("max")) {
        return `${label} cannot be more than ${limit} characters long`;
    }

    if (type.includes("empty") || type.includes("required")) {
        return `${label} cannot be empty`;
    }

    if (type.includes("email")) {
        return "email must be valid";
    }

    return message;
};

module.exports = getErrorMessage;