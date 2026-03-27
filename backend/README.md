# Academic Attainment Calculation API

A robust Node.js and Express backend designed to manage academic subjects, assign faculty, and automate the complex calculations required for Direct Attainment (CO-PO mapping) reporting for university batches.

## Features

* **Subject Management:** Create, update, and track academic subjects across different courses and academic years using compound indexing.
* **Faculty Assignment:** Assign multiple subjects to faculty members across various academic years while maintaining a clean, single-document-per-faculty database structure.
* **Direct Attainment Calculation:** Automatically process Course Outcome (CO) levels against Program Outcome (PO) mappings to generate a comprehensive, Excel-style final batch row report.

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **ODM:** Mongoose

## Prerequisites

Before running this project, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v14 or higher)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas URI)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd <your-project-folder>





2. Install dependencies

    npm install

3. Environment Variables

    Create a .env file in the root directory and add the following:

    PORT=8000
    MONGO_URI=your_mongodb_connection_string_here

4. Start the development server

    npm run dev
    # or
    npx nodemon index.js
API Documentation
1. Subject Management
    i. Create a New Subject

        URL: /sub/add
        Method: POST
        Body:

            JSON
            {
                "subjectId": "JAVA101",
                "subjectName": "Java Programming",
                "course": "BCA",
                "year": 2025

            }
    ii. Update an Existing Subject

        URL: /sub/:id (e.g., /sub/JAVA101)
        Method: PUT
        Body:

        JSON
        {
            "subjectName": "Advanced Java Programming",
            "course": "BCA",
            "year": 2026
        }
2. Faculty Assignments
    i. Assign a Subject to Faculty

        URL: /sub/assign
        Method: POST
        Description: Adds a subject and year to a faculty member's master assignment list.
        Body:

        JSON
        {
            "facultyId": "CA1718",
            "subjectId": "JAVA101",
            "year": 2025
        }
3. Direct Attainment Module
    i. Calculate Batch Attainment

        URL: /directAttainment/calculate-batch
        Method: POST
        Description: Fetches all subjects for the given academic year, cross-references CO-PO mappings and final CO attainments, and generates the final average calculation.
        Body:

        JSON
        {
            "academicYear": "2025",
            "course": "BCA"
        }
    ii. Success Response (Abridged):

        JSON
        {
        "success": true,
        "data": {
            "academicYear": "2025",
            "course": "BCA",
            "subjectAverages": [
            {
                "subjectId": "JAVA101",
                "poAverages": { "PO1": 2.15, "PO2": 2.20 }
            }
            ],
            "finalBatchRow": {
            "PO1": 2.13,
            "PO2": 2.08,
            "PO3": 2.03
            }
        }
        }
Project Structure
Plaintext
├── controllers/
│   ├── assignSubject.js
│   ├── directAttainment.js
│   └── subject.js
├── models/
│   ├── academicYearAttainment.js
│   ├── assignSubject.js
│   ├── coPoMapping.js
│   ├── finalCoAttainment.js
│   └── subject.js
├── routes/
│   ├── assignSubjectRoutes.js
│   ├── directAttainmentRoutes.js
│   └── subjectRoutes.js
├── index.js
├── package.json
└── .env