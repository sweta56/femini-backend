const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = (recipientEmail, subject, bodyType, body) => {
    const emailData = {
        from: process.env.EMAIL_FROM,
        to: recipientEmail,
        subject,
    };
    emailData[bodyType] = body;

    sgMail
        .send(emailData)
        .then((sent) => {})
        .catch((err) => {
            console.log(err);
        });
};
