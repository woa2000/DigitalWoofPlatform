import fetch from 'node-fetch';

// Test tenant API endpoint
async function testTenantAPI() {
  try {
    console.log('🧪 Testing /api/tenants/current endpoint...');
    
    const response = await fetch('http://localhost:5000/api/tenants/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nota: Em produção, você precisa de um token JWT válido aqui
        // 'Authorization': 'Bearer your_jwt_token_here'
      }
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    console.log(`📊 Content-Type: ${contentType}`);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('📊 Response data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('📊 Response text (first 500 chars):', text.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Error testing tenant API:', error);
  }
}

testTenantAPI();