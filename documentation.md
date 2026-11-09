# Weekly Progress Report # 1
### Final Project - Full-Stack Web Application (Web Programming)

> *Only one member submits this report for the whole group. Do not submit one per person. Agree as a group on who will submit.*  
> *Fill in every part. This report is graded, so be honest. What you write here should match what you can show on your computer.*

---

## Part 1 - Software and group information

| Item | Your answer |
| :--- | :--- |
| **Software Title** | **MediSched** (Clinic Patient & Appointment Management System) |
| **Information about your system** | **MediSched** is a full-stack clinical management web application engineered to streamline patient record-keeping and appointment logistics for outpatient clinics and healthcare administrators. It features an administrative authentication portal, a live clinic overview dashboard calculating real-time daily operational statistics, full implementation of the 4 core HTTP request methods (**GET**, **POST**, **PUT**, and **DELETE**) across both patient records and appointment schedules, and strict appointment workflow state rules (preventing premature completion of future appointments and locking cancelled visits permanently). Built with a modular Node.js and Express server, MongoDB connected via Mongoose ODM, and a pure vanilla HTML5, CSS3, and JavaScript frontend completely free of external CDNs and frontend frameworks. |
| **Members** | • **Yumul, Christian B.** — Full-Stack Integration, Frontend Logic & UI Implementation, Quality Assurance, and System Documentation<br>• **Tolenada, John Zyrus E.** — Repository Owner & Git Administration, Backend REST API Development, Server Architecture & Database Schemas<br>• **Nicholas, Pocholo S.** — UI/UX Design, Storyboarding, Frontend Layout Planning, and Design System ([Canva Layout Workspace](https://www.canva.com/design/DAHZNcydF0k/WrrgKxLC8asnpVZVnXlPrA/edit)) |
| **Member who submitted** | **Yumul, Christian B.** |

---

## Part 2 - Advanced Features Integrated / Applied (Add rows if needed)

| Feature | Done | In progress | Not started |
| :--- | :---: | :---: | :---: |
| **User Authentication Portal** (Admin credential verification, protected views, and session management) | **✓** | | |
| **Real-time Clinic Overview Dashboard** (Dynamic live counters: Today's Appts, Scheduled, Completed, Cancelled) | **✓** | | |
| **Patient Management via HTTP Methods** (GET to fetch, POST to add, PUT to edit, and DELETE to remove) | **✓** | | |
| **Patient Middle Name Schema Support** (Accommodates standard Filipino naming conventions) | **✓** | | |
| **Appointment Scheduling via HTTP Methods** (GET, POST, PUT, DELETE endpoints with schema population) | **✓** | | |
| **Appointment Workflow Integrity Guard** (Completion allowed only during/after date; Cancelled is final & locked) | **✓** | | |
| **Interactive Column Sorting** (Toggleable sort for Appointment Date/Time and Status with visual indicators) | **✓** | | |
| **In-Page Live Search & Real-Time Filtering** (Instant, client-side patient and appointment search) | **✓** | | |
| **Independent Table Card Scrollbar & Sticky Headers** (Isolated vertical scrollbar with zero page blowout) | **✓** | | |
| **Pure Vanilla Stack Delivery** (Zero external CDNs or frameworks; local Poppins fonts, SVG icons, and custom CSS) | **✓** | | |
| **Multi-Role User Access Control** (Granular permissions for Doctors, Nurses, and Receptionists) | | **✓** | |
| **Automated Patient Notification Reminders** (SMS / Email appointment reminders service) | | | **✓** |
| **Exportable Clinical Reports** (Data export to PDF / Excel for billing and record auditing) | | | **✓** |

### List any extra features you built on your own:
- **Full 4 HTTP Request Methods Implementation**: Built and connected all 4 HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) for both patients (`/patients`) and appointments (`/appointments`), seamlessly connecting Express routing, controller business logic, and MongoDB database models.
- **Admin Authentication Gateway**: Implemented secure credential verification (`admin` / `12345678`) with error messaging, modal alert handling, and session state protection.
- **Real-Time Client-Side Search**: Dynamic search filter that queries through table records in real-time as the user types without causing page refreshes or extra server calls.
- **Dynamic Metric Aggregation**: Automated calculation of clinic metrics (Today's Appointments, Scheduled Patients, Completed Patients, and Cancelled Patients) linked to formatted local date display (`Fri, Oct 30, 2026`).
- **Strict Appointment State Integrity Rules**: Engineered client-side UI enforcement and server-side controller verification preventing appointments from being set to "Completed" before their date, and locking "Cancelled" appointments permanently from accidental reactivation.
- **Multi-Directional Column Sorting**: Sorting state toggles (`▲`, `▼`, `⇅`) for appointments based on parsed dates and statuses.
- **Constrained Viewport Architecture**: Custom `.table-card` CSS constraint (`calc(100vh - 270px)`) with sticky `<th>` elements to ensure only the table scrolls vertically while the page layout remains stationary.
- **100% Self-Contained Vanilla Delivery**: Eliminated all external CDN dependencies and CSS frameworks (e.g., Tailwind browser compiler); bundled local Poppins font families, customized SVG iconography, and created an authentic transparent logo and native multi-format favicon (`.ico` + `.png`).
- **Patient Auto-Suggest Search Bar**: Replaced static patient selection dropdown with a real-time auto-suggest search bar supporting live matching across patient names and phone numbers, keyboard navigation, and selection confirmation badges.
- **Timezone-Resilient Appointment Scheduling**: Engineered scheduling logic to preserve clinic timezone (`Asia/Manila`, UTC+8) across backend validation checks and frontend rendering, eliminating host server timezone mismatch issues.

---

## Part 3 - Screenshots of the system (Add rows if needed)

> *Paste clear screenshots, for example the form, the records list, an edit, and the database in MongoDB Compass or Atlas.*

| Title | Image |
| :--- | :--- |
| **1. Admin Authentication & Login Interface** | *[Insert screenshot of the MediSched login card showing username/password fields and branding logo]* |
| **2. Clinic Overview Dashboard & Real-Time Counters** | *[Insert screenshot of the Dashboard page showing statistics cards: Today's Appointments, Scheduled Patients, Completed Patients, and Cancelled Patients]* |
| **3. Patient Records Management Table (HTTP GET Request) & Live Search** | *[Insert screenshot of the Patient page showing the records table fetched via HTTP GET, action buttons, and Search Patients bar]* |
| **4. Add New Patient Modal Dialog Form (HTTP POST Request)** | *[Insert screenshot of the Patient modal dialog displaying input fields for First Name, Middle Name, Last Name, Age, Gender, and Contact]* |
| **5. Edit Patient Modal Dialog Form (HTTP PUT Request)** | *[Insert screenshot of the modal dialog pre-filled with existing patient details ready to update via HTTP PUT]* |
| **6. Delete Patient Record Confirmation (HTTP DELETE Request)** | *[Insert screenshot showing the removal of a patient record via HTTP DELETE and the updated table]* |
| **7. Appointment Scheduling & Status Management Table (HTTP GET & PUT Requests)** | *[Insert screenshot of the Appointments page showing sorted columns, status dropdown pills, and locked cancelled rows]* |
| **8. Book New Appointment Modal Dialog (HTTP POST Request)** | *[Insert screenshot of the Add Appointment modal form with patient selection dropdown, date/time pickers, and reason for visit]* |
| **9. Server Startup & Terminal Execution Logs** | *[Insert screenshot of the command terminal running Node.js showing `Mongoose connected...` and `Server is running...`]* |
| **10. MongoDB Compass Database Collections** | *[Insert screenshot of MongoDB Compass displaying the `clinic` database with `patients` and `appointments` collections and documents]* |
| **11. UI/UX Wireframe & Storyboard in Canva** | *[Insert screenshot of the Canva design workspace displaying the UI storyboard and component layouts]* |

---

## Part 4 - What to expect on the system presentation

> *A 5 to 10-minute presentation. Write a short description of what your group will present and demo.*

| System Presentation Plan |
| :--- |
| In our 5 to 10-minute system presentation, our group will deliver an end-to-end live demonstration of MediSched covering the following key stages:<br><br>**1. Project Introduction & Problem Context (1.5 minutes)**<br>• Group members and individual project responsibilities: Yumul (Frontend/Integration/QA), Tolenada (Backend/API/Database), Nicholas (UI/UX Design/Storyboard).<br>• Set out the clinical problems with paper-based scheduling and how MediSched offers a centralized full-stack web-based solution.<br>• Present the initial Canva UI design storyboard and go through how the team took the wireframes and turned them into production code.<br><br>**2. Technical Architecture & Database Demo (2.5 minutes)**<br>• Walk through the modular Express backend architecture, showing the separation of the routes from the controller logic.<br>• Emphasize the full implementation of the 4 core HTTP request methods (GET, POST, PUT, DELETE) on both the /patients and /appointments endpoints.<br>• Explain the Mongoose schemas (the Patient schema with support for a middle name and the Appointment schema which uses document population).<br>• Show MongoDB Compass running live with the app to demonstrate that the frontend mutations are indeed persisting in the database.<br><br>**3. Live System Walkthrough & Feature Demo (4 minutes)**<br>• Authentication flow: Show logging in via the Admin gateway with credential validation.<br>• Dashboard Analytics: Show how the dashboard works out today's appointments, scheduled patients, completed visits, and cancellations in real time.<br>• Patient management and HTTP methods: Get patient records via HTTP GET, register a new patient via HTTP POST, perform real-time live search filtering, update patient records via HTTP PUT, and delete records via HTTP DELETE.<br>• Appointment Management & Integrity Guards: Book a new appointment (POST), show the ability to sort by Date/Time and Status, show that you can't set a future appointment to "Completed" prematurely (PUT validation), and show that a cancelled appointment is locked and can't be accidentally reactivated.<br>• Frontend Engineering Polish: Isolated table vertical scrollbar to prevent page blowout, sticky table headers, local typography, and 100% vanilla stack (no external CDNs).<br><br>**4. Conclusion, Challenges Overcome & Future Roadmap (1 minute)**<br>• Summarize the key technical issues that were resolved during development (e.g., status lifecycle sync, table layout constraints).<br>• Look at the next development sprint (role-based permissions and notification services). |

---

## How this is graded
**Total is 50 points**

| What is checked | Points |
| :--- | :---: |
| System information / description / features | 10 |
| Additional / Advanced Features Applied | 15 |
| Real progress was made this week | 10 |
| Screenshots | 15 |
| **Total** | **50** |

