const getErrorMessage = require("./error");

const validate = (data, schema) => {
    const validationRes = schema.validate(data, { allowUnknown: true });

    if (validationRes.error) {
        return getErrorMessage(validationRes);
    }
};

module.exports = validate;