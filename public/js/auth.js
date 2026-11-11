let loginView = document.getElementById("loginView")
let appView = document.getElementById("appView")
let loginBtn = document.getElementById("loginBtn")
let loginError = document.getElementById("loginError")
let signOutBtn = document.getElementById("signOutBtn")

function showAlert(message, title) {
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
window.showAlert = showAlert

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
    let username = document.getElementById("loginUsername").value.trim()
    let password = document.getElementById("loginPassword").value.trim()

    if (!username && !password) {
        showAlert("Please enter your username and password.", "Login Required")
        return
    }

    if (!username) {
        showAlert("Please enter your username.", "Login Required")
        return
    }

    if (!password) {
        showAlert("Please enter your password.", "Login Required")
        return
    }

    if (username === "admin" && password === "12345678") {
        localStorage.setItem("loggedIn", "true")
        loginError.classList.add("hidden")
        checkAuth()
    } else {
        loginError.classList.remove("hidden")
        showAlert("Invalid username or password. Please try again.", "Authentication Failed")
    }
})

let loginUsernameInput = document.getElementById("loginUsername")
if (loginUsernameInput) {
    loginUsernameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            loginBtn.click()
        }
    })
}

let loginPasswordInput = document.getElementById("loginPassword")
if (loginPasswordInput) {
    loginPasswordInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            loginBtn.click()
        }
    })
}

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
