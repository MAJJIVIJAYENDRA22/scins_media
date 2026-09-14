require('dotenv').config();
const http = require('http');

function login(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@scinsmedia.com';
  const testPassword = process.env.TEST_ADMIN_PASSWORD || 'Prey@nsh2018';

  console.log('1. Testing authorized admin credentials:');
  const valid = await login(adminEmail, testPassword);
  console.log('   Status:', valid.status, '| Success:', valid.body?.success, '| Has Token:', Boolean(valid.body?.data?.token));

  console.log('2. Testing with invalid password (should fail 401):');
  const old = await login(adminEmail, 'InvalidPasswordAttempt123!');
  console.log('   Status:', old.status, '| Success:', old.body?.success, '| Message:', old.body?.message);

  console.log('3. Testing with fallback admin (should fail 401):');
  const adm = await login('admin@scinsmedia.com', 'admin');
  console.log('   Status:', adm.status, '| Success:', adm.body?.success, '| Message:', adm.body?.message);

  console.log('4. Testing with random password (should fail 401):');
  const rnd = await login('admin@scinsmedia.com', 'random_pswd_xyz');
  console.log('   Status:', rnd.status, '| Success:', rnd.body?.success, '| Message:', rnd.body?.message);

  console.log('5. Testing with wrong email (should fail 401):');
  const wrg = await login('other@scinsmedia.com', 'Prey@nsh2018');
  console.log('   Status:', wrg.status, '| Success:', wrg.body?.success, '| Message:', wrg.body?.message);

  if (valid.status === 200 && valid.body?.data?.token && old.status === 401 && adm.status === 401 && rnd.status === 401 && wrg.status === 401) {
    console.log('\n✔ ALL ADMIN AUTHENTICATION SECURITY CHECKS PASSED PERFECTLY!');
  } else {
    console.error('\n❌ SOME AUTH CHECKS FAILED!');
    process.exit(1);
  }
})();
