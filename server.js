const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// connect to db
mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// app middlewares
app.use(cors());
app.use(express.json());

// middleware
app.use("/api/auth", require("./routes/auth"));
app.use("/api/appointments", require("./routes/appointment"));
app.use("/api/users", require("./routes/user"));

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});
