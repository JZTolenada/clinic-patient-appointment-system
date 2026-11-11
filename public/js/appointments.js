let apptModal = document.getElementById("apptModal")
let apptSuccessModal = document.getElementById("apptSuccessModal")
let addApptBtn = document.getElementById("addApptBtn")
let saveApptBtn = document.getElementById("saveApptBtn")
let clearApptBtn = document.getElementById("clearApptBtn")

let allAppointments = []
let currentSortCol = null
let currentSortDir = "asc"

function formatApptDate(dateStr) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    let d = new Date(dateStr)
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
}

function formatApptTime(dateStr) {
    let d = new Date(dateStr)
    let hours = d.getHours()
    let minutes = d.getMinutes()
    let ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    if (hours === 0) hours = 12
    let minStr = minutes < 10 ? "0" + minutes : minutes
    return hours + ":" + minStr + " " + ampm
}

function sortAppointments(list) {
    if (!currentSortCol) return list

    return list.slice().sort(function (a, b) {
        if (currentSortCol === "date") {
            let timeA = new Date(a.appointmentDate).getTime() || 0
            let timeB = new Date(b.appointmentDate).getTime() || 0
            return currentSortDir === "asc" ? timeA - timeB : timeB - timeA
        }

        if (currentSortCol === "status") {
            let valA = (a.status || "").toLowerCase()
            let valB = (b.status || "").toLowerCase()
            if (valA < valB) return currentSortDir === "asc" ? -1 : 1
            if (valA > valB) return currentSortDir === "asc" ? 1 : -1
            return 0
        }

        return 0
    })
}

function updateSortIndicators() {
    let cols = ["date", "status"]
    cols.forEach(function (col) {
        let iconEl = document.getElementById("sort-icon-" + col)
        if (iconEl) {
            if (currentSortCol === col) {
                iconEl.textContent = currentSortDir === "asc" ? " ▲" : " ▼"
                iconEl.style.opacity = "1"
            } else {
                iconEl.textContent = " ⇅"
                iconEl.style.opacity = "0.35"
            }
        }
    })
}

