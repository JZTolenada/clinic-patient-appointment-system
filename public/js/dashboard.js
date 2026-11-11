function loadDashboard() {
    fetch("/appointments")
        .then(function (response) {
            return response.json()
        })
        .then(function (appointments) {
            if (!Array.isArray(appointments)) return
            let today = new Date()
            let todayStr = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(today)

            let todayCount = 0
            let scheduledCount = 0
            let completedCount = 0
            let cancelledCount = 0

            appointments.forEach(function (appt) {
                let d = new Date(appt.appointmentDate)
                let apptDateStr = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Manila",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }).format(d)

                if (apptDateStr === todayStr && appt.status !== "Cancelled") {
                    todayCount++
                }
                if (appt.status === "Scheduled") {
                    scheduledCount++
                }
                if (appt.status === "Completed") {
                    completedCount++
                }
                if (appt.status === "Cancelled") {
                    cancelledCount++
                }
            })

            let elToday = document.getElementById("statToday")
            let elScheduled = document.getElementById("statScheduled") || document.getElementById("statPending")
            let elCompleted = document.getElementById("statCompleted") || document.getElementById("statAccepted")
            let elCancelled = document.getElementById("statCancelled")

            if (elToday) {
                elToday.textContent = todayCount
            }
            if (elScheduled) {
                elScheduled.textContent = scheduledCount
            }
            if (elCompleted) {
                elCompleted.textContent = completedCount
            }
            if (elCancelled) {
                elCancelled.textContent = cancelledCount
            }
        })
        .catch(function () {
            let elToday = document.getElementById("statToday")
            let elScheduled = document.getElementById("statScheduled") || document.getElementById("statPending")
            let elCompleted = document.getElementById("statCompleted") || document.getElementById("statAccepted")
            let elCancelled = document.getElementById("statCancelled")

            if (elToday) {
                elToday.textContent = "0"
            }
            if (elScheduled) {
                elScheduled.textContent = "0"
            }
            if (elCompleted) {
                elCompleted.textContent = "0"
            }
            if (elCancelled) {
                elCancelled.textContent = "0"
            }
        })
}
