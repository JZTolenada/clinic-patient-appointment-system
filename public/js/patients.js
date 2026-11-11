let patientModal = document.getElementById("patientModal")
let editPatientModal = document.getElementById("editPatientModal")
let patientSuccessModal = document.getElementById("patientSuccessModal")
let patientSuccessText = document.getElementById("patientSuccessText")
let addPatientBtn = document.getElementById("addPatientBtn")
let submitPatientBtn = document.getElementById("submitPatientBtn")
let cancelEditPatientBtn = document.getElementById("cancelEditPatientBtn")
let submitEditPatientBtn = document.getElementById("submitEditPatientBtn")

let confirmDeleteModal = document.getElementById("confirmDeleteModal")
let cancelDeletePatientBtn = document.getElementById("cancelDeletePatientBtn")
let confirmDeletePatientBtn = document.getElementById("confirmDeletePatientBtn")
let selectedPatientIdToDelete = null

let allPatientsData = []

function triggerAlert(message, title) {
    if (typeof showAlert === "function") {
        showAlert(message, title)
    } else {
        let modal = document.getElementById("alertModal")
        let msg = document.getElementById("alertMessage")
        let titleEl = document.getElementById("alertTitle")
        if (modal && msg) {
            msg.textContent = message
            if (titleEl) {
                titleEl.textContent = title || "Notice"
            }
            modal.classList.remove("hidden")
        }
    }
}

function validatePatientForm(first, middle, last, phone, age, gender) {
    if (!first || first.trim() === "") {
        return "First name is required."
    }
    if (!middle || middle.trim() === "") {
        return "Middle name is required."
    }
    if (!last || last.trim() === "") {
        return "Last name is required."
    }
    if (!phone || phone.length !== 11 || !phone.startsWith("09")) {
        return "Contact number must be an 11-digit mobile number starting with 09."
    }
    if (!age || isNaN(age) || age < 1 || age > 120) {
        return "Age must be a valid number between 1 and 120."
    }
    if (!gender || gender === "") {
        return "Please select a valid gender."
    }
    return null
}

function loadPatients() {
    fetch("/patients")
        .then(function (response) {
            return response.json()
        })
        .then(function (patients) {
            if (!Array.isArray(patients)) return
            allPatientsData = patients
            let tbody = document.getElementById("patientTableBody")
            tbody.innerHTML = ""

            patients.forEach(function (p) {
                let tr = document.createElement("tr")
                tr.innerHTML =
                    '<td>' + (p.firstName || "") + '</td>' +
                    '<td>' + (p.middleName || "") + '</td>' +
                    '<td>' + (p.lastName || "") + '</td>' +
                    '<td>' + (p.phone || "") + '</td>' +
                    '<td>' + (p.age || "") + '</td>' +
                    '<td>' + (p.sex || "") + '</td>' +
                    '<td>' +
                        '<div class="action-cell">' +
                            '<button class="btn-action-edit" data-id="' + p._id + '" title="Edit">' +
                                '<img src="assets/icons/edit.svg" alt="Edit" class="action-svg">' +
                            '</button>' +
                            '<button class="btn-action-delete" data-id="' + p._id + '" title="Delete">' +
                                '<img src="assets/icons/trash.svg" alt="Delete" class="action-svg">' +
                            '</button>' +
                        '</div>' +
                    '</td>'
                tbody.appendChild(tr)
            })

            let emptyRows = 6 - patients.length
            for (let i = 0; i < emptyRows && i < 6; i++) {
                let tr = document.createElement("tr")
                tr.innerHTML =
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>' +
                    '<td>&nbsp;</td>'
                tbody.appendChild(tr)
            }

            document.querySelectorAll(".btn-action-edit").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    let id = btn.getAttribute("data-id")
                    let patient = allPatientsData.find(function (item) {
                        return item._id === id
                    })
                    if (patient) {
                        document.getElementById("editPatientId").value = patient._id
                        document.getElementById("editFirstName").value = patient.firstName || ""
                        document.getElementById("editMiddleName").value = patient.middleName || ""
                        document.getElementById("editLastName").value = patient.lastName || ""
                        document.getElementById("editPhone").value = patient.phone || ""
                        document.getElementById("editAge").value = patient.age || ""
                        document.getElementById("editGender").value = patient.sex || ""
                        editPatientModal.classList.remove("hidden")
                    }
                })
            })

            document.querySelectorAll(".btn-action-delete").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    selectedPatientIdToDelete = btn.getAttribute("data-id")
                    confirmDeleteModal.classList.remove("hidden")
                })
            })
        })
        .catch(function () {
            triggerAlert("Failed to load patients. Please try again.", "Error")
        })
}

cancelDeletePatientBtn.addEventListener("click", function () {
    selectedPatientIdToDelete = null
    confirmDeleteModal.classList.add("hidden")
})

confirmDeleteModal.addEventListener("click", function (e) {
    if (e.target === confirmDeleteModal) {
        selectedPatientIdToDelete = null
        confirmDeleteModal.classList.add("hidden")
    }
})

