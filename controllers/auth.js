const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
    validateUserSignup,
    validateUserSignin,
    validateForgot,
    validateReset,
} = require("../validators/user.validator");
// sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//signup routing
exports.signup = async (req, res) => {
    const { username, email, password, role, nmcc } = req.body;


    // validate user info
    const errorMsg = validateUserSignup(
        { username, email, password, nmcc },
        role
    );

    if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
    }

    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ error: "email is already in use" });
        }

        //hashing the password

        const salt = await bcrypt.genSalt(9);
        const hash = await bcrypt.hash(password, salt);

        const verificationCode =
            Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

        const newUser = new User({
            username,
            email,
            nmcc: parseInt(nmcc) || null,
            userPassword: hash,
            role: role || "patient",
            verificationCode: parseInt(verificationCode),
        });
        const createdUser = await newUser.save();

        // create a jwt token
        const token = jwt.sign(
            { _id: createdUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `<p>
                Welcome to Femini. Please use the following verification code to activate your account: ${verificationCode}
            </p>`,
        };
        sgMail
            .send(emailData)
            .then((sent) => {})
            .catch((err) => {
                console.log(err);
            });

        res.json({ user: createdUser, token });
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: "a server error occured" });
    }
};

exports.verifyAccount = async (req, res) => {
    let { verificationCode } = req.body;
    const user = req.user;
    verificationCode = parseInt(verificationCode);

    try {
        if (user.verificationCode === verificationCode) {
            await User.findOneAndUpdate({ _id: user._id }, { verified: true });
            res.json({ message: "your account has been verified" });
            console.log(verificationCode);
        } else {
            res.status(400).json({
                error: "the verification code you provided is incorrect",
            });
        }
    } catch (error) {
        res.status(500).json({ error: "a server error occured" });
    }
};

//SignIn routing
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    // validate user info
    const errorMsg = validateUserSignin({ email, password });

    if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
    }

    try {
        // check if the user with the given email exists
        const user = await User.findOne({ email: email });

        if (!user) {
            return res
                .status(400)
                .json({ error: "email or password is incorrect" });
        }

        //validating user password
        const validPassword = await bcrypt.compare(password, user.userPassword);

        if (!validPassword) {
            return res
                .status(400)
                .json({ error: "email or password is incorrect" });
        }

        // create a jwt token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        res.json({ user, token });
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: "a server error occured" });
    }
};

//Activation routing
exports.accountActivation = (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(
            token,
            process.env.JWT_ACCOUNT_ACTIVATION,
            function (err, decoded) {
                if (err) {
                    console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
                    return res.status(401).json({
                        error: "Expired link. Signup again",
                    });
                }

                const { name, email, password, role } = jwt.decode(token);

                const user = new User({ name, email, password });

                user.save((err, user) => {
                    if (err) {
                        console.log(
                            "SAVE USER IN ACCOUNT ACTIVATION ERROR",
                            err
                        );
                        return res.status(401).json({
                            error: "Error saving user in database. Try signup again",
                        });
                    }
                    return res.json({
                        error: "Signup success. Please signin.",
                    });
                });
            }
        );
    } else {
        return res.json({
            error: "Something went wrong. Try again.",
        });
    }
};

exports.adminMiddleware = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            res.json({
                error: "User not found.Please Signup",
            });
        }
        if (user.role !== "doctor") {
            return res.json({
                error: "Admin resource.Acess denied.",
            });
        }
        req.profile = user;
        next();
    });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    // validate user info
    const errorMsg = validateForgot({ email });

    if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
    }

    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User with this email doesnot exist",
            });
        }

        const token = jwt.sign(
            { _id: user._id, name: user.name },
            process.env.JWT_RESET_PASSWORD,
            {
                expiresIn: "10m",
            }
        );

        return user
            .updateOne({ resetPasswordlink: token })
            .exec((err, sucess) => {
                if (err) {
                    return res.status(400).json({
                        error: "Database connection error!",
                    });
                } else {
                    const emailData = {
                        from: process.env.EMAIL_FROM,
                        to: email,
                        subject: `Password reset link`,
                        html: `<h2>please use this link to reset your account password</h2>
                                   <h4>${process.env.CLIENT_URL}/auth/password/reset/${token}</h4>
                                    <hr/>
                                    <p>please donot share this link to anyone</p>
                                    <p>${process.env.CLIENT_URL}</p>
                                  `,
                    };
                    sgMail
                        .send(emailData)
                        .then((sent) => {
                            return res.json({
                                message: `Email has been sent to ${email}.Follow the instruction to reset your password.`,
                            });
                        })
                        .catch((err) => console.error(err));
                }
            });
    });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordlink, newPassword } = req.body;
    // validate user info
    const errorMsg = validateReset({ newPassword });

    if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
    }
    if (resetPasswordlink) {
        jwt.verify(
            resetPasswordlink,
            process.env.JWT_RESET_PASSWORD,
            (err, decode) => {
                if (err) {
                    return res.status(400).json({
                        error: "Expired Link.Try Again!",
                    });
                } else {
                    User.findOne({ resetPasswordlink }).exec((err, user) => {
                        if (err || !user) {
                            return res.status(400).json({
                                error: "Something went wrong.Try Again!",
                            });
                        }
                        const updatedFields = {
                            password: newPassword,
                            resetPasswordlink: "",
                        };
                        user = _.extend(user, updatedFields);
                        user.save((err, sucess) => {
                            if (err) {
                                return res.status(401).json({
                                    error: "Error.please try again",
                                });
                            }
                            return res.status(200).json({
                                message:
                                    "Great.now you can login to your account.",
                            });
                        });
                    });
                }
            }
        );
    } else {
        return res.status(400).json({
            error: "Something went wrong.Try Again!",
        });
    }
};
