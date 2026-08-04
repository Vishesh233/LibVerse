const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');

const BASE_URL = 'http://localhost:5001';

function makeRequest(method, endpoint, data = null, token = null, isMultipart = false, boundary = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const bodyData = isMultipart && data ? data : data ? Buffer.from(JSON.stringify(data)) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Length': bodyData ? bodyData.length : 0,
      },
    };

    if (isMultipart && boundary) {
      options.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    } else if (data) {
      options.headers['Content-Type'] = 'application/json';
    }

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runWithToken(token) {
  console.log('Login OK\n');

  // TEST 1: URL-based cover image (Book creation with coverImage URL)
  console.log('--- TEST 1: Create Book with Cover Image URL ---');
  const uniqueIsbn1 = `URLIMG-${Date.now()}`;
  const createWithUrl = await makeRequest('POST', '/api/books', {
    title: `URL Image Test Book ${Date.now()}`,
    author: 'Test Author',
    genre: 'Programming',
    isbn: uniqueIsbn1,
    publisher: 'Test Publisher',
    publicationYear: 2024,
    description: 'Test book created with cover image URL',
    totalCopies: 5,
    availableCopies: 5,
    issuedCopies: 0,
    rating: 4.5,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
  }, token);
  console.log('  Status:', createWithUrl.status);
  console.log('  Success:', createWithUrl.data.success);
  console.log('  Message:', createWithUrl.data.message || '');
  console.log('  Has coverImage:', !!createWithUrl.data.book?.coverImage);
  console.log('  Cover URL:', createWithUrl.data.book?.coverImage);
  console.log('');

  // TEST 2: File upload (multipart)
  console.log('--- TEST 2: Upload Book Cover Image (multipart) ---');
  const imageCandidates = [
    path.join(__dirname, '../books image/71sjeQGh7VL._AC_UF1000,1000_QL80_.jpg'),
    path.join(__dirname, '../books image/images.jpg'),
    path.join(__dirname, '../../Library Management System/books image/71sjeQGh7VL._AC_UF1000,1000_QL80_.jpg'),
  ];

  const imagePath = imageCandidates.find((p) => fs.existsSync(p));
  if (!imagePath) {
    console.log('  SKIP: No test image found in books image folder');
  } else {
    console.log('  Using image:', imagePath);
    const fileBuffer = fs.readFileSync(imagePath);
    const boundary = '----TestBoundary' + Date.now();

    const header = `--${boundary}\r\nContent-Disposition: form-data; name="coverImage"; filename="test-cover.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const bodyBuffer = Buffer.concat([
      Buffer.from(header, 'utf8'),
      fileBuffer,
      Buffer.from(footer, 'utf8'),
    ]);

    const uploadRes = await makeRequest('POST', '/api/books/upload-cover', bodyBuffer, token, true, boundary);
    console.log('  Status:', uploadRes.status);
    console.log('  Success:', uploadRes.data.success);
    console.log('  Message:', uploadRes.data.message || '');
    console.log('  Cover URL:', uploadRes.data.coverUrl || 'N/A');
    console.log('');

    // TEST 3: Create book with uploaded image URL
    if (uploadRes.data.success && uploadRes.data.coverUrl) {
      const uploadedUrl = uploadRes.data.coverUrl;
      console.log('--- TEST 3: Create Book with Uploaded Image URL ---');
      const uniqueIsbn2 = `UPLOADIMG-${Date.now()}`;
      const createWithUpload = await makeRequest('POST', '/api/books', {
        title: `Uploaded Image Test Book ${Date.now()}`,
        author: 'Test Author',
        genre: 'Programming',
        isbn: uniqueIsbn2,
        publisher: 'Test Publisher',
        publicationYear: 2024,
        description: 'Test book created with uploaded image',
        totalCopies: 5,
        availableCopies: 5,
        issuedCopies: 0,
        rating: 4.5,
        coverImage: uploadedUrl,
      }, token);
      console.log('  Status:', createWithUpload.status);
      console.log('  Success:', createWithUpload.data.success);
      console.log('  Message:', createWithUpload.data.message || '');
      console.log('  Has coverImage:', !!createWithUpload.data.book?.coverImage);
      console.log('  Cover URL:', createWithUpload.data.book?.coverImage);
      console.log('');

      // TEST 4: Verify uploaded image is accessible
      console.log('--- TEST 4: Verify Uploaded Image is Accessible ---');
      const url = new URL(uploadedUrl);
      const imageRes = await new Promise((resolve) => {
        const req = http.request({
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'GET',
        }, (res) => {
          let length = 0;
          res.on('data', (chunk) => (length += chunk.length));
          res.on('end', () => resolve({ status: res.statusCode, length }));
        });
        req.on('error', (e) => resolve({ status: 0, length: 0, error: e.message }));
        req.end();
      });
      console.log('  Status:', imageRes.status);
      console.log('  Bytes:', imageRes.length);
      console.log('  Accessible:', imageRes.status === 200 && imageRes.length > 0);
      console.log('');
    }
  }

  // TEST 5: Upload endpoint rejects non-image files
  console.log('--- TEST: Upload Endpoint with Invalid File Type ---');
  const invalidBoundary = '----TestBoundary' + Date.now();
  const invalidHeader = `--${invalidBoundary}\r\nContent-Disposition: form-data; name="coverImage"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\n`;
  const invalidFooter = `\r\n--${invalidBoundary}--\r\n`;
  const invalidBody = Buffer.concat([
    Buffer.from(invalidHeader, 'utf8'),
    Buffer.from('This is not an image', 'utf8'),
    Buffer.from(invalidFooter, 'utf8'),
  ]);
  const invalidRes = await makeRequest('POST', '/api/books/upload-cover', invalidBody, token, true, invalidBoundary);
  console.log('  Status:', invalidRes.status);
  console.log('  Success:', invalidRes.data.success);
  console.log('  Message:', invalidRes.data.message || '');
  console.log('');

  console.log('=== IMAGE FLOW TEST COMPLETE ===');
  process.exit(0);
}

async function run() {
  console.log('=== IMAGE FLOW TEST ===\n');

  try {
    // Connect to the same MongoDB as the backend server
    // The backend uses MONGO_URI from .env: mongodb://127.0.0.1:27017/libraryDB
    const dotenv = require('dotenv');
    dotenv.config({ path: path.join(__dirname, '.env') });
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB');
    console.log('Connected to MongoDB\n');

    // Use existing student user
    console.log('--- Using existing student user ---');
    const email = 'john.doe@example.com';
    const password = 'password123'; // Default password from seed data
    
    // Login with the student user
    console.log('--- Login with student ---');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email,
      password,
    });
    console.log('  Login status:', loginRes.status);
    console.log('  Login success:', loginRes.data.success);
    console.log('  Login message:', loginRes.data.message || '');
    console.log('  Has token:', !!loginRes.data.token);
    console.log('');

    if (!loginRes.data.success) {
      console.error('FATAL: Could not login test user.');
      process.exit(1);
    }

    await runWithToken(loginRes.data.token);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});