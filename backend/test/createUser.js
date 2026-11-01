import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution'; // Imports execution context to generate unique IDs

export const options = {
  vus: 100, 
  duration: '30s', 
  noConnectionReuse: false, 
};

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySW5mbyI6eyJ1c2VySWQiOiI2YWJmOWI2NjliYmZjMGU5ZGRlYjA1ZWYiLCJmYWN1bHR5SWQiOiJDQTIwMjYiLCJyb2xlIjoiYWRtaW4ifSwiaWF0IjoxNzkzNDY5MTM1LCJleHAiOjE3OTM0NzAwMzV9.s3VJzbV6BlbwyA4ZiUjLQ1EjSqiOlUzPl-gR5kE7l7Q';

export default function () {
  const url = 'http://127.0.0.1/user';
  
  // Generate a unique identifier using the Virtual User ID and Iteration number
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
    'status is 200/201': (r) => r.status === 200 || r.status === 201,
    'under 200ms': (r) => r.timings.duration < 200,
  });
}