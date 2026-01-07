const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAuth() {
  console.log('Testing authentication endpoints...\n');

  // Test 1: Check auth status (should be unauthenticated)
  console.log('1. Testing auth status (unauthenticated):');
  try {
    const statusResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/status',
      method: 'GET'
    });
    console.log(`Status: ${statusResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(statusResponse.body)}\n`);
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }

  // Test 2: Try login with invalid credentials
  console.log('2. Testing login with invalid credentials:');
  try {
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { email: 'invalid@example.com', password: 'wrongpassword' });
    console.log(`Status: ${loginResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(loginResponse.body)}\n`);
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }

  // Test 3: Try login with missing fields
  console.log('3. Testing login with missing fields:');
  try {
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { email: 'test@example.com' });
    console.log(`Status: ${loginResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(loginResponse.body)}\n`);
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }

  console.log('Authentication testing completed.');
}

testAuth().catch(console.error);
