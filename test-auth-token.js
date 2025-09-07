import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Create a test JWT token using the user ID from the database
const userId = 'a2227269-74c3-4564-8b5e-9da2546d1383'; // From the debug output

const payload = {
  sub: userId,
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  user_metadata: {}
};

const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET, {
  expiresIn: '1h'
});

console.log('🎟️ Test JWT Token:');
console.log(token);
console.log('\n📋 Payload:');
console.log(payload);

// Now test the API with this token
import fetch from 'node-fetch';

async function testWithAuth() {
  try {
    console.log('\n🧪 Testing /api/tenants/current with auth token...');
    
    const response = await fetch('http://localhost:5000/api/tenants/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📊 Response status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('📊 Response data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('📊 Response text:', text);
    }

  } catch (error) {
    console.error('❌ Error testing with auth:', error);
  }
}

testWithAuth();