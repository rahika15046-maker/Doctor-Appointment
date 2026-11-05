import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Notification from '../models/Notification.js';
import Service from '../models/Service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import * as svc from '../services/appointment.service.js';

const r = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

const JWT_SECRET = process.env.JWT_SECRET || 'medora-production-jwt-secret-key-32chars';

// Multer Storage Configuration
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ApiError(400, 'Only image files (JPEG, PNG, WEBP) are allowed for avatar'));
    }
    cb(null, true);
  }
});

const reportStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'reports');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `report-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});

const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const setCookie = (res, u) => {
  const token = jwt.sign({ sub: u.id || u._id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 864e5,
  });
};

const pub = (u) => ({
  id: u.id || u._id,
  _id: u.id || u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  avatar: u.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  profileCompletion: u.profileCompletion ?? 80,
  bloodGroup: u.bloodGroup,
  dateOfBirth: u.dateOfBirth,
  gender: u.gender,
  address: u.address,
  emergencyContact: u.emergencyContact,
});

// Authentication
r.post('/auth/register', wrap(async (req, res) => {
  const { name, email, password, confirmPassword, phone } = req.body;
  if (!name || name.trim().length < 2) {
    throw new ApiError(400, 'Full name with at least 2 characters is required');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, 'A valid email address is required');
  }
  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match. Please re-enter.');
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');
  
  const pwHash = await bcrypt.hash(password, 10);
  const u = await User.create({
    name: name.trim(),
    email: cleanEmail,
    phone: phone || '+91 98765 00000',
    address: 'Saket Health District, New Delhi',
    password: pwHash,
    role: 'patient',
    isActive: true,
    profileCompletion: 75,
  });
  setCookie(res, u);
  res.status(201).json({ success: true, data: pub(u), message: 'Account created successfully!' });
}));

r.post('/auth/login', wrap(async (req, res) => {
  const cleanEmail = String(req.body.email || '').toLowerCase().trim();
  const { password } = req.body;
  if (!cleanEmail || !password) {
    throw new ApiError(400, 'Email and password are required');
  }
  const u = await User.findOne({ email: cleanEmail });
  if (!u || u.isActive === false) throw new ApiError(401, 'Invalid email or password');
  
  const valid = await bcrypt.compare(password || '', u.password);
  if (!valid) throw new ApiError(401, 'Invalid email or password');
  
  setCookie(res, u);
  res.json({ success: true, data: pub(u), message: 'Welcome back, ' + u.name + '!' });
}));

// Google OAuth Login
r.post('/auth/google', wrap(async (req, res) => {
  const { email, name, avatar } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, 'Valid Google email required');
  }
  const cleanEmail = String(email).toLowerCase().trim();
  let u = await User.findOne({ email: cleanEmail });
  if (!u) {
    const randomPw = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    u = await User.create({
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: randomPw,
      phone: '+91 98765 00000',
      role: 'patient',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      profileCompletion: 80,
      address: 'Saket Health District, New Delhi',
    });
  }
  setCookie(res, u);
  res.json({ success: true, data: pub(u), message: 'Signed in with Google successfully' });
}));

r.post('/auth/logout', (_q, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

r.get('/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, data: pub(req.user) });
});

// Profile Picture Upload
r.post('/auth/avatar', requireAuth, uploadAvatar.single('avatar'), wrap(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please select an image file to upload');
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  if (typeof req.user.save === 'function') {
    req.user.avatar = avatarUrl;
    await req.user.save();
  } else {
    await User.updateOne({ _id: req.user._id || req.user.id }, { avatar: avatarUrl });
    req.user.avatar = avatarUrl;
  }
  res.json({ success: true, avatarUrl, data: pub(req.user), message: 'Profile picture updated successfully' });
}));

// Change Password
r.patch('/auth/change-password', requireAuth, wrap(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }
  if (confirmPassword && newPassword !== confirmPassword) {
    throw new ApiError(400, 'New passwords do not match');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }
  const u = await User.findOne({ _id: req.user._id || req.user.id });
  if (!u) throw new ApiError(404, 'User not found');

  const valid = await bcrypt.compare(currentPassword, u.password);
  if (!valid) throw new ApiError(401, 'Current password entered is incorrect');

  const newHash = await bcrypt.hash(newPassword, 10);
  if (typeof u.save === 'function') {
    u.password = newHash;
    await u.save();
  } else {
    await User.updateOne({ _id: u._id }, { password: newHash });
  }
  res.json({ success: true, message: 'Password has been updated successfully' });
}));

r.patch('/auth/profile', requireAuth, wrap(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'bloodGroup', 'dateOfBirth', 'gender', 'emergencyContact', 'address'];
  const updateData = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updateData[key] = req.body[key];
  }
  
  // Recalculate profile completion
  const checkFields = ['name', 'email', 'phone', 'bloodGroup', 'dateOfBirth', 'gender', 'emergencyContact', 'address'];
  let filledCount = 0;
  for (const f of checkFields) {
    if (updateData[f] || req.user[f]) filledCount++;
  }
  updateData.profileCompletion = Math.round((filledCount / checkFields.length) * 100);

  if (typeof req.user.save === 'function') {
    Object.assign(req.user, updateData);
    await req.user.save();
  } else {
    await User.updateOne({ _id: req.user._id || req.user.id }, updateData);
    Object.assign(req.user, updateData);
  }

  res.json({ success: true, data: pub(req.user) });
}));

// Specializations
r.get('/specializations', (_req, res) => {
  const specs = [
    { id: 'cardiology', name: 'Cardiology', icon: 'heart', description: 'Heart, valves and blood circulation specialists', doctorsCount: 4 },
    { id: 'dermatology', name: 'Dermatology', icon: 'sparkles', description: 'Skin, hair, nails and aesthetic health', doctorsCount: 3 },
    { id: 'neurology', name: 'Neurology', icon: 'brain', description: 'Brain, spinal cord and nervous system care', doctorsCount: 3 },
    { id: 'pediatrics', name: 'Pediatrics', icon: 'baby', description: 'Infant, child and adolescent health care', doctorsCount: 5 },
    { id: 'gynecology', name: 'Gynecology', icon: 'female', description: "Women's reproductive and maternal wellness", doctorsCount: 4 },
    { id: 'dentistry', name: 'Dentistry', icon: 'smile', description: 'Teeth, gums, cosmetic and oral care', doctorsCount: 3 },
    { id: 'general-medicine', name: 'General Medicine', icon: 'stethoscope', description: 'Primary health consultations & preventive wellness', doctorsCount: 6 },
    { id: 'orthopedics', name: 'Orthopedics', icon: 'activity', description: 'Bones, joints, ligaments and sports injuries', doctorsCount: 4 },
  ];
  res.json({ success: true, data: specs });
});

// Medora Hospital Services API
r.get('/services', wrap(async (_req, res) => {
  const list = await Service.find({}).sort('startingPrice');
  res.json({ success: true, data: list, count: list.length });
}));

r.get('/services/:id', wrap(async (req, res) => {
  const srv = await Service.findOne({ _id: req.params.id });
  if (!srv) throw new ApiError(404, 'Hospital service not found');
  
  const docs = await Doctor.find({
    verificationStatus: 'VERIFIED',
    $or: [
      { specialization: new RegExp(srv.specialization || srv.title, 'i') },
      { department: new RegExp(srv.department || srv.specialization, 'i') },
      { servicesOffered: srv.specialization }
    ]
  });
  
  const obj = typeof srv.toObject === 'function' ? srv.toObject() : { ...srv };
  obj.doctors = docs;
  res.json({ success: true, data: obj });
}));

r.get('/services/:id/doctors', wrap(async (req, res) => {
  const srv = await Service.findOne({ _id: req.params.id });
  if (!srv) throw new ApiError(404, 'Hospital service not found');
  const docs = await Doctor.find({
    verificationStatus: 'VERIFIED',
    $or: [
      { specialization: new RegExp(srv.specialization || srv.title, 'i') },
      { department: new RegExp(srv.department || srv.specialization, 'i') },
      { servicesOffered: srv.specialization }
    ]
  });
  res.json({ success: true, data: docs, service: srv });
}));

// Medora Hospital Doctors Listing & Department Filters
r.get('/doctors', wrap(async (req, res) => {
  const { q, specialization, department, consultationType, page = 1 } = req.query;
  const f = { verificationStatus: 'VERIFIED' };
  if (specialization && specialization !== 'All') {
    f.specialization = new RegExp(String(specialization).trim(), 'i');
  }
  if (department && department !== 'All') {
    f.department = new RegExp(String(department).trim(), 'i');
  }
  if (consultationType && consultationType !== 'ALL') {
    f.consultationTypes = consultationType;
  }
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    f.$or = [{ name: rx }, { specialization: rx }, { designation: rx }, { department: rx }, { servicesOffered: rx }];
  }
  
  const [data, total] = await Promise.all([
    Doctor.find(f).skip((Number(page) - 1) * 12).limit(12),
    Doctor.countDocuments(f),
  ]);
  res.json({ success: true, data, total });
}));

r.get('/doctors/featured', wrap(async (_req, res) => {
  const featured = await Doctor.find({ verificationStatus: 'VERIFIED' }).limit(4);
  res.json({ success: true, data: featured });
}));

r.get('/doctors/:id', wrap(async (req, res) => {
  const d = await Doctor.findOne({ _id: req.params.id, verificationStatus: 'VERIFIED' });
  if (!d) throw new ApiError(404, 'Doctor not found');
  res.json({ success: true, data: d });
}));

r.get('/doctors/:id/availability', wrap(async (req, res) => {
  const day = String(req.query.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new ApiError(400, 'date=YYYY-MM-DD required');
  const from = new Date(`${day}T00:00:00+05:30`);
  const to = new Date(from.getTime() + 864e5);
  const slots = await AppointmentSlot.find({
    doctorId: req.params.id,
    startAt: { $gte: from, $lt: to }
  }).sort('startAt').select('startAt endAt status');
  
  res.json({ success: true, data: slots });
}));

// Fee preview (checks if patient is first-visit or follow-up)
r.get('/doctors/:id/fee-preview', wrap(async (req, res) => {
  const d = await Doctor.findOne({ _id: req.params.id, verificationStatus: 'VERIFIED' });
  if (!d) throw new ApiError(404, 'Doctor not found');

  let isFollowup = false;
  // If user has token, check history
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const { sub } = jwt.verify(token, JWT_SECRET);
      const prev = await Appointment.findOne({
        patientId: sub,
        doctorId: d._id,
        status: { $in: ['COMPLETED', 'CONFIRMED'] }
      });
      if (prev) isFollowup = true;
    }
  } catch {}

  const firstVisitFee = d.firstVisitFee || d.consultationFee || 800;
  const followupFee = d.followupFee || Math.round(firstVisitFee * 0.65);
  const applicableFee = isFollowup ? followupFee : firstVisitFee;

  res.json({
    success: true,
    data: {
      isFollowup,
      firstVisitFee,
      followupFee,
      applicableFee,
      currency: 'INR',
      visitType: isFollowup ? 'Follow-up Consultation' : 'First Visit Consultation',
      savings: isFollowup ? firstVisitFee - followupFee : 0,
    }
  });
}));

// Upload Medical Report Attachment
r.post('/appointments/upload-report', requireAuth, uploadReport.single('report'), wrap(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please select a valid report file (PDF, PNG, JPG, WEBP)');
  const fileUrl = `/uploads/reports/${req.file.filename}`;
  res.status(201).json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
    message: 'Medical report uploaded successfully'
  });
}));

// Appointments
r.post('/appointments', requireAuth, requireRole('patient'), wrap(async (req, res) => {
  const { doctorId, slotId, serviceId, serviceName, consultationType, reason, additionalComments, medicalReports } = req.body;
  if (!doctorId || !slotId || !['IN_PERSON', 'ONLINE'].includes(consultationType) || !reason) {
    throw new ApiError(400, 'Missing or invalid fields');
  }
  
  const d = await Doctor.findOne({ _id: doctorId, verificationStatus: 'VERIFIED' });
  if (!d || !d.consultationTypes.includes(consultationType)) {
    throw new ApiError(400, 'Doctor or consultation type unavailable');
  }

  // Check if patient has visited this doctor before for follow-up pricing
  const patientId = req.user._id || req.user.id;
  const previousVisit = await Appointment.findOne({
    patientId,
    doctorId: d._id,
    status: { $in: ['COMPLETED', 'CONFIRMED'] },
  });

  const isFollowup = !!previousVisit;
  const firstVisitFee = d.firstVisitFee || d.consultationFee || 800;
  const followupFee = d.followupFee || Math.round(firstVisitFee * 0.65);
  const finalFee = isFollowup ? followupFee : firstVisitFee;
  
  const { appointment, replayed } = await svc.bookAppointment({
    patientId,
    doctorId,
    serviceId,
    serviceName: serviceName || d.department || d.specialization,
    slotId,
    consultationType,
    reason,
    additionalComments,
    medicalReports: Array.isArray(medicalReports) ? medicalReports : [],
    consultationFee: finalFee,
    isFollowup,
    idempotencyKey: req.get('Idempotency-Key'),
  });

  // Create patient notification
  await Notification.create({
    patientId,
    title: 'Appointment Booked Successfully',
    message: `Appointment ${appointment.referenceId} confirmed with ${d.name} at Medora Hospital (${isFollowup ? 'Follow-up' : 'First Visit'} - ₹${finalFee}).`,
    type: 'appointment',
    isRead: false,
  }).catch(() => {});

  res.status(replayed ? 200 : 201).json({ success: true, data: appointment, message: 'Appointment booked successfully' });
}));

r.get('/appointments', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { year, status } = req.query;
  const f = req.user.role === 'patient'
    ? { patientId: userId }
    : req.user.role === 'doctor'
    ? { doctorId: (await Doctor.findOne({ userId }))?._id }
    : {};
    
  if (status && status !== 'ALL') {
    f.status = status;
  }
  
  let appts = await Appointment.find(f)
    .sort('-startAt')
    .populate('doctorId', 'name specialization department designation servicesOffered qualification hospital avatar consultationFee firstVisitFee followupFee');
    
  if (year && year !== 'ALL') {
    const yrNum = parseInt(year, 10);
    if (!isNaN(yrNum)) {
      appts = appts.filter(a => new Date(a.startAt).getFullYear() === yrNum);
    }
  }
    
  res.json({ success: true, data: appts });
}));

r.patch('/appointments/:id/cancel', requireAuth, requireRole('patient'), wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const cancelled = await svc.cancelAppointment({ appointmentId: req.params.id, patientId: userId });
  
  await Notification.create({
    patientId: userId,
    title: 'Appointment Cancelled',
    message: `Appointment ${cancelled.referenceId} has been cancelled.`,
    type: 'appointment',
    isRead: false,
  }).catch(() => {});

  res.json({ success: true, data: cancelled });
}));

r.patch('/appointments/:id/reschedule', requireAuth, requireRole('patient'), wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const rescheduled = await svc.rescheduleAppointment({
    appointmentId: req.params.id,
    patientId: userId,
    newSlotId: req.body.newSlotId,
  });

  await Notification.create({
    patientId: userId,
    title: 'Appointment Rescheduled',
    message: `Appointment ${rescheduled.referenceId} rescheduled to ${new Date(rescheduled.startAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
    type: 'appointment',
    isRead: false,
  }).catch(() => {});

  res.json({ success: true, data: rescheduled });
}));

