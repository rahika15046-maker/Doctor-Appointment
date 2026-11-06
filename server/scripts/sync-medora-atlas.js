// server/scripts/sync-medora-atlas.js
// Synchronizes MongoDB Atlas with Medora Hospital:
// - Diagnostic Hospital Services: X-Ray, CT Scan, MRI Scan, Sonography, Blood Tests
// - Limited, realistic specializations: General Medicine, Cardiology, Orthopedics, Pediatrics

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('Connecting to MongoDB Atlas...');
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log('Connected to MongoDB Atlas successfully!');

// Schemas
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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  qualification: { type: String, required: true },
  specialization: { type: String, required: true, index: true },
  department: { type: String, index: true },
  designation: { type: String, default: 'Senior Consultant' },
  servicesOffered: [{ type: String }],
  experience: { type: Number, required: true },
  hospital: { type: String, default: 'Medora Hospital' },
  consultationFee: { type: Number, required: true },
  firstVisitFee: { type: Number, default: 800 },
  followupFee: { type: Number, default: 500 },
  currency: { type: String, default: 'INR' },
  consultationTypes: [{ type: String, enum: ['IN_PERSON', 'ONLINE'], default: ['IN_PERSON', 'ONLINE'] }],
  workingDays: [{ type: Number }],
  averageRating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  avatar: String,
  about: String,
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED'], default: 'VERIFIED' },
  isDemo: { type: Boolean, default: true },
}, { timestamps: true });

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  specialization: { type: String, required: true, index: true },
  department: { type: String, index: true },
  description: { type: String, required: true },
  overview: String,
  benefits: [String],
  features: [String],
  icon: String,
  startingPrice: { type: Number, default: 500 },
  currency: { type: String, default: 'INR' },
  popular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const SlotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'BLOCKED'], default: 'AVAILABLE', index: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
  referenceId: { type: String, unique: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName: String,
  slotId: { type: String },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true },
  consultationType: { type: String, enum: ['IN_PERSON', 'ONLINE'], default: 'IN_PERSON' },
  reason: String,
  additionalComments: String,
  consultationFee: { type: Number, default: 800 },
  currency: { type: String, default: 'INR' },
  isFollowup: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], default: 'CONFIRMED', index: true },
  medicalReports: [{ name: String, url: String, uploadedAt: Date }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const AppointmentSlot = mongoose.models.AppointmentSlot || mongoose.model('AppointmentSlot', SlotSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

async function syncAtlas() {
  console.log('\n--- 1. Syncing Demo Patient Priya Sharma ---');
  const pw = await bcrypt.hash('Demo@1234', 10);

  let patient = await User.findOne({ email: 'patient@demo.medora' });
  if (!patient) {
    patient = await User.create({
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
      address: '42 Health Street, Saket, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    });
    console.log('✓ Created patient: Priya Sharma');
  } else {
    patient.name = 'Priya Sharma';
    patient.role = 'patient';
    patient.isActive = true;
    patient.profileCompletion = 80;
    patient.password = pw;
    await patient.save();
    console.log('✓ Verified patient: Priya Sharma');
  }

  console.log('\n--- 2. Syncing Hospital Diagnostic & Imaging Services ---');
  await Service.deleteMany({});
  
  const diagnosticServices = [
    {
      title: 'Digital X-Ray (High-Resolution Radiography)',
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
      description: 'Advanced digital radiography for chest, bones, joints, spine, and abdominal diagnostics with instant high-clarity radiologist interpretation.',
      overview: 'Medora Hospital’s Radiology Department is equipped with low-dose digital radiography systems offering rapid, high-precision skeletal and pulmonary diagnosis.',
      benefits: [
        'Ultra-low radiation dosage exposure',
        'Immediate digital film preview & instant radiologist analysis',
        'Direct integration with patient portal for quick retrieval',
        'Available 24/7 for acute trauma and routine checks'
      ],
      features: ['Immediate digital imaging', 'Certified radiologist report', 'Low radiation technology', 'Available 24x7'],
      icon: 'xray',
      startingPrice: 600,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'CT Scan (Computed Tomography 128-Slice)',
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
      description: 'Ultra-fast sub-second multi-slice CT scanning for brain, chest, abdomen, pelvis, and angiography with 3D multi-planar reconstruction.',
      overview: 'Our 128-slice CT scanner delivers volumetric cross-sectional imaging for prompt emergency evaluation of stroke, trauma, chest anomalies, and internal pathologies.',
      benefits: [
        'High-speed scanning in seconds with minimum breath-hold',
        'Sub-millimeter slice resolution with 3D vascular reconstruction',
        'Non-ionic safe contrast administration with kidney protection check',
        'Certified senior radiologist emergency review'
      ],
      features: ['128-Slice rapid scan', '3D Multi-planar reconstruction', 'Emergency stroke triage', 'High diagnostic accuracy'],
      icon: 'ctscan',
      startingPrice: 2500,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'MRI Scan (Magnetic Resonance 1.5 Tesla)',
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
      description: 'High-field 1.5 Tesla silent MRI scanning for brain, neuro-spine, joints, musculoskeletal conditions, and soft tissue diagnostics without radiation.',
      overview: 'Experience silent, comfortable, radiation-free neuro and musculoskeletal imaging with Medora Hospital’s high-field Magnetic Resonance system.',
      benefits: [
        'Zero ionizing radiation exposure',
        'Superior soft-tissue contrast for brain, spine, ligaments, and joints',
        'Acoustic noise reduction technology for enhanced patient comfort',
        'Comprehensive sub-specialty neuro & musculoskeletal reporting'
      ],
      features: ['Silent scan technology', 'Zero radiation exposure', 'High-definition soft tissue', 'Expert neuro-radiology review'],
      icon: 'mriscan',
      startingPrice: 4000,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Ultrasound Sonography (USG & 4D Color Doppler)',
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
      description: 'Safe acoustic sound wave imaging for whole abdomen, pelvis, KUB, thyroid, musculoskeletal, and vascular color Doppler assessments.',
      overview: 'Our advanced ultrasound suite delivers high-frequency real-time imaging for abdominal organs, maternal wellness, thyroid profiling, and vascular blood flow.',
      benefits: [
        'Completely safe, non-invasive acoustic sound wave diagnostic',
        'High-resolution color Doppler for arterial & venous blood flow',
        'Immediate bedside printout and digital video recording',
        'Comfortable examination conducted by experienced sonologists'
      ],
      features: ['Color Doppler imaging', 'Non-invasive & radiation free', 'Immediate digital report', 'Conducted by certified MD sonologist'],
      icon: 'sonography',
      startingPrice: 1200,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Comprehensive Blood Tests & Pathology Panel',
      specialization: 'Pathology',
      department: 'Pathology & Diagnostic Laboratory',
      description: 'NABL-accredited automated pathology tests including Complete Blood Count (CBC), Lipid Profile, Liver (LFT), Kidney (KFT), Thyroid (T3/T4/TSH), and HbA1c.',
      overview: 'Medora Hospital’s fully automated pathology laboratory processes blood samples using barcode verification to ensure verified results delivered within 12 hours.',
      benefits: [
        'NABL accredited automated robotic sample analyzers',
        'Complete metabolic health audit (CBC, LFT, KFT, Lipids, Blood Sugar)',
        'Digital pathology report delivered to patient portal in 12 hours',
        'Complimentary consulting doctor interpretation support'
      ],
      features: ['Automated barcode processing', 'Report ready in 12 hours', 'Home collection available', 'Consulting physician review'],
      icon: 'bloodtest',
      startingPrice: 800,
      currency: 'INR',
      popular: true,
    },
  ];

  const createdServices = await Service.insertMany(diagnosticServices);
  console.log(`✓ Inserted ${createdServices.length} Medora Hospital diagnostic services into MongoDB Atlas.`);

  console.log('\n--- 3. Syncing Medora Core Hospital Specialists (4 Specializations) ---');
  await Doctor.deleteMany({});

  const coreDoctors = [
    {
      name: 'Dr. Robert Brown',
      email: 'robert.brown@demo.medora',
      specialization: 'General Medicine',
      department: 'General Health & Primary Care',
      designation: 'Lead Consultant - Internal Medicine & Primary Care',
      servicesOffered: ['General Medicine', 'Executive Health Checkup', 'Diabetes Clinic', 'Acute Illness Care'],
      qualification: 'MBBS, MD - Internal Medicine (Gold Medalist)',
      experience: 16,
      hospital: 'Medora Hospital',
      firstVisitFee: 600,
      followupFee: 400,
      consultationFee: 600,
      currency: 'INR',
      averageRating: 4.8,
      reviewsCount: 2750,
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Robert Brown leads Medora Hospital’s Internal Medicine Division with over 16 years of experience managing acute illnesses, fever syndromes, lifestyle disorders, and chronic disease protocols.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@demo.medora',
      specialization: 'Cardiology',
      department: 'Cardiology & Heart Care',
      designation: 'Chief of Cardiology & Senior Consultant',
      servicesOffered: ['Cardiology', 'Heart Health Screening', 'Hypertension Clinic', 'ECG Review'],
      qualification: 'MBBS, MD - Cardiology (AIIMS)',
      experience: 15,
      hospital: 'Medora Hospital',
      firstVisitFee: 1200,
      followupFee: 700,
      consultationFee: 1200,
      currency: 'INR',
      averageRating: 4.9,
      reviewsCount: 2164,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Sarah Johnson leads Medora Hospital’s Cardiology Pavilion with specialized clinical expertise in preventative cardiology, hypertension, arrhythmia management, and cardiac wellness.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    {
      name: 'Dr. James Wilson',
      email: 'james.wilson@demo.medora',
      specialization: 'Orthopedics',
      department: 'Orthopedics & Joint Care',
      designation: 'Chief Orthopedic & Joint Surgeon',
      servicesOffered: ['Orthopedics', 'Joint Preservation', 'Sports Injury Clinic', 'Spine Assessment'],
      qualification: 'MBBS, MS - Orthopedic Surgery, MCh',
      experience: 11,
      hospital: 'Medora Hospital',
      firstVisitFee: 1100,
      followupFee: 650,
      consultationFee: 1100,
      currency: 'INR',
      averageRating: 4.8,
      reviewsCount: 1920,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. James Wilson directs Medora Hospital’s Orthopedic Department, specializing in minimally invasive joint surgery, fracture trauma care, sports injury rehabilitation, and arthritis management.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5],
    },
    {
      name: 'Dr. Anita Desai',
      email: 'anita.desai@demo.medora',
      specialization: 'Pediatrics',
      department: 'Pediatrics & Child Healthcare',
      designation: 'Head of Pediatric Medicine & Child Healthcare',
      servicesOffered: ['Pediatrics', 'Well-Baby Clinic', 'Childhood Immunization', 'Nutritional Triage'],
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
      about: 'Dr. Anita Desai heads Medora Hospital’s Pediatric Wing, providing compassionate care for infants and children, developmental tracking, pediatric nutrition, and WHO cold-chain vaccinations.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
  ];

  await AppointmentSlot.deleteMany({});
  const allSlotsToInsert = [];
  const createdDoctors = [];

  for (const docData of coreDoctors) {
    let u = await User.findOne({ email: docData.email });
    if (!u) {
      u = await User.create({
        name: docData.name,
        email: docData.email,
        password: pw,
        role: 'doctor',
        isActive: true,
        avatar: docData.avatar,
      });
    } else {
      u.name = docData.name;
      u.avatar = docData.avatar;
      u.isActive = true;
      await u.save();
    }

    const doctor = await Doctor.create({
      userId: u._id,
      name: docData.name,
      qualification: docData.qualification,
      specialization: docData.specialization,
      department: docData.department,
      designation: docData.designation,
      servicesOffered: docData.servicesOffered,
      experience: docData.experience,
      hospital: 'Medora Hospital',
      consultationFee: docData.consultationFee,
      firstVisitFee: docData.firstVisitFee,
      followupFee: docData.followupFee,
      currency: docData.currency,
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
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const targetDate = new Date(now.getTime() + dayOffset * 864e5);
      const dayNum = targetDate.getDay();
      if (!docData.workingDays.includes(dayNum === 0 ? 7 : dayNum)) continue;

      const dateStr = targetDate.toISOString().slice(0, 10);
      for (const hour of [9, 10, 11, 12, 14, 15, 16, 17]) {
        const startAt = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00+05:30`);
        const endAt = new Date(startAt.getTime() + 45 * 60e3);
        allSlotsToInsert.push({
          doctorId: doctor._id,
          startAt,
          endAt,
          status: 'AVAILABLE',
          appointmentId: null,
        });
      }
    }
  }

  console.log(`✓ Inserted ${createdDoctors.length} verified Medora Hospital doctors.`);
  console.log(`\n--- 4. Generating Live Slots in MongoDB Atlas ---`);
  await AppointmentSlot.insertMany(allSlotsToInsert);
  console.log(`✓ Created ${allSlotsToInsert.length} availability slots in MongoDB Atlas.`);

  console.log('\n======================================================');
  console.log('🎉 MONGODB ATLAS SYNCHRONIZATION COMPLETE!');
  console.log('Services: X-Ray, CT Scan, MRI Scan, Sonography, Blood Tests');
  console.log('Specializations: General Medicine, Cardiology, Orthopedics, Pediatrics');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

syncAtlas().catch(err => {
  console.error('Atlas sync failed:', err);
  process.exit(1);
});
