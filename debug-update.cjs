const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function debugUpdateError() {
  const baseOptions = {
    hostname: 'localhost',
    port: 5000,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'test-user-456'
    }
  };

  console.log('🔍 DEBUGANDO ERRO DE UPDATE...\n');

  try {
    const updateResult = await makeRequest({
      ...baseOptions,
      path: '/api/profiles/me',
      method: 'PUT'
    }, {
      businessType: 'pet_services',
      phone: '+55 11 99999-9999',
      city: 'São Paulo',
      state: 'SP'
    });
    
    console.log(`Status: ${updateResult.status}`);
    console.log('Response:', JSON.stringify(updateResult.data, null, 2));

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

debugUpdateError();