const axios = require('axios');

// Use the same backend base URL as the frontend
const BASE_URL = 'http://192.168.1.7:3001';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  uid: 'test-user-123'
};

const testSpot = {
  location: 'Test Location',
  coordinates: [19.076, 72.8777],
  hourlyRate: '$10',
  owner: 'test-user-123',
  ownerName: 'Test User'
};

const testBooking = {
  spotId: 'spot_airport_002',
  userId: 'test-user-123',
  userName: 'Test User',
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
  hours: 2,
  totalPrice: 40
};

async function runTests() {
  console.log('🚀 Starting ParkShare Server & Database Tests\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  try {
    console.log('1. Testing Health Check...');
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.status === 'OK') {
      console.log('✅ Health check passed');
      console.log(`   Users: ${response.data.usersCount}`);
      console.log(`   Spots: ${response.data.parkingSpotsCount}`);
      console.log(`   Bookings: ${response.data.bookingsCount}`);
      passedTests++;
    } else {
      console.log('❌ Health check failed');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    totalTests++;
  }

  // Test 2: Get All Users
  try {
    console.log('\n2. Testing Get All Users...');
    const response = await axios.get(`${BASE_URL}/users`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(`✅ Get users passed - ${response.data.length} users found`);
      passedTests++;
    } else {
      console.log('❌ Get users failed - no users found');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Get users failed:', error.message);
    totalTests++;
  }

  // Test 3: Get All Parking Spots
  try {
    console.log('\n3. Testing Get All Parking Spots...');
    const response = await axios.get(`${BASE_URL}/parking-spots`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(`✅ Get parking spots passed - ${response.data.length} spots found`);
      passedTests++;
    } else {
      console.log('❌ Get parking spots failed - no spots found');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Get parking spots failed:', error.message);
    totalTests++;
  }

  // Test 4: Get All Bookings
  try {
    console.log('\n4. Testing Get All Bookings...');
    const response = await axios.get(`${BASE_URL}/bookings/all`);
    if (Array.isArray(response.data) && response.data.length >= 0) {
      console.log(`✅ Get bookings passed - ${response.data.length} bookings found`);
      passedTests++;
    } else {
      console.log('❌ Get bookings failed');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Get bookings failed:', error.message);
    totalTests++;
  }

  // Test 5: Create Test Booking
  try {
    console.log('\n5. Testing Create Booking...');
    const response = await axios.post(`${BASE_URL}/bookings/test`, testBooking);
    if (response.data.booking && response.data.booking.id) {
      console.log('✅ Create booking passed');
      console.log(`   Booking ID: ${response.data.booking.id}`);
      passedTests++;
    } else {
      console.log('❌ Create booking failed');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Create booking failed:', error.message);
    totalTests++;
  }

  // Test 6: Get User Bookings
  try {
    console.log('\n6. Testing Get User Bookings...');
    const response = await axios.get(`${BASE_URL}/users/${testUser.uid}/bookings`);
    if (Array.isArray(response.data)) {
      console.log(`✅ Get user bookings passed - ${response.data.length} bookings found`);
      passedTests++;
    } else {
      console.log('❌ Get user bookings failed');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Get user bookings failed:', error.message);
    totalTests++;
  }

  // Test 7: Search Parking Spots
  try {
    console.log('\n7. Testing Search Parking Spots...');
    const response = await axios.get(`${BASE_URL}/parking-spots?search=test`);
    if (Array.isArray(response.data)) {
      console.log(`✅ Search parking spots passed - ${response.data.length} results found`);
      passedTests++;
    } else {
      console.log('❌ Search parking spots failed');
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Search parking spots failed:', error.message);
    totalTests++;
  }

  // Test 8: Data Integrity Check
  try {
    console.log('\n8. Testing Data Integrity...');
    const [usersResponse, spotsResponse, bookingsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/users`),
      axios.get(`${BASE_URL}/parking-spots`),
      axios.get(`${BASE_URL}/bookings/all`)
    ]);

    const users = usersResponse.data;
    const spots = spotsResponse.data;
    const bookings = bookingsResponse.data;

    let integrityIssues = [];

    // Check for orphaned bookings (bookings without valid spots)
    const validSpotIds = spots.map(spot => spot.id);
    const orphanedBookings = bookings.filter(booking => !validSpotIds.includes(booking.spotId));
    if (orphanedBookings.length > 0) {
      integrityIssues.push(`${orphanedBookings.length} orphaned bookings found`);
    }

    // Check for orphaned spots (spots without valid owners)
    const validUserIds = users.map(user => user.uid);
    const orphanedSpots = spots.filter(spot => !validUserIds.includes(spot.owner));
    if (orphanedSpots.length > 0) {
      integrityIssues.push(`${orphanedSpots.length} orphaned spots found`);
    }

    // Check for invalid booking data
    const invalidBookings = bookings.filter(booking => 
      !booking.startTime || !booking.endTime || !booking.userId || !booking.spotId
    );
    if (invalidBookings.length > 0) {
      integrityIssues.push(`${invalidBookings.length} invalid bookings found`);
    }

    if (integrityIssues.length === 0) {
      console.log('✅ Data integrity check passed');
      passedTests++;
    } else {
      console.log('❌ Data integrity issues found:');
      integrityIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    totalTests++;
  } catch (error) {
    console.log('❌ Data integrity check failed:', error.message);
    totalTests++;
  }

  // Test 9: WebSocket Connection Test
  try {
    console.log('\n9. Testing WebSocket Connection...');
    const io = require('socket.io-client');
    const socket = io(BASE_URL);
    
    const wsTest = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    await wsTest;
    console.log('✅ WebSocket connection passed');
    socket.disconnect();
    passedTests++;
    totalTests++;
  } catch (error) {
    console.log('❌ WebSocket connection failed:', error.message);
    totalTests++;
  }

  // Test 10: File System Check
  try {
    console.log('\n10. Testing File System...');
    const fs = require('fs');
    const path = require('path');
    
    const dataDir = path.join(__dirname, 'backend', 'data');
    const requiredFiles = ['users.json', 'spots.json', 'bookings.json'];
    
    let fileIssues = [];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        fileIssues.push(`${file} missing`);
      } else {
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          JSON.parse(data); // Test if valid JSON
        } catch (error) {
          fileIssues.push(`${file} has invalid JSON`);
        }
      }
    });

    if (fileIssues.length === 0) {
      console.log('✅ File system check passed');
      passedTests++;
    } else {
      console.log('❌ File system issues found:');
      fileIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    totalTests++;
  } catch (error) {
    console.log('❌ File system check failed:', error.message);
    totalTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Server and database are flawless!');
  } else {
    console.log('\n⚠️  Some issues found. Check the details above.');
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run the tests
runTests().catch(console.error); 