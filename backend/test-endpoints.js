const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

// Helper function to make HTTP requests
function makeRequest(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Helper function to make multipart form data request (for file upload)
function makeMultipartRequest(endpoint, formData, token = null) {
  return new Promise((resolve, reject) => {
    const Boundary = '----FormBoundary' + Date.now();
    const url = new URL(endpoint, BASE_URL);
    
    // Build multipart body using Buffer concatenation for binary data
    const parts = [];
    
    for (const [key, value] of formData) {
      if (value instanceof Buffer) {
        // File field
        const header = Buffer.from(
          `--${Boundary}\r\n` +
          `Content-Disposition: form-data; name="${key}"; filename="test-avatar.png"\r\n` +
          `Content-Type: image/png\r\n\r\n`
        );
        parts.push(header, value, Buffer.from('\r\n'));
      } else {
        // Text field
        const part = Buffer.from(
          `--${Boundary}\r\n` +
          `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
          `${value}\r\n`
        );
        parts.push(part);
      }
    }
    
    // Closing boundary
    const closing = Buffer.from(`--${Boundary}--\r\n`);
    parts.push(closing);
    
    // Combine all parts
    const body = Buffer.concat(parts);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${Boundary}`,
        'Content-Length': body.length,
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting Endpoint Tests ===\n');

  let authToken = null;
  let testUserId = null;

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data)}`);
    console.log(`   ✓ Health endpoint working\n`);

    // Test 2: Login
    console.log('2. Testing Login Endpoint...');
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!'
    };
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      authToken = loginResponse.data.token;
      testUserId = loginResponse.data.user._id;
      console.log(`   ✓ Login successful, token received\n`);
    } else if (loginResponse.status === 401) {
      console.log(`   ⚠ Login failed (user may not exist), trying signup...\n`);
      
      // Try signup
      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
        role: 'student'
      };
      
      const signupResponse = await makeRequest('POST', '/api/auth/signup', signupData);
      console.log(`   Signup Status: ${signupResponse.status}`);
      console.log(`   Signup Response: ${JSON.stringify(signupResponse.data, null, 2)}`);
      
      if (signupResponse.status === 201 && signupResponse.data.success) {
        authToken = signupResponse.data.token;
        testUserId = signupResponse.data.user._id;
        console.log(`   ✓ Signup successful, token received\n`);
      } else {
        console.log(`   ✗ Signup failed\n`);
        return;
      }
    } else {
      console.log(`   ✗ Login failed\n`);
      return;
    }

    // Test 3: Get Profile (GET /api/auth/me)
    console.log('3. Testing Profile Endpoint (GET /api/auth/me)...');
    const profileResponse = await makeRequest('GET', '/api/auth/me', null, authToken);
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Response: ${JSON.stringify(profileResponse.data, null, 2)}`);
    
    if (profileResponse.status === 200 && profileResponse.data.success) {
      console.log(`   ✓ Profile retrieved successfully\n`);
    } else {
      console.log(`   ✗ Profile retrieval failed\n`);
    }

    // Test 4: Avatar Upload
    console.log('4. Testing Avatar Upload Endpoint...');
    
    // Create a minimal valid PNG image (1x1 red pixel)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = [
      ['avatar', testImageBuffer],
      ['crop', JSON.stringify({ x: 0, y: 0, width: 1, height: 1 })]
    ];
    
    const avatarResponse = await makeMultipartRequest('/api/profile/upload-avatar', formData, authToken);
    console.log(`   Status: ${avatarResponse.status}`);
    console.log(`   Response: ${JSON.stringify(avatarResponse.data, null, 2)}`);
    
    if (avatarResponse.status === 200 && avatarResponse.data.success) {
      console.log(`   ✓ Avatar uploaded successfully\n`);
    } else {
      console.log(`   ✗ Avatar upload failed\n`);
    }

    // Test 5: Update Profile
    console.log('5. Testing Profile Update Endpoint...');
    const updateData = {
      name: 'Updated Test User'
    };
    
    const updateResponse = await makeRequest('PUT', '/api/auth/update-profile', updateData, authToken);
    console.log(`   Status: ${updateResponse.status}`);
    console.log(`   Response: ${JSON.stringify(updateResponse.data, null, 2)}`);
    
    if (updateResponse.status === 200 && updateResponse.data.success) {
      console.log(`   ✓ Profile updated successfully\n`);
    } else {
      console.log(`   ✗ Profile update failed\n`);
    }

    console.log('=== All Tests Completed ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run tests after a short delay to ensure server is ready
setTimeout(runTests, 2000);