function renderAppointmentsTable() {
    let tbody = document.getElementById("apptTableBody")
    if (!tbody) return
    tbody.innerHTML = ""

    let sorted = sortAppointments(allAppointments)

    sorted.forEach(function (appt) {
        let patient = appt.patientId
        let fullName = ""
        let patientId = ""
        if (patient) {
            let mid = patient.middleName ? " " + patient.middleName + " " : " "
            fullName = patient.firstName + mid + patient.lastName
            patientId = patient._id
        }

        let statusLower = (appt.status || "Scheduled").toLowerCase()
        let apptTime = new Date(appt.appointmentDate).getTime()
        let nowTime = new Date().getTime()
        let canComplete = nowTime >= apptTime
        let isCancelled = appt.status === "Cancelled"

        let tr = document.createElement("tr")

        let apptDateObj = new Date(appt.appointmentDate)
        let todayObj = new Date()
        apptDateObj.setHours(0, 0, 0, 0)
        todayObj.setHours(0, 0, 0, 0)
        if (apptDateObj < todayObj && (appt.status || "").toLowerCase() === "scheduled") {
            tr.classList.add("past-appointment")
        }

        tr.innerHTML =
            '<td>' + fullName + '</td>' +
            '<td><div>' + formatApptDate(appt.appointmentDate) + '</div><div class="appt-time">' + formatApptTime(appt.appointmentDate) + '</div></td>' +
            '<td>' + (appt.reason || "Consultation") + '</td>' +
            '<td>' +
                '<select data-id="' + appt._id + '" data-patient="' + patientId + '" data-date="' + appt.appointmentDate + '" data-reason="' + (appt.reason || "Consultation") + '" data-prev-status="' + (appt.status || "Scheduled") + '" class="status-pill status-' + statusLower + ' status-select"' + (isCancelled ? " disabled" : "") + '>' +
                    '<option value="Completed"' + (appt.status === "Completed" ? " selected" : "") + ((canComplete || appt.status === "Completed") && !isCancelled ? "" : " disabled") + '>Completed</option>' +
                    '<option value="Scheduled"' + (appt.status === "Scheduled" ? " selected" : "") + (isCancelled ? " disabled" : "") + '>Scheduled</option>' +
                    '<option value="Cancelled"' + (appt.status === "Cancelled" ? " selected" : "") + '>Cancelled</option>' +
                '</select>' +
            '</td>'
        tbody.appendChild(tr)
    })

    let emptyRows = 6 - sorted.length
    for (let i = 0; i < emptyRows && i < 6; i++) {
        let tr = document.createElement("tr")
        tr.innerHTML =
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>' +
            '<td>&nbsp;</td>'
        tbody.appendChild(tr)
    }

    document.querySelectorAll(".status-select").forEach(function (sel) {
        sel.addEventListener("change", function () {
            let id = sel.getAttribute("data-id")
            let patientId = sel.getAttribute("data-patient")
            let apptDate = sel.getAttribute("data-date")
            let reason = sel.getAttribute("data-reason")
            let prevStatus = sel.getAttribute("data-prev-status") || "Scheduled"
            let newStatus = sel.value

            let apptTime = new Date(apptDate).getTime()
            let nowTime = new Date().getTime()

            if (prevStatus === "Cancelled" && newStatus === "Scheduled") {
                sel.value = "Cancelled"
                sel.className = "status-pill status-cancelled status-select"
                if (typeof showAlert === "function") {
                    showAlert("Cancelled appointments cannot be put back to Scheduled. Please create a new appointment.", "Invalid Status Change")
                }
                return
            }

            if (newStatus === "Completed" && nowTime < apptTime) {
                sel.value = prevStatus
                sel.className = "status-pill status-" + prevStatus.toLowerCase() + " status-select"
                if (typeof showAlert === "function") {
                    showAlert("Appointments can only be marked as Completed during or after the appointment date.", "Invalid Status Change")
                }
                return
            }

            sel.setAttribute("data-prev-status", newStatus)
            sel.className = "status-pill status-" + newStatus.toLowerCase() + " status-select"

            if (newStatus === "Cancelled") {
                sel.disabled = true
            }

            let tr = sel.closest("tr")
            if (tr) {
                let d = new Date(apptDate)
                let today = new Date()
                d.setHours(0, 0, 0, 0)
                today.setHours(0, 0, 0, 0)
                if (d < today && newStatus === "Scheduled") {
                    tr.classList.add("past-appointment")
                } else {
                    tr.classList.remove("past-appointment")
                }
            }

            for (let i = 0; i < allAppointments.length; i++) {
                if (allAppointments[i]._id === id) {
                    allAppointments[i].status = newStatus
                    break
                }
            }

            fetch("/appointments/" + id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patientId,
                    appointmentDate: apptDate,
                    reason: reason,
                    status: newStatus
                })
            })
                .then(function (response) {
                    return response.json().then(function (data) {
                        return { ok: response.ok, data: data }
                    })
                })
                .then(function (result) {
                    if (!result.ok && typeof showAlert === "function") {
                        showAlert(result.data.message || "Failed to update appointment status.", "Update Error")
                        return
                    }
                    if (typeof loadDashboard === "function") loadDashboard()
                })
                .catch(function () {
                    if (typeof showAlert === "function") {
                        showAlert("A network error occurred while updating the appointment.", "Network Error")
                    }
                })
        })
    })

    updateSortIndicators()
}

document.querySelectorAll(".appt-sort-th").forEach(function (th) {
    th.addEventListener("click", function () {
        let col = th.getAttribute("data-sort")
        if (currentSortCol === col) {
            currentSortDir = currentSortDir === "asc" ? "desc" : "asc"
        } else {
            currentSortCol = col
            currentSortDir = "asc"
        }
        renderAppointmentsTable()
    })
})

function loadAppointments() {
    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            allAppointments = appointments
            renderAppointmentsTable()
        })
}

