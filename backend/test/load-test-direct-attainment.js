import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
export const options = {
    insecureSkipTLSVerify: true, 
    stages: [
        { duration: '30s', target: 20 },   // Stage 1: Warm-up
        { duration: '1m', target: 100 },   // Stage 2: Heavy load
        { duration: '1m', target: 300 },   // Stage 3: Extreme load
        { duration: '30s', target: 0 },    // Stage 4: Scale down
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // Allowing slightly higher latency (1s) due to heavy aggregations
        http_req_failed: ['rate<0.02'],   
    },
};

// --- GLOBAL VARIABLES ---
// Ensure this matches your running server port and the router mount path
const BASE_URL = 'https://127.0.0.1:8000/dir'; 

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VySWQiOiI2YTU4Yzc2M2FlMmM2MDBhMzY2MzBkYmIiLCJmYWN1bHR5SWQiOiJDQTIwMjYiLCJyb2xlIjoiYWRtaW4ifSwiaWF0IjoxNzg0Nzk5OTU5LCJleHAiOjE3ODQ4MDA4NTl9.XkZXhQ3OfAQpi6Tw74U3CnCgINAUPWqSsbVwZUFbeHE'; 

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
};

export default function () {
    // Variables for the Batch Calculation
    // ⚠️ IMPORTANT: For the POST calculation to fully execute and not return a 404, 
    // the specified course and year MUST have final attainment data in your DB.
    const testCourse = 'MCA';
    const testYear = '2026';

    // =========================================================================
    // 1. POST / (Extract & Calculate Attainment Levels)
    // =========================================================================
    const calcPayload = JSON.stringify({
        course: testCourse,
        academicYear: testYear
    });

    let postRes = http.post(`${BASE_URL}/`, calcPayload, { headers });
    
    check(postRes, {
        // We accept 200 (Success) or 404 (No subjects found for calculation)
        'POST batch calculation is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    
    sleep(0.5);

    // =========================================================================
    // 2. GET / (Get Single Direct Attainment Document)
    // =========================================================================
    let getSingleRes = http.get(`${BASE_URL}/?course=${testCourse}&academicYear=${testYear}`, { headers });
    
    check(getSingleRes, {
        'GET single attainment is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    
    sleep(0.5);

    // =========================================================================
    // 3. GET /report (Get All Reports Metadata)
    // =========================================================================
    let getAllRes = http.get(`${BASE_URL}/report`, { headers });
    
    check(getAllRes, {
        'GET all reports metadata is 200': (r) => r.status === 200,
    });
    
    sleep(0.5);

    // =========================================================================
    // 4. GET /year (Get Report Metadata By Year)
    // =========================================================================
    // The controller supports both POST (body) and GET (query) for this route. We use GET here.
    let getYearRes = http.get(`${BASE_URL}/year?academicYear=${testYear}`, { headers });
    
    check(getYearRes, {
        'GET reports by year is 200': (r) => r.status === 200,
    });
    
    sleep(0.5);
}