import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution'; 

export const options = {
  vus: 100, 
  duration: '30s', 
  noConnectionReuse: false, 
};

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VySWQiOiI2YWJmOWI2NjliYmZjMGU5ZGRlYjA1ZWYiLCJmYWN1bHR5SWQiOiJDQTIwMjYiLCJyb2xlIjoiYWRtaW4ifSwiaWF0IjoxNzkzNTU1ODU0LCJleHAiOjE3OTM1NTY3NTR9.xEyTa7mKKf2eWI_8b_iIXR9mVG1lTFA48sRuY9fCOqc';

export default function () {
  // Pointing to Nginx HTTPS port 443
  const url = 'https://127.0.0.1/user';
  
  const uniqueSuffix = `${exec.vu.idInTest}${exec.vu.iterationInScenario}`;

  const payload = JSON.stringify({
    "facultyId": `202522032-${uniqueSuffix}`,
    "name": "Mr. Bikram Das",
    "email": `bikramdas${uniqueSuffix}@gmail.com`,
    "password": "cadept@1234"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive',
      'Accept-Encoding': 'gzip',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    // Accepts the 202 status from the Redis queue
    'status is 201 or 202': (r) => r.status === 201 || r.status === 202,
    'under 200ms': (r) => r.timings.duration < 200,
  });
}