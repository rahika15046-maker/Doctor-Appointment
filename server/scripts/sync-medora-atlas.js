// server/scripts/sync-medora-atlas.js
// Synchronizes MongoDB Atlas with official Medora Hospital doctors, services, and appointment slots.

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
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log('Connected to MongoDB Atlas successfully!');

// Define Mongoose Schemas matching Medora architecture
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

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const AppointmentSlot = mongoose.models.AppointmentSlot || mongoose.model('AppointmentSlot', SlotSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

async function syncAtlas() {
  console.log('\n--- 1. Syncing Users & Patient Account ---');
  const pw = await bcrypt.hash('Demo@1234', 10);

  // Priya Sharma (Patient)
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

  // Admin
  let admin = await User.findOne({ email: 'admin@demo.medora' });
  if (!admin) {
    await User.create({
      name: 'Admin Medora',
      email: 'admin@demo.medora',
      password: pw,
      phone: '+91 90000 00000',
      role: 'admin',
      isActive: true,
    });
    console.log('✓ Created admin: Admin Medora');
  }

  console.log('\n--- 2. Syncing Medora Hospital Services (10 Services) ---');
  await Service.deleteMany({});
  
  const servicesData = [
    {
      title: 'General Health & Primary Care',
      specialization: 'General Medicine',
      department: 'General Medicine',
      description: 'Comprehensive primary care checkups, vital health reviews, chronic disease management, fever clinics, and preventative wellness consultations at Medora Hospital.',
      overview: 'Our General Medicine department serves as the foundation of health management, offering expert diagnosis, evidence-based treatments, and individualized lifestyle guidance.',
      benefits: ['Full body vitals screening & biometric analysis', 'Same-day e-prescription & digital health record', 'Complimentary 7-day post-consultation query support', 'Integrated pharmacy and pathology coordination'],
      features: ['Full body vitals screening', 'Digital prescription', 'Prescription medicine review', 'Free 7-day follow-up'],
      icon: 'stethoscope',
      startingPrice: 600,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Cardiology & Advanced Heart Care',
      specialization: 'Cardiology',
      department: 'Cardiology',
      description: 'Advanced non-invasive cardiac evaluation, digital 12-lead ECG review, 2D Echo triage, blood pressure optimization, and lipid management by Medora Hospital heart specialists.',
      overview: 'Dedicated to cardiac excellence, our cardiologists utilize state-of-the-art diagnostic protocols to detect, manage, and prevent cardiovascular conditions.',
      benefits: ['12-lead digital ECG and rhythm analysis', 'Cardiovascular risk stratification', 'Hypertension & lipid management protocols', 'Direct admission pathway for emergency care'],
      features: ['Resting ECG interpretation', 'Cardiovascular risk score', 'Lifestyle & diet guidance', 'Emergency referral triage'],
      icon: 'heart',
      startingPrice: 1200,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Dermatology & Skin Aesthetics',
      specialization: 'Dermatology',
      department: 'Dermatology',
      description: 'Specialized clinical dermatology for acne, eczema, psoriasis, hair loss, laser consultations, and advanced allergy diagnostics in Medora Hospital’s Skin Suite.',
      overview: 'Combining medical dermatology and aesthetic care, our dermatologists treat skin, hair, and nail conditions using certified protocols and clinical technologies.',
      benefits: ['High-resolution dermoscopy and skin barrier analysis', 'Individualized acne, eczema, and psoriasis roadmaps', 'Clinical trichology assessments for hair health', 'Safe, medical-grade laser and aesthetic consultations'],
      features: ['Skin barrier analysis', 'Acne treatment plans', 'Hair follicle health audit', 'Allergy testing guidance'],
      icon: 'sparkles',
      startingPrice: 900,
      currency: 'INR',
      popular: false,
    },
    {
      title: 'Neurology & Brain Sciences',
      specialization: 'Neurology',
      department: 'Neurology',
      description: 'Expert neurological evaluations for migraines, chronic headaches, neuropathy, vertigo, seizure disorders, and post-stroke rehabilitation triage.',
      overview: 'Our neurology specialists deliver advanced diagnostics and therapeutic management for complex central and peripheral nervous system disorders.',
      benefits: ['Specialized chronic migraine and headache profiling', 'Comprehensive nerve conduction and reflex testing', 'Sleep disorder and cognitive wellness reviews', 'Targeted neuro-rehabilitation care plans'],
      features: ['Reflex & motor function test', 'Migraine trigger mapping', 'Sleep disorder review', 'Cognitive wellness assessment'],
      icon: 'brain',
      startingPrice: 1500,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Orthopedics & Joint Care',
      specialization: 'Orthopedics',
      department: 'Orthopedics',
      description: 'Bone density evaluation, joint pain management, sports injury rehabilitation, arthritis triage, and minimally invasive surgical consultations.',
      overview: 'From sports injuries to degenerative arthritis, Medora’s orthopedic team delivers precision diagnostic care, joint preservation strategies, and physical rehabilitation.',
      benefits: ['Detailed joint mobility and range-of-motion assessments', 'Digital X-ray, CT, and MRI evaluations', 'Personalized physical rehabilitation and physiotherapy roadmaps', 'Ergonomic guidance for desk and athletic health'],
      features: ['Range-of-motion audit', 'X-ray / MRI review', 'Physical rehab roadmap', 'Ergonomic advisory'],
      icon: 'activity',
      startingPrice: 1100,
      currency: 'INR',
      popular: false,
    },
    {
      title: 'Pediatrics & Child Healthcare',
      specialization: 'Pediatrics',
      department: 'Pediatrics',
      description: 'Child wellness assessments, infant growth milestones, pediatric nutrition, and complete WHO/IAP vaccination schedules in Medora Hospital’s child-friendly wing.',
      overview: 'Providing compassionate care from birth through adolescence, our pediatric team ensures your child’s optimal physical, cognitive, and emotional development.',
      benefits: ['Growth percentile and developmental tracking', 'Cold-chain certified WHO and IAP vaccination schedules', 'Pediatric allergy and nutrition guidance', 'Direct access to pediatric emergency care'],
      features: ['Growth percentile chart', 'Vaccination certificate', 'Diet & lactation counselling', 'Pediatric emergency triage'],
      icon: 'baby',
      startingPrice: 800,
      currency: 'INR',
      popular: false,
    },
    {
      title: 'Gynecology & Women’s Health',
      specialization: 'Gynecology',
      department: 'Gynecology',
      description: 'Antenatal care, PCOS/PCOD management, hormonal health, cervical screenings, and personalized family planning guidance in a confidential, supportive clinic.',
      overview: 'Dedicated to women across all life stages, our gynecology department provides empathetic care covering preventive screening, hormonal balance, and maternal care.',
      benefits: ['High-resolution pelvic ultrasound and pap smear reviews', 'Structured PCOS/PCOD metabolic lifestyle programs', 'Comprehensive prenatal and antenatal health roadmaps', 'Confidential and compassionate clinical environment'],
      features: ['Pelvic ultrasound review', 'Hormonal balance panel', 'Prenatal nutrition advice', 'Confidential consultation'],
      icon: 'female',
      startingPrice: 1000,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Dental Care & Oral Surgery',
      specialization: 'Dentistry',
      department: 'Dental Care',
      description: 'Digital smile design, painless root canals, teeth alignment, dental scaling, cavity prevention, and surgical extractions in our modern dental operatory.',
      overview: 'Our dental suite at Medora Hospital offers restorative, preventative, and cosmetic oral healthcare delivered with advanced sterile instrumentation.',
      benefits: ['High-definition intraoral camera diagnostics', 'Painless single-sitting root canal treatment options', 'Ultrasonic dental scaling and enamel protection', 'Transparent pricing with take-home oral care kits'],
      features: ['Intraoral camera examination', 'Digital dental mapping', 'Enamel polish & cleaning', 'Post-procedure care kit'],
      icon: 'tooth',
      startingPrice: 700,
      currency: 'INR',
      popular: false,
    },
    {
      title: 'Diagnostics & Laboratory Services',
      specialization: 'Diagnostics and Laboratory',
      department: 'Diagnostics',
      description: 'NABL-accredited diagnostic testing including complete metabolic panels, thyroid profiles, lipid panels, urine cytology, and digital radiology.',
      overview: 'Equipped with cutting-edge automated analyzers, Medora Hospital’s pathology and diagnostic laboratory delivers precise results within hours.',
      benefits: ['Automated barcoded specimen processing', 'Verified digital reports delivered via patient portal within 12-24 hours', 'Doctor review included with abnormal laboratory values', 'Strict international quality assurance standards'],
      features: ['NABL accredited lab processing', 'Digital report in 12 hours', 'Barcode tracking', 'Consulting doctor review'],
      icon: 'activity',
      startingPrice: 500,
      currency: 'INR',
      popular: true,
    },
    {
      title: 'Physiotherapy & Rehabilitation',
      specialization: 'Physiotherapy',
      department: 'Physiotherapy',
      description: 'Evidence-based physical therapy for post-surgical recovery, chronic back and neck pain, sports rehabilitation, and ergonomic realignment.',
      overview: 'Our experienced physical therapists help restore strength, mobility, and functional independence through tailored therapeutic exercise and modalities.',
      benefits: ['Targeted musculoskeletal and postural assessment', 'Manual therapy and therapeutic ultrasound modalities', 'Home exercise program with video instructions', 'Accelerated recovery timelines for sports injuries'],
      features: ['Targeted physical assessment', 'Modalities & manual therapy', 'Home exercise guide', 'Post-surgical rehab'],
      icon: 'activity',
      startingPrice: 750,
      currency: 'INR',
      popular: false,
    },
  ];

  const createdServices = await Service.insertMany(servicesData);
  console.log(`✓ Inserted ${createdServices.length} Medora Hospital services into MongoDB Atlas.`);

  console.log('\n--- 3. Syncing Medora Hospital Doctors (8 Doctors) ---');
  await Doctor.deleteMany({});

  const doctorsList = [
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
      averageRating: 4.8,
      reviewsCount: 2164,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Sarah Johnson leads Medora Hospital’s Cardiology Department with 15+ years of specialized clinical experience in preventative cardiology, hypertension, arrhythmia, and comprehensive cardiac rehabilitation.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@demo.medora',
      specialization: 'Dermatology',
      department: 'Dermatology & Skin Aesthetics',
      designation: 'Lead Consultant Dermatologist',
      servicesOffered: ['Dermatology', 'Skin Barrier Diagnostics', 'Laser Therapy', 'Acne & Eczema Care'],
      qualification: 'MBBS, MD - Dermatology & Venereology',
      experience: 10,
      hospital: 'Medora Hospital',
      firstVisitFee: 900,
      followupFee: 550,
      consultationFee: 900,
      currency: 'INR',
      averageRating: 4.7,
      reviewsCount: 1840,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Michael Chen specializes in medical and aesthetic dermatology at Medora Hospital, addressing chronic dermatitis, psoriasis, scalp disorders, and advanced dermato-cosmetic therapies.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5],
    },
    {
      name: 'Dr. Emily Davis',
      email: 'emily.davis@demo.medora',
      specialization: 'Neurology',
      department: 'Neurology & Brain Sciences',
      designation: 'Director of Neurology & Senior Neuro-Specialist',
      servicesOffered: ['Neurology', 'Migraine Care', 'Epilepsy Clinic', 'Cognitive Assessment'],
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
      about: 'Dr. Emily Davis directs neurological consultations at Medora Hospital, focusing on migraine protocols, neuropathies, stroke management, and sleep and movement disorders.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5],
    },
    {
      name: 'Dr. James Wilson',
      email: 'james.wilson@demo.medora',
      specialization: 'Orthopedics',
      department: 'Orthopedics & Joint Care',
      designation: 'Chief Orthopedic Surgeon',
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
      about: 'Dr. James Wilson is a renowned orthopedic surgeon at Medora Hospital, known for minimally invasive joint reconstruction, sports medicine, arthritis care, and spinal health.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5],
    },
    {
      name: 'Dr. Anita Desai',
      email: 'anita.desai@demo.medora',
      specialization: 'Pediatrics',
      department: 'Pediatrics & Child Healthcare',
      designation: 'Head of Pediatric Medicine & Neonatology',
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
      about: 'Dr. Anita Desai heads Medora Hospital’s Pediatric Pavilion, offering compassionate care for infants, adolescents, developmental monitoring, and preventive immunizations.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    {
      name: 'Dr. Rachel Adams',
      email: 'rachel.adams@demo.medora',
      specialization: 'Gynecology',
      department: 'Gynecology & Women’s Health',
      designation: 'Chief Consultant - Obstetrics & Gynecology',
      servicesOffered: ['Gynecology', 'Antenatal Wellness', 'PCOS/PCOD Care', 'Menopause Clinic'],
      qualification: 'MBBS, MS - Obstetrics & Gynecology, FICOG',
      experience: 13,
      hospital: 'Medora Hospital',
      firstVisitFee: 1000,
      followupFee: 600,
      consultationFee: 1000,
      currency: 'INR',
      averageRating: 4.8,
      reviewsCount: 2300,
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. Rachel Adams provides specialized obstetric and gynecological care at Medora Hospital, focusing on maternal wellness, hormonal balance, laparoscopic treatments, and preventative oncology screening.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5],
    },
    {
      name: 'Dr. David Kumar',
      email: 'david.kumar@demo.medora',
      specialization: 'Dentistry',
      department: 'Dental Care & Oral Surgery',
      designation: 'Chief Dental & Maxillofacial Surgeon',
      servicesOffered: ['Dentistry', 'Cosmetic Smile Design', 'Endodontics', 'Dental Implants'],
      qualification: 'BDS, MDS - Oral & Maxillofacial Surgery',
      experience: 9,
      hospital: 'Medora Hospital',
      firstVisitFee: 700,
      followupFee: 450,
      consultationFee: 700,
      currency: 'INR',
      averageRating: 4.7,
      reviewsCount: 1540,
      avatar: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
      about: 'Dr. David Kumar leads Medora Hospital’s Dental Suite, offering pain-free root canals, digital tooth restoration, surgical extractions, and cosmetic dentistry.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    {
      name: 'Dr. Robert Brown',
      email: 'robert.brown@demo.medora',
      specialization: 'General Medicine',
      department: 'General Health & Primary Care',
      designation: 'Lead Consultant - Internal Medicine & Preventive Health',
      servicesOffered: ['General Medicine', 'Executive Health Checkup', 'Diabetes Clinic', 'Acute Illness Care'],
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
      about: 'Dr. Robert Brown has served as a senior physician at Medora Hospital for over 16 years, treating adult acute conditions, metabolic syndromes, lifestyle disorders, and geriatrics.',
      consultationTypes: ['IN_PERSON', 'ONLINE'],
      workingDays: [1, 2, 3, 4, 5, 6],
    },
  ];

  await AppointmentSlot.deleteMany({});
  const allSlotsToInsert = [];
  const createdDoctors = [];

  for (const docData of doctorsList) {
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

  console.log('\n--- 5. Verifying Database Collections Summary ---');
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  console.log('\n======================================================');
  console.log('🎉 MONGODB ATLAS SYNCHRONIZATION COMPLETE!');
  console.log('All doctors, services, and live slots belong to Medora Hospital.');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

syncAtlas().catch(err => {
  console.error('Atlas sync failed:', err);
  process.exit(1);
});
