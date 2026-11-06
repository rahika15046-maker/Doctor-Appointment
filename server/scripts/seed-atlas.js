import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('Connecting to MongoDB Atlas...');
await mongoose.connect(uri);
console.log('Connected to MongoDB Atlas successfully!');

// Ensure Mongoose models are registered
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  isActive: { type: Boolean, default: true },
  avatar: String,
  bloodGroup: String,
  dateOfBirth: String,
  gender: String,
  emergencyContact: String,
  address: String,
  profileCompletion: { type: Number, default: 80 },
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  qualification: String,
  specialization: { type: String, index: true },
  experience: Number,
  hospital: String,
  consultationFee: Number,
  consultationTypes: [{ type: String, enum: ['IN_PERSON', 'ONLINE'] }],
  workingDays: [Number],
  averageRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  avatar: String,
  about: String,
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED'], default: 'PENDING' },
  isDemo: { type: Boolean, default: true },
}, { timestamps: true });

const SlotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'], default: 'AVAILABLE' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
}, { timestamps: true });
SlotSchema.index({ doctorId: 1, startAt: 1 }, { unique: true });

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppointmentSlot', required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  consultationType: { type: String, enum: ['IN_PERSON', 'ONLINE'], required: true },
  reason: { type: String, required: true, maxlength: 500 },
  additionalComments: String,
  consultationFee: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'], default: 'PENDING' },
  referenceId: { type: String, required: true, unique: true },
  idempotencyKey: String,
}, { timestamps: true });

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  doctorName: String,
  date: { type: Date, default: Date.now },
  fileUrl: String,
  fileSize: String,
  status: { type: String, default: 'Uploaded' },
  notes: String,
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
const AppointmentSlot = mongoose.models.AppointmentSlot || mongoose.model('AppointmentSlot', SlotSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// Clear old demo records
console.log('Clearing existing demo records in Atlas...');
await Promise.all([
  User.deleteMany({ email: { $in: [/@demo\.medora$/, 'patient@demo.medora', 'admin@demo.medora'] } }),
  Doctor.deleteMany({ isDemo: true }),
  Appointment.deleteMany({}),
  AppointmentSlot.deleteMany({}),
  MedicalRecord.deleteMany({}),
  Notification.deleteMany({}),
]);

const pw = await bcrypt.hash('Demo@1234', 10);

// 1. Create Patient: Priya Sharma
console.log('Seeding Patient: Priya Sharma (patient@demo.medora)...');
const patient = await User.create({
  name: 'Priya Sharma',
  email: 'patient@demo.medora',
  password: pw,
  phone: '+91 98765 43210',
  role: 'patient',
  isActive: true,
  profileCompletion: 80,
  bloodGroup: 'O+',
  dateOfBirth: '1992-05-14',
  gender: 'Female',
  emergencyContact: '+91 98765 00000 (Rahul Sharma - Spouse)',
  address: '42 Health Street, Connaught Place, New Delhi',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
});

// 2. Create Admin
await User.create({
  name: 'Admin Medora',
  email: 'admin@demo.medora',
  password: pw,
  phone: '+91 90000 00000',
  role: 'admin',
  isActive: true,
});

// 3. Create Doctors matching reference image
const doctorsList = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@demo.medora',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD - Cardiology',
    experience: 15,
    hospital: 'Medora Hospital',
    firstVisitFee: 1200,
    followupFee: 700,
    consultationFee: 1200,
    currency: 'INR',
    averageRating: 4.8,
    reviewsCount: 2164,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    about: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating heart diseases. Specialized in interventional cardiology, heart rhythm disorders, and preventative cardiovascular wellness.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@demo.medora',
    specialization: 'Dermatology',
    qualification: 'MBBS, MD - Dermatology',
    experience: 10,
    hospital: 'Medora Hospital',
    firstVisitFee: 900,
    followupFee: 550,
    consultationFee: 900,
    currency: 'INR',
    averageRating: 4.7,
    reviewsCount: 1840,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    about: 'Specialized in clinical and aesthetic dermatology, acne scarring, eczema, psoriasis, and laser skin treatments.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: 'Dr. Emily Davis',
    email: 'emily.davis@demo.medora',
    specialization: 'Neurology',
    qualification: 'MBBS, MD, DM - Neurology',
    experience: 14,
    hospital: 'Medora Hospital',
    firstVisitFee: 1500,
    followupFee: 900,
    consultationFee: 1500,
    currency: 'INR',
    averageRating: 4.9,
    reviewsCount: 2410,
    avatar: 'https://images.unsplash.com/photo-1594824813512-588147321200?auto=format&fit=crop&q=80&w=600',
    about: 'Senior neurological consultant focused on headaches, epilepsy, stroke rehabilitation, and neuro-degenerative disorders.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@demo.medora',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS - Orthopedic Surgery',
    experience: 11,
    hospital: 'Medora Hospital',
    firstVisitFee: 1100,
    followupFee: 650,
    consultationFee: 1100,
    currency: 'INR',
    averageRating: 4.8,
    reviewsCount: 1920,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    about: 'Orthopedic specialist in joint preservation, sports injury arthroscopy, spine health, and musculoskeletal trauma.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: 'Dr. Anita Desai',
    email: 'anita.desai@demo.medora',
    specialization: 'Pediatrics',
    qualification: 'MBBS, DCH, MD - Pediatrics',
    experience: 12,
    hospital: 'Medora Hospital',
    firstVisitFee: 800,
    followupFee: 500,
    consultationFee: 800,
    currency: 'INR',
    averageRating: 4.9,
    reviewsCount: 3100,
    avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=600',
    about: 'Caring pediatrician passionate about newborn care, developmental milestones, vaccination, and pediatric nutrition.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: 'Dr. Rachel Adams',
    email: 'rachel.adams@demo.medora',
    specialization: 'Gynecology',
    qualification: 'MBBS, MS - Obstetrics & Gynecology',
    experience: 13,
    hospital: 'Medora Hospital',
    firstVisitFee: 1000,
    followupFee: 600,
    consultationFee: 1000,
    currency: 'INR',
    averageRating: 4.8,
    reviewsCount: 2300,
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600',
    about: 'Leading OB/GYN physician providing pre-natal care, laparoscopic surgeries, fertility support, and menopausal health.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5],
  },
  {
    name: 'Dr. David Kumar',
    email: 'david.kumar@demo.medora',
    specialization: 'Dentistry',
    qualification: 'BDS, MDS - Oral Surgery',
    experience: 9,
    hospital: 'Medora Hospital',
    firstVisitFee: 700,
    followupFee: 450,
    consultationFee: 700,
    currency: 'INR',
    averageRating: 4.7,
    reviewsCount: 1540,
    avatar: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    about: 'Experienced dental surgeon specializing in root canal therapy, teeth alignment, aesthetic smile makeovers, and implants.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5, 6],
  },
  {
    name: 'Dr. Robert Brown',
    email: 'robert.brown@demo.medora',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD - Internal Medicine',
    experience: 16,
    hospital: 'Medora Hospital',
    firstVisitFee: 600,
    followupFee: 400,
    consultationFee: 600,
    currency: 'INR',
    averageRating: 4.8,
    reviewsCount: 2750,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600',
    about: 'Comprehensive primary care physician addressing chronic hypertension, metabolic disease, fever disorders, and wellness.',
    consultationTypes: ['IN_PERSON', 'ONLINE'],
    workingDays: [1, 2, 3, 4, 5, 6],
  },
];