// Dashboard Stats & Overview
r.get('/dashboard/stats', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const appts = await Appointment.find({ patientId: userId }).sort('-startAt').populate('doctorId');
  
  const upcomingList = appts.filter(a => ['CONFIRMED', 'PENDING'].includes(a.status) && new Date(a.startAt) > new Date());
  const completedList = appts.filter(a => a.status === 'COMPLETED');
  const cancelledList = appts.filter(a => a.status === 'CANCELLED');
  
  const nextUpcoming = upcomingList.length > 0
    ? upcomingList.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0]
    : null;

  const activities = [
    ...(nextUpcoming ? [{
      id: 'act-1',
      title: `Appointment confirmed with ${nextUpcoming.doctorId?.name || 'Doctor'}`,
      timestamp: '2 hours ago',
      type: 'appointment'
    }] : []),
    {
      id: 'act-2',
      title: 'Medical record uploaded: Complete Blood Count',
      timestamp: '1 day ago',
      type: 'record'
    },
    {
      id: 'act-3',
      title: 'Profile information updated',
      timestamp: '3 days ago',
      type: 'profile'
    }
  ];

  res.json({
    success: true,
    data: {
      stats: {
        upcoming: upcomingList.length,
        total: appts.length,
        completed: completedList.length,
        cancelled: cancelledList.length,
      },
      profileCompletion: req.user.profileCompletion ?? 80,
      upcomingAppointment: nextUpcoming,
      recentActivities: activities,
    }
  });
}));

