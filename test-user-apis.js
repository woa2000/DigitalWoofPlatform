// Test script for user management APIs
// Run with: node test-user-apis.js

const testUserApis = async () => {
  console.log('🧪 Testing User Management APIs');
  
  try {
    // Test 1: Check if server is running
    const healthCheck = await fetch('http://localhost:5000/api/config/health');
    if (!healthCheck.ok) {
      throw new Error('Server is not running');
    }
    console.log('✅ Server is running');
    
    // Test 2: Check users endpoint (should require auth)
    const usersCheck = await fetch('http://localhost:5000/api/users');
    console.log(`📡 Users endpoint status: ${usersCheck.status} (${usersCheck.status === 401 ? 'Auth required - Expected' : 'Unexpected'})`);
    
    console.log('🎉 Basic API tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testUserApis();