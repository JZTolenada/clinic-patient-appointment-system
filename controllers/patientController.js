const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

const nameRegex = /^[A-Za-z\s\-'.]+$/;
const phoneRegex = /^09\d{9}$/;

const validatePatientData = (firstName, middleName, lastName, age, sex, phone) => {
    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2 || !nameRegex.test(firstName.trim())) {
        return "First name is required, must only contain letters, and be at least 2 characters long.";
    }

    if (!middleName || typeof middleName !== "string" || middleName.trim().length < 1 || !nameRegex.test(middleName.trim())) {
        return "Middle name is required and must only contain letters.";
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2 || !nameRegex.test(lastName.trim())) {
        return "Last name is required, must only contain letters, and be at least 2 characters long.";
    }

    const cleanPhone = (phone || "").toString().replace(/[\s\-]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
        return "Contact number must be an 11-digit mobile number starting with 09 (e.g., 09123456789).";
    }

    const ageNum = Number(age);
    if (age === undefined || age === null || isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 125) {
        return "Age must be a valid whole number between 0 and 125.";
    }

    if (sex !== "Male" && sex !== "Female") {
        return "Gender must be either Male or Female.";
    }

    return null;
};

const createPatient = async (req, res) => {
    try {
        const { firstName, middleName, lastName, age, sex, phone } = req.body;

        const validationError = validatePatientData(firstName, middleName, lastName, age, sex, phone);
        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const cleanPhone = phone.toString().replace(/[\s\-]/g, "");
        const ageNum = parseInt(age);

        const patient = new Patient({
            firstName: firstName.trim(),
            middleName: middleName.trim(),
            lastName: lastName.trim(),
            age: ageNum,
            sex: sex,
            phone: cleanPhone
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

        const validationError = validatePatientData(firstName, middleName, lastName, age, sex, phone);
        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const cleanPhone = phone.toString().replace(/[\s\-]/g, "");
        const ageNum = parseInt(age);

        const patient = await Patient.findByIdAndUpdate(req.params.id,
            {
                firstName: firstName.trim(),
                middleName: middleName.trim(),
                lastName: lastName.trim(),
                age: ageNum,
                sex: sex,
                phone: cleanPhone
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