console.log('Seeding 8 doctors and generating availability slots for next 14 days...');
const createdDoctors = [];
for (const docData of doctorsList) {
  const userDoc = await User.create({
    name: docData.name,
    email: docData.email,
    password: pw,
    role: 'doctor',
    isActive: true,
    avatar: docData.avatar,
  });

  const doctor = await Doctor.create({
    userId: userDoc._id,
    name: docData.name,
    qualification: docData.qualification,
    specialization: docData.specialization,
    experience: docData.experience,
    hospital: docData.hospital,
    consultationFee: docData.consultationFee,
    averageRating: docData.averageRating,
    reviewsCount: docData.reviewsCount,
    avatar: docData.avatar,
    about: docData.about,
    consultationTypes: docData.consultationTypes,
    workingDays: docData.workingDays,
    verificationStatus: 'VERIFIED',
    isDemo: true,
  });
  createdDoctors.push(doctor);

  // Generate slots for next 14 days
  const now = new Date();
  const slotsToInsert = [];
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const targetDate = new Date(now.getTime() + dayOffset * 864e5);
    const dayNum = targetDate.getDay();
    if (!docData.workingDays.includes(dayNum === 0 ? 7 : dayNum)) continue;

    const dateStr = targetDate.toISOString().slice(0, 10);
    for (const hour of [9, 10, 11, 12, 14, 15, 16, 17]) {
      const startAt = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00+05:30`);
      const endAt = new Date(startAt.getTime() + 45 * 60e3);
      slotsToInsert.push({
        doctorId: doctor._id,
        startAt,
        endAt,
        status: 'AVAILABLE',
      });
    }
  }
  await AppointmentSlot.insertMany(slotsToInsert);
}

// 4. Seed Appointments for Priya Sharma (matching exact dashboard stats)
console.log('Seeding Appointments for Priya Sharma...');
const drSarah = createdDoctors[0];
const drMichael = createdDoctors[1];
const drEmily = createdDoctors[2];
const drJames = createdDoctors[3];
const drRobert = createdDoctors[7];

// 1 Upcoming Confirmed Appointment (Dr. Sarah Johnson, Tomorrow 10:00 AM)
const tomorrow = new Date(Date.now() + 864e5);
const tomorrowStr = tomorrow.toISOString().slice(0, 10);
const upcomingStart = new Date(`${tomorrowStr}T10:00:00+05:30`);
const upcomingEnd = new Date(upcomingStart.getTime() + 45 * 60e3);

// Claim slot
let upcomingSlot = await AppointmentSlot.findOne({
  doctorId: drSarah._id,
  startAt: upcomingStart,
});
if (!upcomingSlot) {
  upcomingSlot = await AppointmentSlot.create({
    doctorId: drSarah._id,
    startAt: upcomingStart,
    endAt: upcomingEnd,
    status: 'BOOKED',
  });
} else {
  upcomingSlot.status = 'BOOKED';
  await upcomingSlot.save();
}

const upcomingAppt = await Appointment.create({
  patientId: patient._id,
  doctorId: drSarah._id,
  slotId: upcomingSlot._id,
  startAt: upcomingStart,
  endAt: upcomingEnd,
  consultationType: 'IN_PERSON',
  reason: 'Routine cardiac health review and blood pressure checkup',
  additionalComments: 'Patient reports occasional mild palpitation after exercise.',
  consultationFee: drSarah.consultationFee,
  status: 'CONFIRMED',
  referenceId: 'MED-2025-0425-001',
});
upcomingSlot.appointmentId = upcomingAppt._id;
await upcomingSlot.save();

// 3 Completed Appointments
const past1 = new Date(Date.now() - 30 * 864e5);
const dummySlot1 = await AppointmentSlot.create({ doctorId: drMichael._id, startAt: past1, endAt: new Date(past1.getTime() + 45 * 60e3), status: 'BOOKED' });
await Appointment.create({
  patientId: patient._id,
  doctorId: drMichael._id,
  slotId: dummySlot1._id,
  startAt: past1,
  endAt: new Date(past1.getTime() + 45 * 60e3),
  consultationType: 'ONLINE',
  reason: 'Skin rash & seasonal allergy consultation',
  consultationFee: drMichael.consultationFee,
  status: 'COMPLETED',
  referenceId: 'MED-2025-0315-089',
});

const past2 = new Date(Date.now() - 60 * 864e5);
const dummySlot2 = await AppointmentSlot.create({ doctorId: drEmily._id, startAt: past2, endAt: new Date(past2.getTime() + 45 * 60e3), status: 'BOOKED' });
await Appointment.create({
  patientId: patient._id,
  doctorId: drEmily._id,
  slotId: dummySlot2._id,
  startAt: past2,
  endAt: new Date(past2.getTime() + 45 * 60e3),
  consultationType: 'IN_PERSON',
  reason: 'Migraine and sleep disorder consultation',
  consultationFee: drEmily.consultationFee,
  status: 'COMPLETED',
  referenceId: 'MED-2025-0210-044',
});

const past3 = new Date(Date.now() - 90 * 864e5);
const dummySlot3 = await AppointmentSlot.create({ doctorId: drRobert._id, startAt: past3, endAt: new Date(past3.getTime() + 45 * 60e3), status: 'BOOKED' });
await Appointment.create({
  patientId: patient._id,
  doctorId: drRobert._id,
  slotId: dummySlot3._id,
  startAt: past3,
  endAt: new Date(past3.getTime() + 45 * 60e3),
  consultationType: 'IN_PERSON',
  reason: 'Annual complete body health checkup',
  consultationFee: drRobert.consultationFee,
  status: 'COMPLETED',
  referenceId: 'MED-2025-0108-012',
});

// 1 Cancelled Appointment
const past4 = new Date(Date.now() - 75 * 864e5);
const dummySlot4 = await AppointmentSlot.create({ doctorId: drJames._id, startAt: past4, endAt: new Date(past4.getTime() + 45 * 60e3), status: 'AVAILABLE' });
await Appointment.create({
  patientId: patient._id,
  doctorId: drJames._id,
  slotId: dummySlot4._id,
  startAt: past4,
  endAt: new Date(past4.getTime() + 45 * 60e3),
  consultationType: 'IN_PERSON',
  reason: 'Knee joint ache consultation',
  consultationFee: drJames.consultationFee,
  status: 'CANCELLED',
  referenceId: 'MED-2025-0122-031',
});

// 5. Seed Medical Records
console.log('Seeding Medical Records...');
await MedicalRecord.create([
  {
    patientId: patient._id,
    title: 'Complete Blood Count (CBC) Panel',
    category: 'Diagnostic Lab',
    doctorName: 'Dr. Robert Brown',
    date: new Date(Date.now() - 10 * 864e5),
    fileUrl: '#',
    fileSize: '1.4 MB',
    status: 'Normal',
    notes: 'All vitals and blood parameters within healthy standard range.',
  },
  {
    patientId: patient._id,
    title: 'Resting ECG & Cardiac Rhythm Graph',
    category: 'Cardiology Report',
    doctorName: 'Dr. Sarah Johnson',
    date: new Date(Date.now() - 25 * 864e5),
    fileUrl: '#',
    fileSize: '2.8 MB',
    status: 'Reviewed',
    notes: 'Normal sinus rhythm; no acute ischemia detected.',
  },
  {
    patientId: patient._id,
    title: 'Dermatological Allergy & Skin Biopsy Report',
    category: 'Dermatology',
    doctorName: 'Dr. Michael Chen',
    date: new Date(Date.now() - 35 * 864e5),
    fileUrl: '#',
    fileSize: '950 KB',
    status: 'Action Required',
    notes: 'Mild contact dermatitis; antihistamine recommended.',
  },
  {
    patientId: patient._id,
    title: 'Annual Comprehensive Health Assessment Summary',
    category: 'General Medicine',
    doctorName: 'Medora Hospital — Internal Medicine',
    date: new Date(Date.now() - 90 * 864e5),
    fileUrl: '#',
    fileSize: '3.1 MB',
    status: 'Completed',
    notes: 'Overall physical health index in top percentile.',
  },
]);

// 6. Seed Notifications (2 unread matching the red badge in image!)
console.log('Seeding Notifications...');
await Notification.create([
  {
    patientId: patient._id,
    title: 'Upcoming Appointment Reminder',
    message: 'Your consultation with Dr. Sarah Johnson is scheduled for tomorrow at 10:00 AM.',
    type: 'appointment',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600e3),
  },
  {
    patientId: patient._id,
    title: 'Lab Report Ready for Download',
    message: 'Your Complete Blood Count (CBC) test report is now uploaded and available in Medical Records.',
    type: 'report',
    isRead: false,
    createdAt: new Date(Date.now() - 8 * 3600e3),
  },
  {
    patientId: patient._id,
    title: 'Appointment Confirmed',
    message: 'Booking MED-2025-0425-001 has been confirmed with Dr. Sarah Johnson.',
    type: 'appointment',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600e3),
  },
]);

console.log('========================================================');
console.log('MONGODB ATLAS SEEDING COMPLETE!');
console.log('Seeded into database: medora');
console.log('- 8 Doctors with 14-day availability slots');
console.log('- Priya Sharma (patient@demo.medora / Demo@1234)');
console.log('- 5 Appointments (1 Upcoming, 3 Completed, 1 Cancelled)');
console.log('- 4 Medical Records & 3 Notifications (2 unread)');
console.log('========================================================');

await mongoose.disconnect();
process.exit(0);


