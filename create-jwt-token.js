// Use the existing test user and create JWT token
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function createJWTForExistingUser() {
  try {
    // Use the user we created before
    const userId = 'd2b5ffcd-44df-4cd6-9aa6-27341194f789';
    const tenantId = '2a9e300d-b240-44ea-a8e8-b35868cd5762';
    
    console.log(`📝 Using existing User ID: ${userId}`);
    console.log(`🏢 Using existing Tenant ID: ${tenantId}`);
    
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('❌ SUPABASE_JWT_SECRET not found');
      return;
    }
    
    const payload = {
      sub: userId,
      email: 'test.frontend@digitalwoof.com',
      aud: 'authenticated',
      role: 'authenticated',
      user_metadata: {},
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    const token = jwt.sign(payload, jwtSecret);
    
    console.log('\n🎟️ JWT Token for frontend testing:');
    console.log(token);
    
    console.log('\n🧪 Testing API with this token...');
    
    const response = await fetch('http://localhost:3001/api/tenants/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 API Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 API Response data:', JSON.stringify(data, null, 2));
      
      console.log('\n✅ SUCCESS! This token can be used for frontend testing.');
      console.log('💡 Copy this token and use it in the frontend manually for testing.');
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createJWTForExistingUser();