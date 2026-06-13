# 🎓 CHAITANYA Institute of Science and Technology (CIST)
> **Official Web Portal & Interactive Student Attendance Dashboard**

Welcome to the official repository for the **CHAITANYA Institute of Science and Technology (CIST)** website. This project combines a modern, high-fidelity landing page detailing college information, departments, and faculty events with an advanced, real-time interactive Student Portal for attendance tracking.

---

## 📌 Project Overview

This web platform is designed to serve as a digital hub for CIST, providing students, faculty, and visitors with a seamless, responsive, and visually striking experience. 

It is divided into two primary sections:
1. **Public Landing Website (`index.html`)**: Features faculty profiles, event logs, flash news marquee tickers, accreditation details, and dynamic section grids.
2. **Student & Faculty Portal (`login.html`)**: A secure, interactive app interface allowing students to sign in using their unique roll numbers to track real-time attendance analytics, run projections via an integrated Target Calculator, and view day-by-day records.

---

## ✨ Key Features

### 🏢 1. Public College Landing Page
*   **Dynamic Banner & Accreditations**: Highlighting academic excellence in Engineering, Management, and Innovation.
*   **Flash News Ticker**: Scrolling marquee announcing real-time college notifications and urgent notices.
*   **Department Showcases**: Overviews of Computer Science (CSE), Electronics (ECE), Mechanical Engineering (ME), and Management programs.
*   **Faculty & Events Grid**: Dedicated sections showing college directories, events, and culture highlights.

### 🔑 2. Secure Portal Authentication
*   **Role-Based Login**: Dedicated tabs for **Student Login** and **Faculty Login**.
*   **Credentials Validation**: Client-side validation mechanism matching student database records.
*   **Toggle Password Visibility**: Secure input field with interactive hide/show toggle.

### 📊 3. Student Attendance Analytics Dashboard
*   **Real-time Readout**: Displays total attendance percentage alongside classes attended vs conducted.
*   **Integrated Theme Engine**: Fluid toggle between **Light Mode (White/Gold)** and **Dark Mode** for nighttime portal viewing.
*   **Target Attendance Calculator**:
    *   Allows students to set custom target attendance percentages (e.g. 75% or 80%).
    *   Computes exact number of upcoming classes required to reach target.
    *   Computes safe limits of classes that can be missed without falling below the target threshold.
*   **Filtered Views**:
    *   **Today Toggle**: Highlights the active day of the week with a prominent "Today" tag.
    *   **Week View**: Shows a day-by-day status chart (P = Present, A = Absent, H = Holiday).
    *   **Weekly Statistics Card**: Real-time breakdown of total working days, attended days, and weekly attendance percentage.
    *   **Overall View**: Comprehensive breakdown showcasing absolute conducted, attended, and absent counts.

---

## 📂 Project Structure

```text
CIST/
│
├── README.md                          # Main project documentation (this file)
└── portfolio website/                 # Project source directory
    ├── index.html                     # Main college landing page
    ├── login.html                     # Student attendance portal & dashboard
    ├── project.mobirise               # Mobirise AI designer workspace file
    ├── readme.txt                     # Mobirise project initialization guide
    │
    ├── clg/                           # Custom college assets
    │   └── logo.png                   # CIST official crest / logo
    │
    └── assets/                        # Third-party styling, fonts & script assets
        ├── bootstrap/                 # Bootstrap grid and layout engine
        ├── dropdown/                  # Interactive menu scripts and styles
        ├── theme/                     # Core styling templates
        └── web/                       # Mobirise icons library
```

---

## 🛠️ Installation & Local Setup

### Running the Project Locally
No complex installation or backend server configuration is required for static preview. You can run it instantly:
1. Clone or download this project repository folder to your local system.
2. Navigate to the `portfolio website` directory.
3. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
4. Click **"Student Portal"** or navigate directly to `login.html` to access the interactive dashboard.

### Modifying the Layout
The landing page and styling tags are integrated with **Mobirise AI Website Builder**:
1. Download and install Mobirise App (v5.9.0 or later) from [Mobirise History](https://mobirise.com/history.html).
2. Open the Mobirise App, navigate to **Sites**, and click **Import Mobirise Site**.
3. Choose the `project.mobirise` file located in the `portfolio website/` folder to load and edit the design.

---

## 🔑 Demo Login Credentials (for Testing)

Use the following student credentials in the Portal login screen to preview the interactive attendance dashboard:

| Student Roll Number | Password | Student Name | Branch Department |
| :--- | :--- | :--- | :--- |
| **`23S05A5403`** | `23S05A5403` | Sinamareddi Sai | Computer Science & Engineering |
| **`22CSE101`** | `password` | Rahul Kumar | Computer Science & Engineering |
| **`22ECE102`** | `password` | Priya Sharma | Electronics & Communication Eng. |
| **`22ME103`** | `password` | Arjun Reddy | Mechanical Engineering |

---

## 🔌 Connecting Real-Time Database APIs

The current implementation utilizes a structured client-side JSON database (`studentDb`) inside `login.html`. To link this to a live college registrar server:

1. Replace the local database search inside `handleLoginSubmit` with an asynchronous `fetch()` API request.
2. **API Endpoint Hookup Example**:
   ```javascript
   async function handleLoginSubmit(event) {
     event.preventDefault();
     const roll = document.getElementById('userIdentifier').value.trim();
     const pass = document.getElementById('password').value;
     
     try {
       const response = await fetch(`https://api.cist-college.edu/portal/attendance`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ rollNumber: roll, password: pass })
       });
       
       if (response.ok) {
         activeStudent = await response.json(); // Loads live api payload matching structure
         loadRedesignedPortal();
       } else {
         document.getElementById('errorAlertText').textContent = "Unauthorized access. Invalid credentials.";
         document.getElementById('errorAlert').style.display = 'flex';
       }
     } catch (err) {
       console.error("API error:", err);
       document.getElementById('errorAlertText').textContent = "Server communication failure.";
       document.getElementById('errorAlert').style.display = 'flex';
     }
   }
   ```
3. Ensure the return payload structure matches:
   ```json
   {
     "roll": "23S05A5403",
     "name": "Sinamareddi Sai",
     "branch": "Computer Science & Engineering",
     "conducted": 120,
     "attended": 82,
     "weekly": {
       "1": "P",
       "2": "A",
       "3": "P",
       "4": "P",
       "5": "A",
       "6": "P",
       "0": "H"
     }
   }
   ```

---

## 🤝 Support & Community
For suggestions, enhancements, or bug reports regarding the academic database systems, please contact the **CIST Administration Office** or reach out to the project administrator.
