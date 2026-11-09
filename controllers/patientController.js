const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

const createPatient = async (req, res) => {
    try {
        const { firstName, middleName, lastName, age, sex, phone}= req.body;
        const patient = new Patient({
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            age: age,
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

const getPatientById= async (req, res) => {
    try{
        const patient= await Patient.findById(req.params.id);

        if(!patient){
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        res.status(200).json(patient)

    }catch (err){
        res.status(500).json({
            message: "Failed to retrieve patient."
        })
    }
}

const updatePatient= async (req, res) => {
    try{
        const { firstName,middleName, lastName, age, sex, phone }= req.body;
        const patient= await Patient.findByIdAndUpdate(req.params.id,
            {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                age: age,
                sex: sex,
                phone: phone
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if(!patient){
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        res.status(200).json({
            message: "Patient updated successfully.",
            patient: patient
        });
    
    }catch (err){
        res.status(500).json({
            message: "Failed to update patient"
        });
    }
};

const deletePatient= async (req, res) => {
    try{
        const patient= await Patient.findByIdAndDelete(req.params.id)

        if(!patient){
            return res.status(404).json({
                message: "Patient not found."
            })
        }

        await Appointment.deleteMany({ patientId: req.params.id });

        return res.status(200).json({
            message: "Patient deleted successfully."
        });
    }catch (err){
        res.status(500).json({
            message: "Failed to delete patient."
        });
    }
};



module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
