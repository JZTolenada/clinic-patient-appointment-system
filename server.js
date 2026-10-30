const patientRoutes = require("./routes/PatientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const express= require("express");
const mongoose= require("mongoose");

const app= express();

app.use(express.json());
app.use(express.static("public"));
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);

mongoose.connect("mongodb://localhost:27017/clinic")
    .then(() => {
            console.log("Mongoose connected...")

            app.listen(3000, () => {
                console.log("Server is running...")
            })
    })

    .catch ((err) => {
        console.log("Error:", err);
    })