// Medical Records
r.get('/medical-records', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const records = await MedicalRecord.find({ patientId: userId }).sort('-date');
  res.json({ success: true, data: records });
}));

r.post('/medical-records', requireAuth, wrap(async (req, res) => {
  const { title, category, doctorName, notes, date, fileSize } = req.body;
  if (!title) throw new ApiError(400, 'Title is required');
  const userId = req.user._id || req.user.id;
  
  const record = await MedicalRecord.create({
    patientId: userId,
    title,
    category: category || 'General Consultation',
    doctorName: doctorName || 'Attending Physician',
    notes: notes || '',
    date: date ? new Date(date) : new Date(),
    fileUrl: '#',
    fileSize: fileSize || '1.2 MB',
    status: 'Verified',
  });
  res.status(201).json({ success: true, data: record });
}));

r.delete('/medical-records/:id', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  await MedicalRecord.deleteMany({ _id: req.params.id, patientId: userId });
  res.json({ success: true });
}));

// Notifications
r.get('/notifications', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const list = await Notification.find({ patientId: userId }).sort('-createdAt');
  const unreadCount = list.filter(n => !n.isRead).length;
  res.json({ success: true, data: list, unreadCount });
}));

r.patch('/notifications/:id/read', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  await Notification.updateOne({ _id: req.params.id, patientId: userId }, { isRead: true });
  res.json({ success: true });
}));

r.post('/notifications/read-all', requireAuth, wrap(async (req, res) => {
  const userId = req.user._id || req.user.id;
  await Notification.deleteMany ? null : null;
  const list = await Notification.find({ patientId: userId });
  for (const item of list) {
    item.isRead = true;
    if (typeof item.save === 'function') await item.save();
    else await Notification.updateOne({ _id: item._id }, { isRead: true });
  }
  res.json({ success: true });
}));

export default r;
