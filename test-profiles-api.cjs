const http = require('http');

const data = JSON.stringify({
  userId: 'test-user-123',
  fullName: 'Teste Silva'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/profiles/init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testando criação de profile...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    
    // Agora vamos testar GET profile
    testGetProfile();
  });
});

req.on('error', (e) => {
  console.error(`Erro na requisição: ${e.message}`);
});

req.write(data);
req.end();

function testGetProfile() {
  console.log('\nTestando busca de profile...');
  
  const getOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/profiles/me',
    method: 'GET',
    headers: {
      'x-user-id': 'test-user-123'
    }
  };

  const getReq = http.request(getOptions, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', responseData);
    });
  });

  getReq.on('error', (e) => {
    console.error(`Erro na requisição GET: ${e.message}`);
  });

  getReq.end();
}