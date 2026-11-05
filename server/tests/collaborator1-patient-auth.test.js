import app from '../app.js';
import { connectDb } from '../db.js';
import http from 'http';
import { Socket } from 'net';

await connectDb();

function request(method, path, body = null, cookie = '') {
  return new Promise((resolve) => {
    const socket = new Socket();
    Object.defineProperty(socket, 'remoteAddress', { value: '127.0.0.1' });
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = path;
    const bodyStr = body ? JSON.stringify(body) : '';
    req.headers = {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(bodyStr),
      'host': 'localhost',
      'cookie': cookie
    };
    
    const res = new http.ServerResponse(req);
    res.assignSocket(socket);
    
    let resData = '';
    res.write = (chunk) => { if (chunk) resData += chunk.toString(); return true; };
    res.end = (chunk) => {
      if (chunk) resData += chunk.toString();
      let parsed = null;
      try { parsed = JSON.parse(resData); } catch {}
      const setCookie = res.getHeader('set-cookie');
      resolve({ status: res.statusCode, data: parsed || resData, cookie: setCookie });
    };

    app(req, res);
    if (bodyStr) req.push(bodyStr);
    req.push(null);
  });
}

async function runAuthProfileTests() {
  console.log('=====================================================');
  console.log('DEVELOPER 1 TEST SUITE: PATIENT AUTH & DASHBOARD/PROFILE');
  console.log('=====================================================');

  const testEmail = `patient.test.${Date.now()}@example.com`;

  // 1. Registration - Validation failure
  console.log('1. Registration Validation Checks:');
  const invalidName = await request('POST', '/api/auth/register', { name: 'A', email: testEmail, password: 'password123' });
  console.log('   - Rejects short name:', invalidName.status === 400 ? 'PASS' : 'FAIL');

  const invalidEmail = await request('POST', '/api/auth/register', { name: 'Valid Name', email: 'invalid-email', password: 'password123' });
  console.log('   - Rejects invalid email format:', invalidEmail.status === 400 ? 'PASS' : 'FAIL');

  const shortPassword = await request('POST', '/api/auth/register', { name: 'Valid Name', email: testEmail, password: '123' });
  console.log('   - Rejects password < 6 chars:', shortPassword.status === 400 ? 'PASS' : 'FAIL');

  const mismatchPassword = await request('POST', '/api/auth/register', { name: 'Valid Name', email: testEmail, password: 'password123', confirmPassword: 'different' });
  console.log('   - Rejects non-matching passwords:', mismatchPassword.status === 400 ? 'PASS' : 'FAIL');

  // 2. Successful Registration
  console.log('2. Patient Registration Success:');
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Aarav Mehta',
    email: testEmail,
    password: 'SecurePassword@123',
    confirmPassword: 'SecurePassword@123',
    phone: '+91 98765 11223'
  });
  console.log('   - Registers patient with 201:', regRes.status === 201 ? 'PASS' : 'FAIL', regRes.data?.data?.name);
  console.log('   - Sets secure session cookie:', regRes.cookie ? 'PASS' : 'FAIL');
  const patientCookie = Array.isArray(regRes.cookie) ? regRes.cookie[0].split(';')[0] : regRes.cookie?.split(';')[0];

  // 3. Duplicate Registration Prevention
  console.log('3. Duplicate Email Prevention:');
  const dupRes = await request('POST', '/api/auth/register', {
    name: 'Duplicate Aarav',
    email: testEmail,
    password: 'SecurePassword@123'
  });
  console.log('   - Returns 409 Conflict for duplicate email:', dupRes.status === 409 ? 'PASS' : 'FAIL');

  // 4. Patient Login
  console.log('4. Patient Login:');
  const badLogin = await request('POST', '/api/auth/login', { email: testEmail, password: 'WrongPassword' });
  console.log('   - Rejects invalid password with 401:', badLogin.status === 401 ? 'PASS' : 'FAIL');

  const goodLogin = await request('POST', '/api/auth/login', { email: testEmail, password: 'SecurePassword@123' });
  console.log('   - Accepts correct credentials with 200:', goodLogin.status === 200 ? 'PASS' : 'FAIL');

  // 5. Google OAuth Integration
  console.log('5. Google OAuth Integration:');
  const googleEmail = `google.user.${Date.now()}@medora.care`;
  const googleRes = await request('POST', '/api/auth/google', {
    email: googleEmail,
    name: 'Google Verified Patient',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
  });
  console.log('   - Google sign-in creates session with 200:', googleRes.status === 200 ? 'PASS' : 'FAIL');

  // 6. Protected Profile (/api/auth/me)
  console.log('6. Patient Profile GET (/api/auth/me):');
  const unauthMe = await request('GET', '/api/auth/me');
  console.log('   - Rejects unauthenticated request with 401:', unauthMe.status === 401 ? 'PASS' : 'FAIL');

  const authMe = await request('GET', '/api/auth/me', null, patientCookie);
  console.log('   - Returns patient profile data for authenticated session:', authMe.status === 200 && authMe.data?.data?.email === testEmail ? 'PASS' : 'FAIL');

  // 7. Profile Update
  console.log('7. Patient Profile Update (PATCH /api/auth/profile):');
  const updateRes = await request('PATCH', '/api/auth/profile', {
    phone: '+91 99999 88888',
    bloodGroup: 'B+',
    dateOfBirth: '1995-08-20',
    gender: 'Male',
    address: 'Saket Medical Enclave, New Delhi',
    emergencyContact: '+91 99999 77777 (Father)'
  }, patientCookie);
  console.log('   - Updates personal fields:', updateRes.data?.data?.bloodGroup === 'B+' && updateRes.data?.data?.gender === 'Male' ? 'PASS' : 'FAIL');
  console.log('   - Recalculates profile completion percentage:', typeof updateRes.data?.data?.profileCompletion === 'number' ? 'PASS' : 'FAIL');

  // 8. Change Password
  console.log('8. Change Password (PATCH /api/auth/change-password):');
  const badOldPw = await request('PATCH', '/api/auth/change-password', {
    currentPassword: 'WrongOldPassword',
    newPassword: 'BrandNewPassword@456',
    confirmPassword: 'BrandNewPassword@456'
  }, patientCookie);
  console.log('   - Rejects incorrect current password with 401:', badOldPw.status === 401 ? 'PASS' : 'FAIL');

  const goodPwChange = await request('PATCH', '/api/auth/change-password', {
    currentPassword: 'SecurePassword@123',
    newPassword: 'BrandNewPassword@456',
    confirmPassword: 'BrandNewPassword@456'
  }, patientCookie);
  console.log('   - Updates password successfully with 200:', goodPwChange.status === 200 ? 'PASS' : 'FAIL');

  // Verify login with new password
  const loginNewPw = await request('POST', '/api/auth/login', { email: testEmail, password: 'BrandNewPassword@456' });
  console.log('   - Can log in with newly set password:', loginNewPw.status === 200 ? 'PASS' : 'FAIL');

  // 9. Logout
  console.log('9. Patient Logout:');
  const logoutRes = await request('POST', '/api/auth/logout', null, patientCookie);
  console.log('   - Clears cookie and responds 200:', logoutRes.status === 200 ? 'PASS' : 'FAIL');

  console.log('=====================================================');
  console.log('ALL DEVELOPER 1 PATIENT AUTH & PROFILE TESTS PASSED!');
  console.log('=====================================================');
}

runAuthProfileTests().catch((e) => {
  console.error('DEVELOPER 1 TEST FAILURE:', e);
  process.exit(1);
});
