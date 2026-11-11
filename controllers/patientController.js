const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

const createPatient = async (req, res) => {
    try {
        const { firstName, middleName, lastName, age, sex, phone } = req.body;

        if (!firstName || firstName.trim() === "") {
            return res.status(400).json({ message: "First name is required." });
        }
        if (!middleName || middleName.trim() === "") {
            return res.status(400).json({ message: "Middle name is required." });
        }
        if (!lastName || lastName.trim() === "") {
            return res.status(400).json({ message: "Last name is required." });
        }
        if (!phone || phone.length !== 11 || !phone.startsWith("09")) {
            return res.status(400).json({ message: "Contact number must be an 11-digit number starting with 09." });
        }
        if (!age || isNaN(age) || age < 1 || age > 120) {
            return res.status(400).json({ message: "Age must be between 1 and 120." });
        }
        if (!sex || sex.trim() === "") {
            return res.status(400).json({ message: "Gender is required." });
        }

        const patient = new Patient({
            firstName: firstName.trim(),
            middleName: middleName.trim(),
            lastName: lastName.trim(),
            age: Number(age),
            sex: sex,
            phone: phone
        });

        await patient.save();

        res.status(201).json({
            message: "Patient registered successfully.",
            patient: patient
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to register patient."
        });
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve patients."
        });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve patient."
        });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { firstName, middleName, lastName, age, sex, phone } = req.body;

        if (!firstName || firstName.trim() === "") {
            return res.status(400).json({ message: "First name is required." });
        }
        if (!middleName || middleName.trim() === "") {
            return res.status(400).json({ message: "Middle name is required." });
        }
        if (!lastName || lastName.trim() === "") {
            return res.status(400).json({ message: "Last name is required." });
        }
        if (!phone || phone.length !== 11 || !phone.startsWith("09")) {
            return res.status(400).json({ message: "Contact number must be an 11-digit number starting with 09." });
        }
        if (!age || isNaN(age) || age < 1 || age > 120) {
            return res.status(400).json({ message: "Age must be between 1 and 120." });
        }
        if (!sex || sex.trim() === "") {
            return res.status(400).json({ message: "Gender is required." });
        }

        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            {
                firstName: firstName.trim(),
                middleName: middleName.trim(),
                lastName: lastName.trim(),
                age: Number(age),
                sex: sex,
                phone: phone
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        res.status(200).json({
            message: "Patient updated successfully.",
            patient: patient
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update patient."
        });
    }
};

const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        await Appointment.deleteMany({ patientId: req.params.id });

        return res.status(200).json({
            message: "Patient deleted successfully."
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete patient."
        });
    }
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
