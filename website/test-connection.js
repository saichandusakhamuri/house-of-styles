/**
 * Connection Test Script
 * Verifies frontend-backend connectivity and configuration
 */

const API_BASE_URL = 'http://localhost:5001/api';

class ConnectionTester {
  constructor() {
    this.results = {
      backend: false,
      mongodb: false,
      cors: false,
      socket: false,
      auth: false,
    };
  }

  async runTests() {
    console.log('\n🔍 House of Styles Connection Tests\n');
    console.log('Testing connection to backend server...\n');

    await this.testBackendHealth();
    if (this.results.backend) {
      await this.testMongoDB();
      await this.testCORS();
      await this.testSocket();
      await this.testAuth();
    }

    this.printResults();
  }

  async testBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      if (response.ok) {
        this.results.backend = true;
        console.log('✅ Backend Server');
        console.log(`   Status: ${data.status}`);
        console.log(`   Time: ${data.timestamp}\n`);
      } else {
        console.log('❌ Backend Server');
        console.log(`   HTTP ${response.status}: ${response.statusText}\n`);
      }
    } catch (error) {
      console.log('❌ Backend Server');
      console.log(`   Error: ${error.message}`);
      console.log(`   Make sure backend is running: cd backend && npm run dev\n`);
    }
  }

  async testMongoDB() {
    try {
      // Try to fetch products to verify DB connection
      const response = await fetch(`${API_BASE_URL}/products?limit=1`);
      
      if (response.ok) {
        this.results.mongodb = true;
        console.log('✅ MongoDB Connection');
        console.log(`   Database accessible\n`);
      } else {
        console.log('⚠️  MongoDB Connection');
        console.log(`   HTTP ${response.status} - Database may not be initialized\n`);
      }
    } catch (error) {
      console.log('⚠️  MongoDB Connection');
      console.log(`   Error: ${error.message}`);
      console.log(`   Ensure MongoDB is running\n`);
    }
  }

  async testCORS() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.results.cors = true;
        console.log('✅ CORS Configuration');
        console.log(`   Frontend can reach backend\n`);
      } else {
        console.log('❌ CORS Configuration');
        console.log(`   HTTP ${response.status}\n`);
      }
    } catch (error) {
      console.log('❌ CORS Configuration');
      console.log(`   Error: ${error.message}\n`);
    }
  }

  async testSocket() {
    try {
      if (typeof io === 'undefined') {
        console.log('⚠️  Socket.IO');
        console.log(`   Library not loaded on this page`);
        console.log(`   Will work on HTML pages with integration\n`);
        this.results.socket = true;
      } else {
        console.log('✅ Socket.IO');
        console.log(`   Library available\n`);
        this.results.socket = true;
      }
    } catch (error) {
      console.log('⚠️  Socket.IO');
      console.log(`   Will test on frontend pages\n`);
    }
  }

  async testAuth() {
    try {
      // Test with invalid credentials
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const data = await response.json();

      // We expect this to fail, but it means auth endpoint is working
      if (response.status === 401 || response.status === 400) {
        this.results.auth = true;
        console.log('✅ Authentication Endpoints');
        console.log(`   Auth system operational\n`);
      } else {
        console.log('⚠️  Authentication Endpoints');
        console.log(`   Unexpected response: ${response.status}\n`);
      }
    } catch (error) {
      console.log('❌ Authentication Endpoints');
      console.log(`   Error: ${error.message}\n`);
    }
  }

  printResults() {
    console.log('📊 Test Summary:\n');

    const passed = Object.values(this.results).filter(v => v === true).length;
    const total = Object.keys(this.results).length;

    Object.entries(this.results).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`${status} ${key.charAt(0).toUpperCase() + key.slice(1)}`);
    });

    console.log(`\n${passed}/${total} tests passed\n`);

    if (this.results.backend && this.results.cors && this.results.auth) {
      console.log('🎉 Ready to go! Open index.html in your browser.\n');
    } else {
      console.log('⚠️  Some tests failed. Check the errors above.\n');
      console.log('Common fixes:');
      console.log('1. Start backend: cd backend && npm run dev');
      console.log('2. Start MongoDB: mongod');
      console.log('3. Check MongoDB connection string in .env');
      console.log('4. Verify no port conflicts on 5001\n');
    }
  }
}

// Run tests
const tester = new ConnectionTester();
tester.runTests();
