const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function runSmokeTest() {
  console.log('🚀 Starting Zenith Smoke Test (Node.js)...');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log('-----------------------------------');

  let failed = false;

  // 1. Check Backend Health
  try {
    console.log('🔍 Checking Backend Health...');
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('✅ Backend Health: OK');
      console.log('   Services:', response.data.services);
    } else {
      console.log('❌ Backend Health: Failed (Status: ' + response.status + ')');
      console.log('   Response Body:', response.data);
      failed = true;
    }
  } catch (err) {
    console.log('❌ Backend Health: Unreachable');
    console.log('   Error:', err.message);
    failed = true;
  }

  // 2. Check Frontend Accessibility
  try {
    console.log('🔍 Checking Frontend Accessibility...');
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend Accessibility: OK (Status: 200)');
    } else {
      console.log(`❌ Frontend Accessibility: Failed (Status: ${response.status})`);
      failed = true;
    }
  } catch (err) {
    console.log('❌ Frontend Accessibility: Unreachable');
    console.log('   Error:', err.message);
    failed = true;
  }

  // 3. Test a public API endpoint
  try {
    console.log('🔍 Checking Public Auth Endpoint...');
    // Try to hit the login route with no body just to see if the router is up
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {}, {
      validateStatus: (status) => status < 500 // 400s are fine for this test
    });
    console.log('✅ Public API Router: OK');
  } catch (err) {
    console.log('❌ Public API Router: Failed');
    console.log('   Error:', err.message);
    failed = true;
  }

  console.log('-----------------------------------');
  if (failed) {
    console.error('🚨 SMOKE TEST FAILED!');
    process.exit(1);
  } else {
    console.log('🎉 SMOKE TEST PASSED!');
    process.exit(0);
  }
}

runSmokeTest();
