let loginView = document.getElementById("loginView")
let appView = document.getElementById("appView")
let loginBtn = document.getElementById("loginBtn")
let loginError = document.getElementById("loginError")
let signOutBtn = document.getElementById("signOutBtn")

function showAlert(message) {
    let modal = document.getElementById("alertModal")
    let msg = document.getElementById("alertMessage")
    if (modal && msg) {
        msg.textContent = message
        modal.classList.remove("hidden")
    }
}

let alertModal = document.getElementById("alertModal")
let closeAlertBtn = document.getElementById("closeAlertBtn")

if (closeAlertBtn && alertModal) {
    closeAlertBtn.addEventListener("click", function () {
        alertModal.classList.add("hidden")
    })
    alertModal.addEventListener("click", function (e) {
        if (e.target === alertModal) {
            alertModal.classList.add("hidden")
        }
    })
}

function checkAuth() {
    if (localStorage.getItem("loggedIn") === "true") {
        loginView.classList.add("hidden")
        appView.classList.remove("hidden")
        appView.classList.add("flex")
        if (typeof showPage === "function") {
            showPage("dashboard")
        }
        if (typeof loadDashboard === "function") {
            loadDashboard()
        }
    } else {
        loginView.classList.remove("hidden")
        appView.classList.add("hidden")
        appView.classList.remove("flex")
    }
}

loginBtn.addEventListener("click", function () {
    let username = document.getElementById("loginUsername").value
    let password = document.getElementById("loginPassword").value

    if (username === "admin" && password === "12345678") {
        localStorage.setItem("loggedIn", "true")
        loginError.classList.add("hidden")
        checkAuth()
    } else {
        loginError.classList.remove("hidden")
    }
})

document.getElementById("loginPassword").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        loginBtn.click()
    }
})

let signOutModal = document.getElementById("signOutModal")
let cancelSignOutBtn = document.getElementById("cancelSignOutBtn")
let confirmSignOutBtn = document.getElementById("confirmSignOutBtn")

signOutBtn.addEventListener("click", function () {
    signOutModal.classList.remove("hidden")
})

cancelSignOutBtn.addEventListener("click", function () {
    signOutModal.classList.add("hidden")
})

signOutModal.addEventListener("click", function (e) {
    if (e.target === signOutModal) {
        signOutModal.classList.add("hidden")
    }
})

confirmSignOutBtn.addEventListener("click", function () {
    signOutModal.classList.add("hidden")
    localStorage.removeItem("loggedIn")
    document.getElementById("loginUsername").value = ""
    document.getElementById("loginPassword").value = ""
    checkAuth()
})

checkAuth()
