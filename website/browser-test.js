/**
 * Browser Console Test - Run in browser Developer Tools
 * Tests if frontend can communicate with backend
 * 
 * Usage: 
 * 1. Open index.html in browser
 * 2. Press F12 to open Developer Tools
 * 3. Go to Console tab
 * 4. Copy and paste this code
 * 5. Press Enter
 */

(async () => {
  console.log('%c🔗 House of Styles Connection Test', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('%c========================================\n', 'color: blue');

  const baseURL = 'http://localhost:5001/api';
  const results = {};

  // Test 1: Backend Health
  console.log('1️⃣  Testing Backend Health...');
  try {
    const response = await fetch(`${baseURL}/health`);
    const data = await response.json();
    results.health = { ok: response.ok, status: response.status, data };
    console.log(response.ok ? '✅ Backend is running!' : '❌ Backend health check failed');
    console.log(`   Response: ${JSON.stringify(data)}\n`);
  } catch (error) {
    results.health = { ok: false, error: error.message };
    console.log(`❌ Backend connection failed: ${error.message}`);
    console.log(`   Make sure backend is running: cd backend && npm run dev\n`);
  }

  // Test 2: CORS Configuration
  console.log('2️⃣  Testing CORS...');
  try {
    const response = await fetch(`${baseURL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    results.cors = { ok: response.ok, status: response.status };
    console.log(response.ok ? '✅ CORS is configured correctly!' : '❌ CORS test failed');
    console.log(`   Status: ${response.status}\n`);
  } catch (error) {
    results.cors = { ok: false, error: error.message };
    console.log(`❌ CORS error: ${error.message}\n`);
  }

  // Test 3: Database
  console.log('3️⃣  Testing Database Connection...');
  try {
    const response = await fetch(`${baseURL}/products?limit=1`);
    const data = await response.json();
    results.database = { ok: response.ok, status: response.status };
    console.log(response.ok ? '✅ Database is accessible!' : '⚠️  Database may not be initialized');
    if (response.ok) {
      console.log(`   Found ${data.data?.length || 0} products\n`);
    } else {
      console.log(`   Status: ${response.status}\n`);
    }
  } catch (error) {
    results.database = { ok: false, error: error.message };
    console.log(`⚠️  Database error: ${error.message}`);
    console.log(`   This is OK on first run - you may need to add products\n`);
  }

  // Test 4: Authentication
  console.log('4️⃣  Testing Authentication...');
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });
    results.auth = { ok: response.status === 400 || response.status === 401, status: response.status };
    console.log(results.auth.ok ? '✅ Authentication endpoints working!' : '❌ Authentication test failed');
    console.log(`   Status: ${response.status} (expected 400 or 401)\n`);
  } catch (error) {
    results.auth = { ok: false, error: error.message };
    console.log(`❌ Authentication error: ${error.message}\n`);
  }

  // Test 5: Socket.IO
  console.log('5️⃣  Testing Socket.IO...');
  if (typeof io !== 'undefined') {
    console.log('✅ Socket.IO library loaded');
    try {
      const socket = io(`http://localhost:5001`, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 2,
      });

      socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server');
        console.log(`   Socket ID: ${socket.id}\n`);
        socket.disconnect();
        results.socket = { ok: true, connected: true };
        printSummary();
      });

      socket.on('connect_error', (error) => {
        console.log(`⚠️  Socket.IO connection error: ${error.message}\n`);
        results.socket = { ok: false, error: error.message };
        printSummary();
      });

      // Timeout after 3 seconds
      setTimeout(() => {
        if (!results.socket) {
          console.log('⚠️  Socket.IO connection timeout\n');
          results.socket = { ok: false, error: 'timeout' };
          socket.disconnect();
          printSummary();
        }
      }, 3000);
    } catch (error) {
      console.log(`❌ Socket.IO error: ${error.message}\n`);
      results.socket = { ok: false, error: error.message };
      printSummary();
    }
  } else {
    console.log('ℹ️  Socket.IO not loaded on this page');
    console.log(`   It will work on pages with integration scripts\n`);
    results.socket = { ok: true, note: 'Not loaded' };
    printSummary();
  }

  function printSummary() {
    console.log('%c========================================', 'color: blue');
    console.log('%c📊 Test Summary', 'color: blue; font-size: 14px; font-weight: bold');
    console.log('%c========================================\n', 'color: blue');

    const tests = [
      { name: 'Backend Health', key: 'health' },
      { name: 'CORS', key: 'cors' },
      { name: 'Database', key: 'database' },
      { name: 'Authentication', key: 'auth' },
      { name: 'Socket.IO', key: 'socket' },
    ];

    let passed = 0;
    tests.forEach(test => {
      if (results[test.key]) {
        if (results[test.key].ok) {
          console.log(`✅ ${test.name}`);
          passed++;
        } else {
          console.log(`❌ ${test.name}`);
        }
      }
    });

    console.log(`\n✨ ${passed}/${tests.length} tests passed\n`);

    if (passed === tests.length) {
      console.log('%c🎉 All systems GO! Ready to test:', 'color: green; font-size: 14px; font-weight: bold');
      console.log('1. Try registering a new account');
      console.log('2. Browse products');
      console.log('3. Upgrade to a membership tier');
      console.log('4. Create a custom order');
      console.log('5. Check out with items in cart\n');
    } else if (passed >= 3) {
      console.log('%c⚠️  Some features may not work. Check errors above.', 'color: orange; font-size: 12px');
      console.log('Common fixes:');
      console.log('- Start backend: cd backend && npm run dev');
      console.log('- Start MongoDB: mongod');
      console.log('- Check MongoDB connection in backend/.env');
    } else {
      console.log('%c❌ Critical issues. See errors above.', 'color: red; font-size: 12px');
    }

    console.log('\n%cDetailed Results:', 'font-weight: bold; font-size: 12px');
    console.table(results);
  }
})();
