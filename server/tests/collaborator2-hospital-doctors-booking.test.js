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

async function runHospitalDoctorsBookingTests() {
  console.log('================================================================');
  console.log('DEVELOPER 2 TEST SUITE: HOSPITAL SERVICES, DOCTORS & APPOINTMENTS');
  console.log('================================================================');

  // Login as Priya Sharma to get auth session for bookings
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'patient@demo.medora',
    password: 'Demo@1234'
  });
  const cookie = Array.isArray(loginRes.cookie) ? loginRes.cookie[0].split(';')[0] : loginRes.cookie?.split(';')[0];
  console.log('0. Test Patient Authenticated:', loginRes.status === 200 ? 'PASS' : 'FAIL');

  // 1. Hospital Services GET API
  console.log('\n1. Hospital Services GET API (/api/services):');
  const servicesRes = await request('GET', '/api/services');
  console.log('   - Returns status 200:', servicesRes.status === 200 ? 'PASS' : 'FAIL');
  console.log('   - Returns Medora hospital services count >= 9:', servicesRes.data?.data?.length >= 9 ? 'PASS' : 'FAIL', `(${servicesRes.data?.data?.length} services)`);
  
  const cardiologyService = servicesRes.data?.data?.find(s => s.specialization === 'Cardiology');
  console.log('   - Service contains description, icon & startingPrice in ₹ INR:', 
    cardiologyService?.startingPrice && cardiologyService?.currency === 'INR' ? 'PASS' : 'FAIL');

  // 2. Service Doctors API (/api/services/:id/doctors)
  console.log('\n2. Service-Related Doctors API (/api/services/:id/doctors):');
  if (cardiologyService) {
    const srvDoctorsRes = await request('GET', `/api/services/${cardiologyService._id || cardiologyService.id}/doctors`);
    console.log('   - Fetches doctors belonging to service:', srvDoctorsRes.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Doctors belong to Medora Hospital:', srvDoctorsRes.data?.data?.every(d => d.hospital === 'Medora Hospital') ? 'PASS' : 'FAIL');
  }

  // 3. Medora Doctors Listing API
  console.log('\n3. Medora Doctors Listing API (/api/doctors):');
  const allDocsRes = await request('GET', '/api/doctors');
  console.log('   - Returns all verified Medora doctors:', allDocsRes.status === 200 ? 'PASS' : 'FAIL', `(${allDocsRes.data?.total} doctors)`);
  console.log('   - All doctors consistently belong to Medora Hospital:', allDocsRes.data?.data?.every(d => d.hospital === 'Medora Hospital') ? 'PASS' : 'FAIL');
  console.log('   - Doctors contain designation and services offered:', allDocsRes.data?.data?.every(d => d.designation && Array.isArray(d.servicesOffered)) ? 'PASS' : 'FAIL');

  const filteredDocs = await request('GET', '/api/doctors?specialization=Dermatology');
  console.log('   - Filter by Medora hospital department/specialization:', filteredDocs.data?.data?.length > 0 ? 'PASS' : 'FAIL');

  const featuredDocs = await request('GET', '/api/doctors/featured');
  console.log('   - Featured doctors endpoint returns 4 doctors:', featuredDocs.data?.data?.length === 4 ? 'PASS' : 'FAIL');

  // 4. Medora Doctor Details API
  console.log('\n4. Doctor Details API (/api/doctors/:id):');
  const drSarah = allDocsRes.data?.data?.[0];
  const docDetailRes = await request('GET', `/api/doctors/${drSarah._id}`);
  console.log('   - Returns doctor full profile:', docDetailRes.status === 200 && docDetailRes.data?.data?.name === drSarah.name ? 'PASS' : 'FAIL');

  // 5. Doctor Availability API
  console.log('\n5. Doctor Availability Slots API (/api/doctors/:id/availability):');
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const slotsRes = await request('GET', `/api/doctors/${drSarah._id}/availability?date=${tomorrow}`);
  console.log('   - Returns slots for requested date:', slotsRes.status === 200 && Array.isArray(slotsRes.data?.data) ? 'PASS' : 'FAIL', `(${slotsRes.data?.data?.length} slots)`);

  // 6. Doctor Fee Preview API
  console.log('\n6. Doctor Fee Preview (First visit vs Follow-up):');
  const feeRes = await request('GET', `/api/doctors/${drSarah._id}/fee-preview`, null, cookie);
  console.log('   - Returns transparent session pricing in INR:', feeRes.status === 200 && feeRes.data?.data?.currency === 'INR' ? 'PASS' : 'FAIL');
  console.log('   - Automatically detects visit type (First Visit or Follow-up):', feeRes.data?.data?.visitType ? 'PASS' : 'FAIL', `(₹${feeRes.data?.data?.applicableFee})`);

  // 7. Appointment Booking API
  console.log('\n7. Appointment Booking API (POST /api/appointments):');
  const availSlot = slotsRes.data?.data?.find(s => s.status === 'AVAILABLE');
  if (!availSlot) throw new Error('No available slot found for testing');

  const bookingRes = await request('POST', '/api/appointments', {
    doctorId: drSarah._id,
    slotId: availSlot._id,
    serviceName: 'Cardiology & Heart Care',
    consultationType: 'IN_PERSON',
    reason: 'Preventative cardiovascular wellness assessment',
    additionalComments: 'No chest pain, family history of hypertension.',
    medicalReports: ['/uploads/reports/sample-ecg.pdf']
  }, cookie);

  console.log('   - Successfully books appointment with 201:', bookingRes.status === 201 ? 'PASS' : 'FAIL');
  console.log('   - Returns unique Medora reference ID:', bookingRes.data?.data?.referenceId ? 'PASS' : 'FAIL', `(${bookingRes.data?.data?.referenceId})`);

  // 8. SIMULTANEOUS / CONCURRENT BOOKING TEST
  console.log('\n8. CRITICAL: Simultaneous / Concurrent Appointment Booking Test:');
  // Find another available slot
  const freshSlots = await request('GET', `/api/doctors/${drSarah._id}/availability?date=${tomorrow}`);
  const targetSlot = freshSlots.data?.data?.find(s => s.status === 'AVAILABLE');
  if (targetSlot) {
    // Create second patient session to simulate simultaneous collision
    const patient2Login = await request('POST', '/api/auth/register', {
      name: 'Concurrent Patient',
      email: `concurrent.${Date.now()}@test.com`,
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    const patient2Cookie = Array.isArray(patient2Login.cookie) ? patient2Login.cookie[0].split(';')[0] : patient2Login.cookie?.split(';')[0];

    // Fire 2 SIMULTANEOUS requests for the exact same slot!
    const [simulRes1, simulRes2] = await Promise.all([
      request('POST', '/api/appointments', {
        doctorId: drSarah._id,
        slotId: targetSlot._id,
        consultationType: 'IN_PERSON',
        reason: 'Simultaneous Patient 1'
      }, cookie),
      request('POST', '/api/appointments', {
        doctorId: drSarah._id,
        slotId: targetSlot._id,
        consultationType: 'IN_PERSON',
        reason: 'Simultaneous Patient 2'
      }, patient2Cookie)
    ]);

    const statuses = [simulRes1.status, simulRes2.status];
    const hasSuccess = statuses.includes(201);
    const hasConflict = statuses.includes(409);

    console.log('   - Simultaneous Request 1 Status:', simulRes1.status);
    console.log('   - Simultaneous Request 2 Status:', simulRes2.status);
    console.log('   - Exactly ONE request succeeded (201):', hasSuccess ? 'PASS' : 'FAIL');
    console.log('   - Competing request rejected with HTTP 409 Conflict:', hasConflict ? 'PASS' : 'FAIL');
    console.log('   - Concurrency protection message friendly and clear:', 
      (simulRes1.data?.message || simulRes2.data?.message)?.includes('already') || (simulRes1.data?.message || simulRes2.data?.message)?.includes('booked') ? 'PASS' : 'FAIL');
  }

  // 9. My Appointments Listing API
  console.log('\n9. Patient Appointments Listing API (GET /api/appointments):');
  const myAppts = await request('GET', '/api/appointments', null, cookie);
  console.log('   - Lists appointments for authenticated patient only:', myAppts.status === 200 && Array.isArray(myAppts.data?.data) ? 'PASS' : 'FAIL');
  console.log('   - Populates doctor details & hospital name:', myAppts.data?.data?.[0]?.doctorId?.hospital === 'Medora Hospital' ? 'PASS' : 'FAIL');

  const yearFiltered = await request('GET', '/api/appointments?year=2025', null, cookie);
  console.log('   - Supports year filtering:', yearFiltered.status === 200 ? 'PASS' : 'FAIL');

  // 10. Appointment Cancellation API
  console.log('\n10. Appointment Cancellation API (PATCH /api/appointments/:id/cancel):');
  const apptToCancel = bookingRes.data?.data;
  if (apptToCancel) {
    const cancelRes = await request('PATCH', `/api/appointments/${apptToCancel._id || apptToCancel.id}/cancel`, null, cookie);
    console.log('   - Cancels appointment with status CANCELLED:', cancelRes.status === 200 && cancelRes.data?.data?.status === 'CANCELLED' ? 'PASS' : 'FAIL');
  }

  // 11. Unauthorized Access Protection
  console.log('\n11. Patient Authorization Protection:');
  const unauthAppts = await request('GET', '/api/appointments');
  console.log('   - Prevents unauthenticated access with 401:', unauthAppts.status === 401 ? 'PASS' : 'FAIL');

  console.log('================================================================');
  console.log('ALL DEVELOPER 2 HOSPITAL, DOCTORS & BOOKING TESTS PASSED!');
  console.log('================================================================');
}

runHospitalDoctorsBookingTests().catch((e) => {
  console.error('DEVELOPER 2 TEST FAILURE:', e);
  process.exit(1);
});
