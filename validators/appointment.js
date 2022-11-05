const Joi = require("joi");
const validate = require("./base.validator.js");

const appointmentSchema = Joi.object({
    patientPhone: Joi.number().min(1111111111).max(9999999999).required(),
});

const validateAppointment = (appointmentInfo) => {
    return validate(appointmentInfo, appointmentSchema);
};

module.exports = {
    validateAppointment,
};
