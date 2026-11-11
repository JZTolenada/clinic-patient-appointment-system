const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

const createAppointment = async (req, res) => {
    try {
        const { patientId, appointmentDate, reason } = req.body;

        if (!patientId) {
            return res.status(400).json({ message: "Please select a patient." });
        }

        if (!appointmentDate) {
            return res.status(400).json({ message: "Please provide an appointment date and time." });
        }

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ message: "Please provide a reason." });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: "Selected patient was not found." });
        }

        const apptDate = new Date(appointmentDate);
        const now = new Date();

        if (apptDate < now) {
            return res.status(400).json({ message: "Appointment date cannot be in the past." });
        }

        const day = apptDate.getDay();
        if (day === 0 || day === 6) {
            return res.status(400).json({ message: "Appointments are only available Monday to Friday." });
        }

        const hours = apptDate.getHours();
        if (hours === 12) {
            return res.status(400).json({ message: "12:00 PM is lunch break." });
        }

        if (![8, 9, 10, 11, 13, 14, 15, 16, 17].includes(hours)) {
            return res.status(400).json({ message: "Appointments must be between 8:00 AM - 11:00 AM or 1:00 PM - 5:00 PM." });
        }

        const startOfSlot = new Date(apptDate);
        startOfSlot.setMinutes(0, 0, 0);
        const endOfSlot = new Date(apptDate);
        endOfSlot.setMinutes(59, 59, 999);

        const conflict = await Appointment.findOne({
            appointmentDate: { $gte: startOfSlot, $lte: endOfSlot },
            status: "Scheduled"
        });

        if (conflict) {
            return res.status(400).json({ message: "This time slot is already booked." });
        }

        const appointment = new Appointment({
            patientId: patientId,
            appointmentDate: appointmentDate,
            reason: reason.trim()
        });

        await appointment.save();

        res.status(201).json({
            message: "Appointment created successfully.",
            appointment: appointment
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to create appointment."
        });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patientId");

        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve appointments."
        });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("patientId");

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        res.status(200).json(appointment);
    } catch (err) {
        return res.status(500).json({
            message: "Failed to retrieve appointment."
        });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { patientId, appointmentDate, reason, status } = req.body;

        const existing = await Appointment.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        const validStatuses = ["Scheduled", "Completed", "Cancelled"];
        if (status && validStatuses.indexOf(status) === -1) {
            return res.status(400).json({
                message: "Invalid appointment status."
            });
        }

        if (existing.status === "Cancelled" && status === "Scheduled") {
            return res.status(400).json({
                message: "Cancelled appointments cannot be put back to Scheduled."
            });
        }

        if (status === "Completed") {
            const targetDate = appointmentDate ? new Date(appointmentDate) : existing.appointmentDate;
            if (new Date() < targetDate) {
                return res.status(400).json({
                    message: "Appointments can only be marked as Completed during or after the appointment date."
                });
            }
        }

        if (appointmentDate && status !== "Cancelled") {
            const reqDate = new Date(appointmentDate);
            const isDateChanged = !existing.appointmentDate || Math.abs(new Date(existing.appointmentDate).getTime() - reqDate.getTime()) > 60000;
            if (isDateChanged) {
                const conflict = await Appointment.findOne({
                    _id: { $ne: req.params.id },
                    appointmentDate: { $gte: new Date(reqDate.getTime() - 50 * 60 * 1000), $lte: new Date(reqDate.getTime() + 50 * 60 * 1000) },
                    status: { $ne: "Cancelled" }
                });
                if (conflict) {
                    return res.status(400).json({
                        message: "This time slot is already booked."
                    });
                }
            }
        }

        const updatePayload = {
            appointmentDate: appointmentDate || existing.appointmentDate,
            reason: (reason !== undefined && reason !== null) ? reason.toString().trim() : existing.reason,
            status: status || existing.status
        };
        if (patientId) {
            updatePayload.patientId = patientId;
        }

        const appointment = await Appointment.findByIdAndUpdate(req.params.id,
            updatePayload,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        res.status(200).json({
            message: "Appointment updated successfully.",
            appointment: appointment
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update appointment."
        });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        res.status(200).json({
            message: "Appointment deleted successfully."
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete appointment."
        });
    }
};

module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };
