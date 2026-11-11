let apptModal = document.getElementById("apptModal")
let apptSuccessModal = document.getElementById("apptSuccessModal")
let addApptBtn = document.getElementById("addApptBtn")
let saveApptBtn = document.getElementById("saveApptBtn")
let clearApptBtn = document.getElementById("clearApptBtn")

let patientSearchInput = document.getElementById("apptPatientSearch")
let patientIdInput = document.getElementById("apptPatientId")
let clearPatientSearchBtn = document.getElementById("clearPatientSearchBtn")
let patientSuggestionsList = document.getElementById("patientSuggestionsList")

let allAppointments = []
let availablePatients = []
let currentSortCol = null
let currentSortDir = "asc"
let activeSuggestionIndex = -1

function formatApptDate(dateStr) {
    let d = new Date(dateStr)
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(d)
}

function formatApptTime(dateStr) {
    let d = new Date(dateStr)
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(d)
}

function getManilaDateString(dateObj) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(dateObj)
}

function formatPatientName(p) {
    if (!p) return ""
    let mid = p.middleName ? " " + p.middleName + " " : " "
    return (p.firstName + mid + p.lastName).replace(/\s+/g, " ").trim()
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
        let fullName = "Unknown Patient"
        let patientId = ""
        if (patient) {
            fullName = formatPatientName(patient)
            patientId = patient._id || ""
        }

        let statusLower = (appt.status || "Scheduled").toLowerCase()
        let apptTime = new Date(appt.appointmentDate).getTime()
        let nowTime = new Date().getTime()
        let canComplete = nowTime >= apptTime
        let isCancelled = appt.status === "Cancelled"

        let tr = document.createElement("tr")

        let apptDateObj = new Date(appt.appointmentDate)
        let apptDateStr = getManilaDateString(apptDateObj)
        let todayStr = getManilaDateString(new Date())

        if (apptDateStr < todayStr && (appt.status || "").toLowerCase() === "scheduled") {
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
                let aDateStr = getManilaDateString(d)
                let tDateStr = getManilaDateString(new Date())
                if (aDateStr < tDateStr && newStatus === "Scheduled") {
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
                    patientId: patientId || undefined,
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
                    if (!result.ok) {
                        if (typeof showAlert === "function") {
                            showAlert(result.data.message || "Failed to update appointment status.", "Update Error")
                        }
                        loadAppointments()
                        return
                    }
                    if (typeof loadDashboard === "function") loadDashboard()
                })
                .catch(function () {
                    if (typeof showAlert === "function") {
                        showAlert("A network error occurred while updating the appointment.", "Network Error")
                    }
                    loadAppointments()
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
            allAppointments = appointments || []
            renderAppointmentsTable()
        })
        .catch(function () {
            allAppointments = []
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
    let chosenDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
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
        let apptDateStr = getManilaDateString(d)

        if (apptDateStr === dateValue) {
            let hourStr = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Manila",
                hour: "2-digit",
                hourCycle: "h23"
            }).format(d)
            bookedHours.push(hourStr + ":00")
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

function renderPatientSuggestions(query) {
    if (!patientSuggestionsList) return
    patientSuggestionsList.innerHTML = ""
    activeSuggestionIndex = -1

    let q = (query || "").trim().toLowerCase()
    let filtered = availablePatients.filter(function (p) {
        if (!q) return true
        let fullName = formatPatientName(p).toLowerCase()
        let phone = (p.phone || "").toLowerCase()
        return fullName.includes(q) || phone.includes(q)
    })

    if (filtered.length === 0) {
        patientSuggestionsList.innerHTML = '<div class="suggestion-empty">No patients found. Please add the patient in Patients menu first.</div>'
        patientSuggestionsList.classList.remove("hidden")
        return
    }

    filtered.forEach(function (p) {
        let item = document.createElement("div")
        item.className = "suggestion-item"
        let name = formatPatientName(p)
        let meta = "Contact: " + (p.phone || "N/A") + (p.age ? " | Age: " + p.age : "") + (p.sex ? " | Gender: " + p.sex : "")

        item.innerHTML =
            '<div class="suggestion-name">' + name + '</div>' +
            '<div class="suggestion-meta">' + meta + '</div>'

        item.addEventListener("mousedown", function (e) {
            e.preventDefault()
            selectPatient(p)
        })

        patientSuggestionsList.appendChild(item)
    })

    patientSuggestionsList.classList.remove("hidden")
}

function selectPatient(p) {
    if (!p) return
    let name = formatPatientName(p)
    if (patientSearchInput) patientSearchInput.value = name
    if (patientIdInput) patientIdInput.value = p._id

    if (clearPatientSearchBtn) {
        clearPatientSearchBtn.classList.remove("hidden")
    }

    if (patientSuggestionsList) {
        patientSuggestionsList.classList.add("hidden")
    }
}

function resetPatientSelection() {
    if (patientSearchInput) patientSearchInput.value = ""
    if (patientIdInput) patientIdInput.value = ""
    if (clearPatientSearchBtn) clearPatientSearchBtn.classList.add("hidden")
    if (patientSuggestionsList) {
        patientSuggestionsList.classList.add("hidden")
        patientSuggestionsList.innerHTML = ""
    }
    activeSuggestionIndex = -1
}

function updateActiveSuggestion(items) {
    items.forEach(function (it, idx) {
        if (idx === activeSuggestionIndex) {
            it.classList.add("active-suggestion")
            it.scrollIntoView({ block: "nearest" })
        } else {
            it.classList.remove("active-suggestion")
        }
    })
}

if (patientSearchInput) {
    patientSearchInput.addEventListener("input", function () {
        let val = patientSearchInput.value
        if (patientIdInput) patientIdInput.value = ""

        if (val.trim().length > 0) {
            if (clearPatientSearchBtn) clearPatientSearchBtn.classList.remove("hidden")
        } else {
            if (clearPatientSearchBtn) clearPatientSearchBtn.classList.add("hidden")
        }

        renderPatientSuggestions(val)
    })

    patientSearchInput.addEventListener("focus", function () {
        renderPatientSuggestions(patientSearchInput.value)
    })

    patientSearchInput.addEventListener("blur", function () {
        setTimeout(function () {
            if (patientSuggestionsList) {
                patientSuggestionsList.classList.add("hidden")
            }
        }, 200)
    })

    patientSearchInput.addEventListener("keydown", function (e) {
        let items = patientSuggestionsList ? patientSuggestionsList.querySelectorAll(".suggestion-item") : []
        if (!items || items.length === 0) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            activeSuggestionIndex++
            if (activeSuggestionIndex >= items.length) activeSuggestionIndex = 0
            updateActiveSuggestion(items)
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            activeSuggestionIndex--
            if (activeSuggestionIndex < 0) activeSuggestionIndex = items.length - 1
            updateActiveSuggestion(items)
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
                items[activeSuggestionIndex].dispatchEvent(new MouseEvent("mousedown"))
            } else if (items.length === 1) {
                items[0].dispatchEvent(new MouseEvent("mousedown"))
            }
        } else if (e.key === "Escape") {
            patientSuggestionsList.classList.add("hidden")
        }
    })
}

