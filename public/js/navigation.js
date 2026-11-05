let navButtons = document.querySelectorAll(".nav-btn")
let pages = document.querySelectorAll(".page")
let searchBarWrapper = document.getElementById("searchBarWrapper")
let searchInput = document.getElementById("searchInput")
let sidebar = document.getElementById("sidebar")
let mainContent = document.getElementById("mainContent")
let sidebarBrand = document.getElementById("sidebarBrand")

if (sidebarBrand) {
    sidebarBrand.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed")
        mainContent.classList.toggle("expanded")
    })
}

function getFormattedDate() {
    let days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"]
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    let now = new Date()
    return days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear()
}

function showPage(pageName) {
    pages.forEach(function (p) {
        p.classList.add("hidden")
    })

    navButtons.forEach(function (btn) {
        btn.classList.remove("active")
    })

    let activePage = document.getElementById(pageName + "Page")
    if (activePage) {
        activePage.classList.remove("hidden")
    }

    navButtons.forEach(function (btn) {
        if (btn.getAttribute("data-page") === pageName) {
            btn.classList.add("active")
        }
    })

    if (pageName === "dashboard") {
        if (searchBarWrapper) {
            searchBarWrapper.classList.add("hidden")
        }
        if (typeof loadDashboard === "function") {
            loadDashboard()
        }
    }

    if (pageName === "patients") {
        if (searchBarWrapper) {
            searchBarWrapper.classList.remove("hidden")
        }
        if (searchInput) {
            searchInput.value = ""
            searchInput.placeholder = "Search patients"
        }
        if (typeof loadPatients === "function") {
            loadPatients()
        }
    }

    if (pageName === "appointments") {
        if (searchBarWrapper) {
            searchBarWrapper.classList.remove("hidden")
        }
        if (searchInput) {
            searchInput.value = ""
            searchInput.placeholder = "Search appointments"
        }
        if (typeof loadAppointments === "function") {
            loadAppointments()
        }
    }

    let dateStr = getFormattedDate()
    let dashDate = document.getElementById("dashDate")
    let patientDate = document.getElementById("patientDate")
    let apptDate = document.getElementById("apptDate")
    if (dashDate) dashDate.textContent = dateStr
    if (patientDate) patientDate.textContent = dateStr
    if (apptDate) apptDate.textContent = dateStr
}

navButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        showPage(btn.getAttribute("data-page"))
    })
})

if (searchInput) {
    searchInput.addEventListener("input", function () {
        let query = searchInput.value.toLowerCase()
        let patientsPage = document.getElementById("patientsPage")
        let appointmentsPage = document.getElementById("appointmentsPage")

        if (patientsPage && !patientsPage.classList.contains("hidden")) {
            let rows = document.querySelectorAll("#patientTableBody tr")
            rows.forEach(function (row) {
                let text = row.textContent.toLowerCase()
                row.style.display = text.includes(query) ? "" : "none"
            })
        }

        if (appointmentsPage && !appointmentsPage.classList.contains("hidden")) {
            let rows = document.querySelectorAll("#apptTableBody tr")
            rows.forEach(function (row) {
                let text = row.textContent.toLowerCase()
                row.style.display = text.includes(query) ? "" : "none"
            })
        }
    })
}
