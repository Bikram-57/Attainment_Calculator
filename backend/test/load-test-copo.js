import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
export const options = {
    insecureSkipTLSVerify: true, 
    stages: [
        { duration: '30s', target: 50 },   // Stage 1: Warm-up
        { duration: '1m', target: 200 },   // Stage 2: Heavy load
        { duration: '1m', target: 500 },   // Stage 3: Extreme load
        { duration: '1m', target: 1000 },  // Stage 4: Peak capacity
        { duration: '30s', target: 0 },    // Stage 5: Scale down
    ],
    thresholds: {
        http_req_duration: ['p(95)<700'], 
        http_req_failed: ['rate<0.02'],   
    },
};

// --- GLOBAL VARIABLES ---
// It is perfectly fine to have https:// here. The http module will handle it.
const BASE_URL = 'https://127.0.0.1:8000/co-po'; 

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VySWQiOiI2YTU4Yzc2M2FlMmM2MDBhMzY2MzBkYmIiLCJmYWN1bHR5SWQiOiJDQTIwMjYiLCJyb2xlIjoiYWRtaW4ifSwiaWF0IjoxNzg1NDk4MjE3LCJleHAiOjE3ODU0OTkxMTd9.gHFFQI185kMzpB3Of5YipVGjaGVqcJnR35v1TC_zXX4'; 

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
};

export default function () {
    // Generate dynamic variables to simulate concurrent faculty activity
    const uniqueSubjectId = `SUB-COPO-${__VU}-${__ITER}`;
    const testCourse = 'BCA';
    const testYear = '2026';
    const testSemester = 4;

    // =========================================================================
    // 1. POST /save-relation (Save CO-PO Mapping)
    // =========================================================================
    const mappingPayload = JSON.stringify({
        subjectId: uniqueSubjectId,
        subjectName: 'Software Engineering Analytics',
        academicYear: testYear,
        course: testCourse,
        semester: testSemester,
        mappingData: {
            "CO1": { "PO1": 3, "PO2": 2, "PO3": 1 },
            "CO2": { "PO4": 3, "PO5": 2, "PO8": 1 }, 
            "CO3": { "PO1": 1, "PO7": 3 }
        }
    });

    // FIXED: Changed https.post to http.post
    let postRes = http.post(`${BASE_URL}/save-relation`, mappingPayload, { headers });
    
    check(postRes, {
        'POST save-relation is 200': (r) => r.status === 200,
    });
    
    sleep(0.5);

    // =========================================================================
    // 2. GET /relation (Get Single Subject CO-PO Relation)
    // =========================================================================
    // FIXED: Changed https.get to http.get
    let getSingleRes = http.get(`${BASE_URL}/relation?subjectId=${uniqueSubjectId}&academicYear=${testYear}&course=${testCourse}`, { headers });
    
    check(getSingleRes, {
        'GET single relation is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    
    sleep(0.5);

    // =========================================================================
    // 3. GET /relation-yearwise (Get All Relations for a Year)
    // =========================================================================
    let getYearRes = http.get(`${BASE_URL}/relation-yearwise?academicYear=${testYear}`, { headers });
    
    check(getYearRes, {
        'GET year-wise relations is 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    
    sleep(0.5);

    // =========================================================================
    // 4. GET /filter (Get My Filtered Subjects)
    // =========================================================================
    // FIXED: Changed https.get to http.get
    let getFilterRes = http.get(`${BASE_URL}/filter?year=${testYear}`, { headers });
    
    check(getFilterRes, {
        'GET filtered subjects is 200': (r) => r.status === 200,
    });
    
    sleep(0.5);
}