if (clearPatientSearchBtn) {
    clearPatientSearchBtn.addEventListener("click", function () {
        resetPatientSelection()
        if (patientSearchInput) {
            patientSearchInput.focus()
            renderPatientSuggestions("")
        }
    })
}

addApptBtn.addEventListener("click", function () {
    let dateInput = document.getElementById("apptDateInput")
    let timeSelect = document.getElementById("apptTimeSlot")
    if (dateInput) dateInput.value = ""
    if (timeSelect) timeSelect.value = ""
    document.getElementById("apptReason").value = ""
    saveApptBtn.disabled = false
    saveApptBtn.classList.remove("btn-disabled")

    resetPatientSelection()

    let hint = document.getElementById("apptTimeHint")
    if (hint) {
        hint.textContent = "12:00 PM is lunch break (No appointments)"
        hint.style.color = "#888888"
    }

    let now = new Date()
    let todayStr = getManilaDateString(now)
    if (dateInput) dateInput.min = todayStr

    fetch("/patients")
        .then(function (response) {
            return response.json()
        })
        .then(function (patients) {
            availablePatients = Array.isArray(patients) ? patients : []
        })
        .catch(function () {
            availablePatients = []
        })

    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            allAppointments = Array.isArray(appointments) ? appointments : []
            updateTimeSlots()
        })
        .catch(function () {
            allAppointments = []
            updateTimeSlots()
        })

    apptModal.classList.remove("hidden")
    setTimeout(function () {
        if (patientSearchInput) patientSearchInput.focus()
    }, 100)
})

apptModal.addEventListener("click", function (e) {
    if (e.target === apptModal) {
        apptModal.classList.add("hidden")
        resetPatientSelection()
    }
})

clearApptBtn.addEventListener("click", function () {
    resetPatientSelection()
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

function validateAppointmentForm(patientId, dateValue, timeValue, reason, patientSearchVal) {
    if (!patientId) {
        if (patientSearchVal && patientSearchVal.trim()) {
            return "Please select a patient from the auto-suggest list."
        }
        return "Please search and select a patient."
    }

    if (!dateValue) {
        return "Please select an appointment date."
    }

    let parts = dateValue.split("-")
    if (parts.length !== 3) {
        return "Invalid date format."
    }

    let chosenDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
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

    let patientId = patientIdInput ? patientIdInput.value.trim() : ""
    let patientSearchVal = patientSearchInput ? patientSearchInput.value.trim() : ""
    let dateInput = document.getElementById("apptDateInput")
    let timeSelect = document.getElementById("apptTimeSlot")
    let dateValue = dateInput ? dateInput.value : ""
    let timeValue = timeSelect ? timeSelect.value : ""
    let reason = document.getElementById("apptReason").value.trim()

    let error = validateAppointmentForm(patientId, dateValue, timeValue, reason, patientSearchVal)
    if (error) {
        if (typeof showAlert === "function") {
            showAlert(error, "Invalid Appointment Details")
        }
        return
    }

    let appointmentDateIso = dateValue + "T" + timeValue + ":00.000+08:00"

    fetch("/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            patientId: patientId,
            appointmentDate: appointmentDateIso,
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
            resetPatientSelection()
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
