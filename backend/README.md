# Academic Attainment Calculator - Backend API

A robust, modular Node.js and Express backend designed to streamline academic management, automate student performance tracking, and handle complex Course Outcome (CO) and Program Outcome (PO) mapping. 

This API serves as the data-processing powerhouse for the full-stack academic management system, featuring automated Excel batch uploads, secure faculty profile management, and dynamic calculation engines.

---

## 🚀 Key Features

* **Dynamic Attainment Calculations:** Processes student marks to calculate attainment percentages and levels on a standardized 0-3 scale.
* **CO/PO Mapping Engine:** Maps Course Outcomes to specific examination types (quizzes, mid-terms) and includes a "4-row math" reporting algorithm that dynamically calculates students scoring above target marks for specific CO keys.
* **Strict PO Validation:** Implements strict data validation for Program Outcomes, limiting mapping inputs to a maximum of 8 specific outcomes to ensure data integrity.
* **Automated Batch Processing:** Integrates `xlsx` and `fs` modules to seamlessly parse, normalize, and upload bulk student records and subject data directly from Excel spreadsheets into the database.
* **Faculty Profile Management:** Handles secure user self-updates (via the `handleUserSelfUpdate` controller) with profile image processing using `multer`, including automated server-side file cleanup (`fs.unlinkSync`) for outdated files.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (JWT)
* **File Uploads:** Multer
* **Data Parsing:** SheetJS (`xlsx`) for Excel file processing

---

## 📂 Project Architecture

The backend follows a strict modular architecture to separate concerns, making the API scalable and easy to maintain. 

📦 backend
 ┣ 📂 controllers
 ┃ ┣ 📂 assignSubject      # Logic for subject management and mapping
 ┃ ┣ 📂 directAttainment   # Calculation logic for 0-3 scale metrics
 ┃ ┗ 📂 users              # Faculty profile management & auth
 ┣ 📂 models               # Mongoose schema definitions
 ┣ 📂 routes               # Express API route endpoints
 ┣ 📂 middleware           # JWT auth, Multer upload config, PO validators
 ┣ 📂 uploads              # Temporary directory for images & Excel files
 ┣ 📜 .env                 # Environment variables
 ┣ 📜 server.js            # Entry point
 ┗ 📜 package.json

---

## ⚙️ Prerequisites & Setup

### 1. Install Dependencies
Make sure you have Node.js and MongoDB installed on your system. Run the following command in the backend directory to install the required packages:

npm install

### 2. Environment Variables
Create a `.env` file in the root directory. You can use the provided `.env.example` as a template:

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string_here

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Frontend Connection
CLIENT_URL=http://localhost:3000

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880 # 5MB

# Email Services
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_16_letter_app_password

### 3. Start the Server

For Development (using nodemon):
npm run dev

For Production:
npm start

---

## 🧩 Core Modules & Workflows

### Subject Management (`assignSubject`)
Handles the creation and allocation of academic subjects. This module validates that only a maximum of 8 POs can be assigned to a specific subject to maintain strict curricular standards.

### Direct Attainment (`directAttainment`)
The calculation core of the API. It takes batch data (ingested via Excel uploads), parses the raw student marks, groups them by exam type, and generates the final CO attainment report based on the configured target thresholds.

### User Management & Uploads
Faculty members can update their own details securely. The system uses Multer to accept image files, saves them locally, and automatically deletes old profile pictures from the server using the `fs` module to save storage space.

---

## ✍️ Author
**Bikram Das** Backend Software Developer 
