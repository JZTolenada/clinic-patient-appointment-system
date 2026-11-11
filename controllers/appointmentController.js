const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

const createAppointment = async (req, res) => {
    try {
        const { patientId, appointmentDate, reason } = req.body;

        if (!patientId) {
            return res.status(400).json({
                message: "Please select a patient."
            });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                message: "Selected patient was not found."
            });
        }

        if (!appointmentDate) {
            return res.status(400).json({
                message: "Appointment date and time are required."
            });
        }

        const apptDate = new Date(appointmentDate);
        if (isNaN(apptDate.getTime())) {
            return res.status(400).json({
                message: "Invalid appointment date format."
            });
        }

        const now = new Date();
        if (apptDate < now) {
            return res.status(400).json({
                message: "Appointment date and time cannot be in the past."
            });
        }

        const hourStr = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", hourCycle: "h23" }).format(apptDate);
        const minStr = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", minute: "2-digit" }).format(apptDate);
        const dayStr = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", weekday: "short" }).format(apptDate);

        const apptHour = parseInt(hourStr, 10);
        const apptMinutes = parseInt(minStr, 10);
        const isWeekend = (dayStr === "Sat" || dayStr === "Sun");

        const VALID_HOURS = [8, 9, 10, 11, 13, 14, 15, 16, 17];

        if (VALID_HOURS.indexOf(apptHour) === -1) {
            return res.status(400).json({
                message: "Appointments are only available from 8:00 AM - 11:00 AM and 1:00 PM - 5:00 PM. 12:00 PM is lunch break."
            });
        }

        if (apptMinutes !== 0) {
            return res.status(400).json({
                message: "Appointments must be scheduled on the hour (e.g. 8:00 AM, 9:00 AM)."
            });
        }

        if (isWeekend) {
            return res.status(400).json({
                message: "Appointments are only available Monday to Friday."
            });
        }

        if (!reason || typeof reason !== "string" || reason.trim().length < 2) {
            return res.status(400).json({
                message: "Please provide a valid reason for the appointment (at least 2 characters)."
            });
        }

        const startOfSlot = new Date(apptDate.getTime() - 50 * 60 * 1000);
        const endOfSlot = new Date(apptDate.getTime() + 50 * 60 * 1000);

        const conflict = await Appointment.findOne({
            appointmentDate: { $gte: startOfSlot, $lte: endOfSlot },
            status: { $ne: "Cancelled" }
        });

        if (conflict) {
            return res.status(400).json({
                message: "This time slot is already booked. Please choose another time slot."
            });
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