function updateTimeSlots() {
    let dateInput = document.getElementById("apptDateInput")
    let timeSelect = document.getElementById("apptTimeSlot")
    let hint = document.getElementById("apptTimeHint")
    if (!dateInput || !timeSelect) return

    let dateValue = dateInput.value
    let allSlots = [
        { value: "08:00", label: "8:00 AM" },
        { value: "09:00", label: "9:00 AM" },
        { value: "10:00", label: "10:00 AM" },
        { value: "11:00", label: "11:00 AM" },
        { value: "13:00", label: "1:00 PM" },
        { value: "14:00", label: "2:00 PM" },
        { value: "15:00", label: "3:00 PM" },
        { value: "16:00", label: "4:00 PM" },
        { value: "17:00", label: "5:00 PM" }
    ]

    if (!dateValue) {
        timeSelect.innerHTML = '<option value="">Select a time slot</option>'
        allSlots.forEach(function (slot) {
            timeSelect.innerHTML += '<option value="' + slot.value + '">' + slot.label + '</option>'
        })
        timeSelect.disabled = false
        saveApptBtn.disabled = false
        saveApptBtn.classList.remove("btn-disabled")
        if (hint) {
            hint.textContent = "12:00 PM is lunch break (No appointments)"
            hint.style.color = "#888888"
        }
        return
    }

    let parts = dateValue.split("-")
    let chosenDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    chosenDate.setHours(0, 0, 0, 0)

    if (chosenDate < today) {
        timeSelect.innerHTML = '<option value="">Date is in the past</option>'
        timeSelect.disabled = true
        saveApptBtn.disabled = true
        saveApptBtn.classList.add("btn-disabled")
        if (hint) {
            hint.textContent = "Appointment date cannot be in the past."
            hint.style.color = "#DC2626"
        }
        return
    }

    let dayOfWeek = chosenDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        timeSelect.innerHTML = '<option value="">Not available on weekends</option>'
        timeSelect.disabled = true
        saveApptBtn.disabled = true
        saveApptBtn.classList.add("btn-disabled")
        if (hint) {
            hint.textContent = "Appointments are only available Monday to Friday."
            hint.style.color = "#DC2626"
        }
        return
    }

    timeSelect.disabled = false
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")

    let bookedHours = []
    allAppointments.forEach(function (appt) {
        if (appt.status === "Cancelled") return
        let d = new Date(appt.appointmentDate)
        let apptY = d.getFullYear()
        let apptM = String(d.getMonth() + 1).padStart(2, "0")
        let apptDay = String(d.getDate()).padStart(2, "0")
        let apptDateStr = apptY + "-" + apptM + "-" + apptDay

        if (apptDateStr === dateValue) {
            let h = String(d.getHours()).padStart(2, "0")
            bookedHours.push(h + ":00")
        }
    })

    timeSelect.innerHTML = '<option value="">Select a time slot</option>'
    let availableCount = 0

    allSlots.forEach(function (slot) {
        let isBooked = bookedHours.indexOf(slot.value) !== -1
        if (isBooked) {
            timeSelect.innerHTML += '<option value="' + slot.value + '" disabled>' + slot.label + ' (Booked)</option>'
        } else {
            timeSelect.innerHTML += '<option value="' + slot.value + '">' + slot.label + '</option>'
            availableCount++
        }
    })

    if (hint) {
        if (availableCount === 0) {
            hint.textContent = "All time slots are fully booked for this date."
            hint.style.color = "#DC2626"
            saveApptBtn.disabled = true
            saveApptBtn.classList.add("btn-disabled")
        } else {
            hint.textContent = availableCount + " slot(s) available. 12:00 PM is lunch break."
            hint.style.color = "#888888"
            saveApptBtn.disabled = false
            saveApptBtn.classList.remove("btn-disabled")
        }
    }
}

addApptBtn.addEventListener("click", function () {
    let dateInput = document.getElementById("apptDateInput")
    let timeSelect = document.getElementById("apptTimeSlot")
    if (dateInput) dateInput.value = ""
    if (timeSelect) timeSelect.value = ""
    document.getElementById("apptReason").value = ""
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")

    let hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "12:00 PM is lunch break (No appointments)"
        hint.style.color = "#888888"
    }

    let now = new Date()
    let year = now.getFullYear()
    let month = String(now.getMonth() + 1).padStart(2, "0")
    let day = String(now.getDate()).padStart(2, "0")
    if (dateInput) dateInput.min = year + "-" + month + "-" + day

    let select = document.getElementById("apptPatientSelect")
    select.innerHTML = '<option value="">Select patient</option>'

    fetch("/patients")
        .then(function (response) {
            return response.json()
        })
        .then(function (patients) {
            patients.forEach(function (p) {
                let option = document.createElement("option")
                option.value = p._id
                let mid = p.middleName ? " " + p.middleName + " " : " "
                option.textContent = p.firstName + mid + p.lastName
                select.appendChild(option)
            })
        })

    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            allAppointments = appointments
            updateTimeSlots()
        })

    apptModal.classList.remove("hidden")
})