confirmDeletePatientBtn.addEventListener("click", function () {
    if (!selectedPatientIdToDelete) return
    let id = selectedPatientIdToDelete
    confirmDeleteModal.classList.add("hidden")
    selectedPatientIdToDelete = null

    fetch("/patients/" + id, {
        method: "DELETE"
    })
        .then(function (response) {
            return response.json().then(function (data) {
                return { ok: response.ok, data: data }
            })
        })
        .then(function (result) {
            if (!result.ok) {
                triggerAlert(result.data.message || "Failed to delete patient.", "Delete Error")
                return
            }
            if (patientSuccessText) patientSuccessText.textContent = "Deleted Successfully!"
            patientSuccessModal.classList.remove("hidden")
            loadPatients()
            if (typeof loadAppointments === "function") loadAppointments()
            if (typeof loadDashboard === "function") loadDashboard()
            setTimeout(function () {
                patientSuccessModal.classList.add("hidden")
            }, 2000)
        })
        .catch(function () {
            triggerAlert("A network error occurred while deleting the patient.", "Delete Error")
        })
})

addPatientBtn.addEventListener("click", function () {
    document.getElementById("pFirstName").value = ""
    document.getElementById("pMiddleName").value = ""
    document.getElementById("pLastName").value = ""
    document.getElementById("pPhone").value = ""
    document.getElementById("pAge").value = ""
    document.getElementById("pGender").value = ""
    patientModal.classList.remove("hidden")
})

patientModal.addEventListener("click", function (e) {
    if (e.target === patientModal) {
        patientModal.classList.add("hidden")
    }
})

let cancelPatientBtn = document.getElementById("cancelPatientBtn")
if (cancelPatientBtn) {
    cancelPatientBtn.addEventListener("click", function () {
        let fName = document.getElementById("pFirstName")
        let mName = document.getElementById("pMiddleName")
        let lName = document.getElementById("pLastName")
        let phone = document.getElementById("pPhone")
        let age = document.getElementById("pAge")
        let gender = document.getElementById("pGender")
        if (fName) fName.value = ""
        if (mName) mName.value = ""
        if (lName) lName.value = ""
        if (phone) phone.value = ""
        if (age) age.value = ""
        if (gender) gender.value = ""
        if (patientModal) {
            patientModal.classList.add("hidden")
        } else {
            let pm = document.getElementById("patientModal")
            if (pm) pm.classList.add("hidden")
        }
    })
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        let modalIds = ["patientModal", "editPatientModal", "apptModal", "alertModal", "signOutModal", "confirmDeleteModal", "patientSuccessModal", "apptSuccessModal"]
        modalIds.forEach(function (id) {
            let modal = document.getElementById(id)
            if (modal) {
                modal.classList.add("hidden")
            }
        })
        let modals = document.querySelectorAll(".modal-overlay")
        modals.forEach(function (m) {
            m.classList.add("hidden")
        })
    }
})

cancelEditPatientBtn.addEventListener("click", function () {
    editPatientModal.classList.add("hidden")
})

editPatientModal.addEventListener("click", function (e) {
    if (e.target === editPatientModal) {
        editPatientModal.classList.add("hidden")
    }
})

submitPatientBtn.addEventListener("click", function () {
    let first = document.getElementById("pFirstName").value.trim()
    let middle = document.getElementById("pMiddleName").value.trim()
    let last = document.getElementById("pLastName").value.trim()
    let phone = document.getElementById("pPhone").value.trim()
    let age = document.getElementById("pAge").value.trim()
    let gender = document.getElementById("pGender").value

    let error = validatePatientForm(first, middle, last, phone, age, gender)
    if (error) {
        triggerAlert(error, "Invalid Patient Data")
        return
    }

    fetch("/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: first,
            middleName: middle,
            lastName: last,
            age: parseInt(age),
            sex: gender,
            phone: phone
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                return { ok: response.ok, data: data }
            })
        })
        .then(function (result) {
            if (!result.ok) {
                triggerAlert(result.data.message || "Failed to register patient.", "Registration Error")
                return
            }
            patientModal.classList.add("hidden")
            if (patientSuccessText) patientSuccessText.textContent = "Added Successfully!"
            patientSuccessModal.classList.remove("hidden")
            loadPatients()
            setTimeout(function () {
                patientSuccessModal.classList.add("hidden")
            }, 2000)
        })
        .catch(function () {
            triggerAlert("A network error occurred while registering the patient.", "Network Error")
        })
})

submitEditPatientBtn.addEventListener("click", function () {
    let id = document.getElementById("editPatientId").value
    let first = document.getElementById("editFirstName").value.trim()
    let middle = document.getElementById("editMiddleName").value.trim()
    let last = document.getElementById("editLastName").value.trim()
    let phone = document.getElementById("editPhone").value.trim()
    let age = document.getElementById("editAge").value.trim()
    let gender = document.getElementById("editGender").value

    let error = validatePatientForm(first, middle, last, phone, age, gender)
    if (error) {
        triggerAlert(error, "Invalid Patient Data")
        return
    }

    fetch("/patients/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: first,
            middleName: middle,
            lastName: last,
            age: parseInt(age),
            sex: gender,
            phone: phone
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                return { ok: response.ok, data: data }
            })
        })
        .then(function (result) {
            if (!result.ok) {
                triggerAlert(result.data.message || "Failed to update patient.", "Update Error")
                return
            }
            editPatientModal.classList.add("hidden")
            if (patientSuccessText) patientSuccessText.textContent = "Updated Successfully!"
            patientSuccessModal.classList.remove("hidden")
            loadPatients()
            if (typeof loadAppointments === "function") loadAppointments()
            setTimeout(function () {
                patientSuccessModal.classList.add("hidden")
            }, 2000)
        })
        .catch(function () {
            triggerAlert("A network error occurred while updating the patient.", "Network Error")
        })
})

patientSuccessModal.addEventListener("click", function () {
    patientSuccessModal.classList.add("hidden")
})