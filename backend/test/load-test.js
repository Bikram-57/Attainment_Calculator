import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
export const options = {
    insecureSkipTLSVerify: true, 
    stages: [
        { duration: '30s', target: 50 },   // Stage 1: Fast warm-up to 50 VUs
        { duration: '1m', target: 200 },   // Stage 2: Heavy load at 200 VUs
        { duration: '1m', target: 500 },   // Stage 3: Extreme load at 500 VUs
        { duration: '1m', target: 1000 },  // Stage 4: Push to 1000 VUs
        { duration: '30s', target: 0 },    // Stage 5: Quick scale down
    ],
    thresholds: {
        http_req_duration: ['p(95)<700'], 
        http_req_failed: ['rate<0.02'],   
    },
};

// --- GLOBAL VARIABLES ---
// Using root URL. Ensure port matches your running server (3000 or 8000)
const BASE_URL = 'https://127.0.0.1:8000'; 

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VySWQiOiI2YTU4Yzc2M2FlMmM2MDBhMzY2MzBkYmIiLCJmYWN1bHR5SWQiOiJDQTIwMjYiLCJyb2xlIjoiYWRtaW4ifSwiaWF0IjoxNzg0NDU3MjA2LCJleHAiOjE3ODQ0NTgxMDZ9.ov_1KBRfBPaI4BsT51-QrRsB_dwSkbcNuWlvi9GGlLs'; 

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
};

export default function () {
    // Variables for Assign Subject (Dynamically generated to avoid DB conflicts)
    const uniqueFacultyId = `FAC-${__VU}-${__ITER}`;
    const dummySubjectId = `SUB-DUMMY-${__VU}`;
    const testCourse = 'MCA';
    const testYear = '2026';

    // Variables for Calculated PO 
    // ⚠️ IMPORTANT: To test the math logic, this MUST be a real Subject ID 
    // that already has CO-PO mappings and final attainments in your DB.
    const realSubjectId = 'SUB-101'; // <-- REPLACE THIS 
    const realSubjectName = 'Performance Engineering';

    // =========================================================================
    // PART A: ASSIGN SUBJECT ROUTES (/assignSub)
    // =========================================================================
    
    // A1. POST /assignSub/
    const assignPayload = JSON.stringify({
        facultyId: uniqueFacultyId,
        subjectId: dummySubjectId,
        subjectName: 'Advanced Load Testing',
        course: testCourse,
        academicYear: testYear
    });
    let assignPostRes = http.post(`${BASE_URL}/assignSub/`, assignPayload, { headers });
    check(assignPostRes, { 'POST assign subject is 200': (r) => r.status === 200 });
    sleep(0.5);

    // A2. GET /assignSub/:facultyId
    let getFacRes = http.get(`${BASE_URL}/assignSub/${uniqueFacultyId}?academicYear=${testYear}&course=${testCourse}`, { headers });
    check(getFacRes, { 'GET single faculty is 200': (r) => r.status === 200 });
    sleep(0.5);

    // A3. GET /assignSub/
    let getAllRes = http.get(`${BASE_URL}/assignSub/?academicYear=${testYear}&course=${testCourse}`, { headers });
    check(getAllRes, { 'GET all assignments is 200': (r) => r.status === 200 });
    sleep(0.5);

    // A4. GET /assignSub/sub 
    let getDropdownRes = http.get(`${BASE_URL}/assignSub/sub?year=${testYear}&course=${testCourse}`, { headers });
    check(getDropdownRes, { 'GET dropdown data is 200': (r) => r.status === 200 });
    sleep(0.5);

    // A5. GET /assignSub/year 
    let getYearRes = http.get(`${BASE_URL}/assignSub/year?academicYear=${testYear}`, { headers });
    check(getYearRes, { 'GET assignments by year is 200': (r) => r.status === 200 });
    sleep(0.5);

    // =========================================================================
    // PART B: CALCULATED PO ROUTES (/calpo)
    // =========================================================================

    // B1. POST /calpo/ 
    const poPayload = JSON.stringify({
        course: testCourse,
        academicYear: testYear,
        subjectId: realSubjectId,
        subjectName: realSubjectName
    });
    let poPostRes = http.post(`${BASE_URL}/calpo/`, poPayload, { headers });
    check(poPostRes, { 'POST generate PO is 201 or 404': (r) => r.status === 201 || r.status === 404 });
    sleep(0.5);

    // B2. GET /calpo/
    let poGetRes = http.get(`${BASE_URL}/calpo/?course=${testCourse}&academicYear=${testYear}&subjectId=${realSubjectId}`, { headers });
    check(poGetRes, { 'GET PO attainment is 200 or 404': (r) => r.status === 200 || r.status === 404 });
    sleep(0.5);

    // =========================================================================
    // PART C: CLEANUP (/assignSub)
    // =========================================================================
    
    // C1. DELETE /assignSub/ (Cleans up the dummy data created in Part A)
    const deletePayload = JSON.stringify({
        facultyId: uniqueFacultyId,
        subjectId: dummySubjectId,
        course: testCourse,
        academicYear: testYear
    });
    let delRes = http.del(`${BASE_URL}/assignSub/`, deletePayload, { headers });
    check(delRes, { 'DELETE subject is 200': (r) => r.status === 200 });
    sleep(0.5);
}