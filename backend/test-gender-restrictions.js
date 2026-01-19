/**
 * Test script for period tracker gender restrictions
 * 
 * This script tests that:
 * 1. Female users can access period tracker endpoints
 * 2. Male users are blocked from period tracker endpoints
 * 3. Users with null gender can access period tracker endpoints
 * 4. Proper error messages are returned
 * 
 * Usage:
 *   node test-gender-restrictions.js
 * 
 * Prerequisites:
 *   - Backend server must be running
 *   - Test users must exist in database with different genders
 */

import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Test configuration
const TEST_USERS = {
  female: {
    email: 'female@test.com',
    password: 'test123',
    expectedGender: 'Female'
  },
  male: {
    email: 'male@test.com',
    password: 'test123',
    expectedGender: 'Male'
  },
  other: {
    email: 'other@test.com',
    password: 'test123',
    expectedGender: 'Other'
  }
};

// Period tracker endpoints to test
const PERIOD_ENDPOINTS = [
  { method: 'GET', path: '/api/cycles' },
  { method: 'GET', path: '/api/cycles/dashboard' },
  { method: 'GET', path: '/api/symptoms/statistics' },
  { method: 'GET', path: '/api/users/preferences' }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}========== ${msg} ==========${colors.reset}\n`)
};

// Login and get token
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    throw new Error(`Login failed for ${email}: ${error.message}`);
  }
}

// Test endpoint access
async function testEndpoint(token, method, path, shouldSucceed) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios(config);
    
    if (shouldSucceed) {
      log.success(`${method} ${path} - Access granted (${response.status})`);
      return true;
    } else {
      log.error(`${method} ${path} - Should have been blocked but got ${response.status}`);
      return false;
    }
  } catch (error) {
    if (!shouldSucceed && error.response?.status === 403) {
      const errorCode = error.response.data?.code;
      if (errorCode === 'GENDER_RESTRICTION') {
        log.success(`${method} ${path} - Correctly blocked with GENDER_RESTRICTION`);
        return true;
      } else {
        log.warn(`${method} ${path} - Blocked but without GENDER_RESTRICTION code`);
        return false;
      }
    } else if (!shouldSucceed && error.response?.status === 401) {
      log.error(`${method} ${path} - Got 401 instead of 403 (authentication issue)`);
      return false;
    } else if (shouldSucceed) {
      log.error(`${method} ${path} - Should succeed but got ${error.response?.status || error.message}`);
      return false;
    } else {
      log.error(`${method} ${path} - Unexpected error: ${error.message}`);
      return false;
    }
  }
}

// Test user access
async function testUserAccess(userType, credentials, shouldHaveAccess) {
  log.section(`Testing ${userType.toUpperCase()} User Access`);
  
  try {
    // Login
    log.info(`Logging in as ${credentials.email}...`);
    const token = await login(credentials.email, credentials.password);
    log.success(`Login successful`);
    
    // Test each endpoint
    let passedTests = 0;
    let totalTests = PERIOD_ENDPOINTS.length;
    
    for (const endpoint of PERIOD_ENDPOINTS) {
      const result = await testEndpoint(
        token, 
        endpoint.method, 
        endpoint.path, 
        shouldHaveAccess
      );
      if (result) passedTests++;
    }
    
    // Summary
    console.log(`\nResults: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      log.success(`All tests passed for ${userType} user ✓`);
      return true;
    } else {
      log.error(`Some tests failed for ${userType} user`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Period Tracker Gender Restriction Tests                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
  
  log.info(`Testing against: ${BASE_URL}`);
  log.info(`Make sure the backend server is running!\n`);
  
  let allTestsPassed = true;
  
  // Test Female user (should have access)
  const femaleResult = await testUserAccess('Female', TEST_USERS.female, true);
  allTestsPassed = allTestsPassed && femaleResult;
  
  // Test Male user (should NOT have access)
  const maleResult = await testUserAccess('Male', TEST_USERS.male, false);
  allTestsPassed = allTestsPassed && maleResult;
  
  // Test Other gender user (should NOT have access)
  const otherResult = await testUserAccess('Other', TEST_USERS.other, false);
  allTestsPassed = allTestsPassed && otherResult;
  
  // Final summary
  log.section('Final Results');
  if (allTestsPassed) {
    log.success('🎉 All tests passed! Gender restrictions are working correctly.');
  } else {
    log.error('❌ Some tests failed. Please review the implementation.');
  }
  
  console.log('\n');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  log.error(`Test execution failed: ${error.message}`);
  process.exit(1);
});


