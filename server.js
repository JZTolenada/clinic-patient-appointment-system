require("dotenv").config();

const patientRoutes = require("./routes/PatientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const express= require("express");
const mongoose= require("mongoose");

const app= express();

app.use(express.json());
app.use(express.static("public"));
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);

const PORT= process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/clinic")
    .then(() => {
            console.log("Mongoose connected...")

            app.listen(PORT,"0.0.0.0", () => {
                console.log(`Server is running on port ${PORT}`);
            })
    })

    .catch ((err) => {
        console.log("Error:", err);
    })