apptModal.addEventListener("click", function (e) {
    if (e.target === apptModal) {
        apptModal.classList.add("hidden")
    }
})

clearApptBtn.addEventListener("click", function () {
    document.getElementById("apptPatientSelect").value = ""
    let dateInput = document.getElementById("apptDateInput")
    let timeSelect = document.getElementById("apptTimeSlot")
    if (dateInput) dateInput.value = ""
    if (timeSelect) timeSelect.value = ""
    document.getElementById("apptReason").value = ""
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")
    let hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "12:00 PM is lunch break (No appointments)"
        hint.style.color = "#888888"
    }
    updateTimeSlots()
})

let dateInputEl = document.getElementById("apptDateInput")
if (dateInputEl) {
    dateInputEl.addEventListener("change", function () {
        updateTimeSlots()
    })
    dateInputEl.addEventListener("input", function () {
        updateTimeSlots()
    })
}

function validateAppointmentForm(patientId, dateValue, timeValue, reason) {
    if (!patientId) {
        return "Please select a patient from the list."
    }

    if (!dateValue) {
        return "Please select an appointment date."
    }

    let parts = dateValue.split("-")
    if (parts.length !== 3) {
        return "Invalid date format."
    }

    let chosenDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    chosenDate.setHours(0, 0, 0, 0)

    if (chosenDate < today) {
        return "Appointment date cannot be in the past. Please select today or a future date."
    }

    let dayOfWeek = chosenDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return "Appointments are only available Monday to Friday."
    }

    if (!timeValue) {
        return "Please select an appointment time slot."
    }

    let validSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    if (validSlots.indexOf(timeValue) === -1) {
        return "Invalid time slot. Office hours are 8:00 AM - 5:00 PM with 12:00 PM lunch break."
    }

    if (!reason) {
        return "Please enter a reason for the appointment."
    }

    if (reason.length < 2) {
        return "Appointment reason must be at least 2 characters long."
    }

    return null
}

saveApptBtn.addEventListener("click", function () {
    if (saveApptBtn.disabled) return

    let patientId = document.getElementById("apptPatientSelect").value
    let dateInput = document.getElementById("apptDateInput")
    let timeSelect = document.getElementById("apptTimeSlot")
    let dateValue = dateInput ? dateInput.value : ""
    let timeValue = timeSelect ? timeSelect.value : ""
    let reason = document.getElementById("apptReason").value.trim()

    let error = validateAppointmentForm(patientId, dateValue, timeValue, reason)
    if (error) {
        if (typeof showAlert === "function") {
            showAlert(error, "Invalid Appointment Details")
        }
        return
    }

    let parts = dateValue.split("-")
    let timeParts = timeValue.split(":")
    let appointmentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), parseInt(timeParts[0]), parseInt(timeParts[1]), 0)

    fetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            patientId: patientId,
            appointmentDate: appointmentDate.toISOString(),
            reason: reason
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                return { ok: response.ok, data: data }
            })
        })
        .then(function (result) {
            if (!result.ok) {
                if (typeof showAlert === "function") {
                    showAlert(result.data.message || "Failed to book appointment.", "Booking Error")
                }
                return
            }
            apptModal.classList.add("hidden")
            apptSuccessModal.classList.remove("hidden")
            loadAppointments()
            if (typeof loadDashboard === "function") loadDashboard()
            setTimeout(function () {
                apptSuccessModal.classList.add("hidden")
            }, 2000)
        })
        .catch(function () {
            if (typeof showAlert === "function") {
                showAlert("A network error occurred while scheduling the appointment.", "Network Error")
            }
        })
})

apptSuccessModal.addEventListener("click", function () {
    apptSuccessModal.classList.add("hidden")
})
