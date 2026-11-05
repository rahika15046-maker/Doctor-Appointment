import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export let isMemoryMode = false;

// In-Memory Data Store for resilient offline execution
class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.data = [];
  }

  _matches(doc, filter = {}) {
    for (const [k, v] of Object.entries(filter)) {
      if (k === '$or' && Array.isArray(v)) {
        if (!v.some(sub => this._matches(doc, sub))) return false;
        continue;
      }
      if (k === '_id' || k.endsWith('Id')) {
        const docVal = String(doc[k]?._id || doc[k] || '');
        const targetVal = String(v?._id || v || '');
        if (docVal !== targetVal) return false;
        continue;
      }
      if (v instanceof RegExp) {
        if (!v.test(String(doc[k] || ''))) return false;
        continue;
      }
      if (Array.isArray(doc[k])) {
        if (!doc[k].includes(v)) return false;
        continue;
      }
      if (typeof v === 'object' && v !== null) {
        if (v.$gte !== undefined && new Date(doc[k]) < new Date(v.$gte)) return false;
        if (v.$lt !== undefined && new Date(doc[k]) >= new Date(v.$lt)) return false;
        if (v.$gt !== undefined && new Date(doc[k]) <= new Date(v.$gt)) return false;
        if (v.$lte !== undefined && new Date(doc[k]) > new Date(v.$lte)) return false;
        if (v.$in !== undefined && !v.$in.map(String).includes(String(doc[k]))) return false;
        continue;
      }
      if (doc[k] !== v) return false;
    }
    return true;
  }

  find(filter = {}) {
    const list = this.data.filter(d => this._matches(d, filter)).map(d => ({ ...d }));
    return new MemoryQuery(list, this);
  }

  findOne(filter = {}) {
    const item = this.data.find(d => this._matches(d, filter));
    return new MemorySingleQuery(item ? { ...item } : null, this);
  }

  async findById(id) {
    return this.findOne({ _id: String(id) });
  }

  async countDocuments(filter = {}) {
    return this.data.filter(d => this._matches(d, filter)).length;
  }

  async create(docOrDocs) {
    const items = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
    const created = [];
    for (const raw of items) {
      const doc = {
        _id: raw._id ? String(raw._id) : crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...raw,
      };
      this.data.push(doc);
      created.push(new MemoryDocument(doc, this));
    }
    return Array.isArray(docOrDocs) ? created : created[0];
  }

  async insertMany(docs) {
    return this.create(docs);
  }

  async updateOne(filter, update) {
    const item = this.data.find(d => this._matches(d, filter));
    if (!item) return { matchedCount: 0, modifiedCount: 0 };
    if (update.$set) Object.assign(item, update.$set);
    else Object.assign(item, update);
    item.updatedAt = new Date();
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async findOneAndUpdate(filter, update, opts = {}) {
    const item = this.data.find(d => this._matches(d, filter));
    if (!item) return null;
    if (update.$set) Object.assign(item, update.$set);
    else Object.assign(item, update);
    item.updatedAt = new Date();
    return new MemoryDocument({ ...item }, this);
  }

  async deleteMany(filter = {}) {
    const initialLen = this.data.length;
    this.data = this.data.filter(d => !this._matches(d, filter));
    return { deletedCount: initialLen - this.data.length };
  }
}

class MemoryDocument {
  constructor(data, collection) {
    Object.assign(this, data);
    this.id = String(this._id);
    Object.defineProperty(this, '_collection', { value: collection, enumerable: false });
  }

  async save() {
    if (!this._collection) return this;
    const idx = this._collection.data.findIndex(d => String(d._id) === String(this._id));
    if (idx !== -1) {
      this.updatedAt = new Date();
      this._collection.data[idx] = { ...this };
    }
    return this;
  }

  toObject() {
    const obj = { ...this };
    delete obj._collection;
    return obj;
  }
}

class MemorySingleQuery {
  constructor(doc, collection) {
    this._doc = doc;
    this._collection = collection;
  }
  select() {
    return this;
  }
  populate(field, selectFields) {
    if (this._doc && field === 'doctorId') {
      const doc = memoryStore.doctors.data.find(d => String(d._id) === String(this._doc.doctorId?._id || this._doc.doctorId));
      if (doc) {
        this._doc.doctorId = {
          _id: doc._id,
          name: doc.name,
          specialization: doc.specialization,
          department: doc.department || doc.specialization,
          designation: doc.designation || 'Senior Consultant',
          servicesOffered: doc.servicesOffered || [doc.specialization],
          qualification: doc.qualification,
          experience: doc.experience,
          hospital: 'Medora Hospital',
          avatar: doc.avatar,
          consultationFee: doc.consultationFee,
          firstVisitFee: doc.firstVisitFee,
          followupFee: doc.followupFee,
          currency: doc.currency || 'INR',
        };
      }
    }
    return this;
  }
  session() {
    return this;
  }
  then(resolve, reject) {
    const res = this._doc ? new MemoryDocument(this._doc, this._collection) : null;
    return Promise.resolve(res).then(resolve, reject);
  }
}

class MemoryQuery {
  constructor(data, collection) {
    this._data = data;
    this._collection = collection;
  }

  session() {
    return this;
  }

  select() {
    return this;
  }

  sort(sortParam) {
    if (typeof sortParam === 'string') {
      const desc = sortParam.startsWith('-');
      const field = desc ? sortParam.slice(1) : sortParam;
      this._data.sort((a, b) => {
        const valA = a[field] instanceof Date ? a[field].getTime() : a[field];
        const valB = b[field] instanceof Date ? b[field].getTime() : b[field];
        if (valA < valB) return desc ? 1 : -1;
        if (valA > valB) return desc ? -1 : 1;
        return 0;
      });
    }
    return this;
  }

  skip(count = 0) {
    this._data = this._data.slice(Number(count));
    return this;
  }

  limit(count = 10) {
    this._data = this._data.slice(0, Number(count));
    return this;
  }

  populate(field, selectFields) {
    for (const item of this._data) {
      if (field === 'doctorId') {
        const doc = memoryStore.doctors.data.find(d => String(d._id) === String(item.doctorId?._id || item.doctorId));
        if (doc) {
          item.doctorId = {
            _id: doc._id,
            name: doc.name,
            specialization: doc.specialization,
            department: doc.department || doc.specialization,
            designation: doc.designation || 'Senior Consultant',
            servicesOffered: doc.servicesOffered || [doc.specialization],
            qualification: doc.qualification,
            experience: doc.experience,
            hospital: 'Medora Hospital',
            avatar: doc.avatar,
            consultationFee: doc.consultationFee,
            firstVisitFee: doc.firstVisitFee,
            followupFee: doc.followupFee,
            currency: 'INR',
          };
        }
      }
    }
    return this;
  }

  then(resolve, reject) {
    const docs = this._data.map(d => new MemoryDocument(d, this._collection));
    return Promise.resolve(docs).then(resolve, reject);
  }
}

export const memoryStore = {
  users: new MemoryCollection('users'),
  doctors: new MemoryCollection('doctors'),
  appointmentSlots: new MemoryCollection('appointmentSlots'),
  appointments: new MemoryCollection('appointments'),
  medicalRecords: new MemoryCollection('medicalRecords'),
  notifications: new MemoryCollection('notifications'),
  services: new MemoryCollection('services'),
};

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGODB_URI set. Initializing resilient in-memory Medora data engine...');
    isMemoryMode = true;
    await seedDemoData();
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('[DB] Connected to MongoDB at', uri.replace(/:[^:@]+@/, ':****@'));
    isMemoryMode = false;
    await mongoose.syncIndexes().catch(() => {});
  } catch (err) {
    console.log('[DB] MongoDB unreachable (' + err.message + '). Active resilient embedded Medora data engine.');
    isMemoryMode = true;
    await seedDemoData();
  }
}

export async function seedDemoData() {
  const pw = await bcrypt.hash('Demo@1234', 10);
  
  // Seed Patient Priya Sharma
  let patient = await memoryStore.users.findOne({ email: 'patient@demo.medora' });
  if (!patient) {
    patient = await memoryStore.users.create({
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
  }

  // Seed Admin
  await memoryStore.users.create({
    name: 'Admin Medora',
    email: 'admin@demo.medora',
    password: pw,
    phone: '+91 90000 00000',
    role: 'admin',
    isActive: true,
  });

  // Seed Medora Hospital Doctors (Limited, predefined medical team belonging to Medora Hospital)
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

  const createdDoctors = [];
  for (const docData of doctorsList) {
    const userDoc = await memoryStore.users.create({
      name: docData.name,
      email: docData.email,
      password: pw,
      role: 'doctor',
      isActive: true,
      avatar: docData.avatar,
    });

    const doctor = await memoryStore.doctors.create({
      userId: userDoc._id,
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
        await memoryStore.appointmentSlots.create({
          doctorId: doctor._id,
          startAt,
          endAt,
          status: 'AVAILABLE',
          appointmentId: null,
        });
      }
    }
  }

  // Seed sample appointments for Priya Sharma
  const drSarah = createdDoctors[0];
  const drMichael = createdDoctors[1];
  const drEmily = createdDoctors[2];
  const drJames = createdDoctors[3];

  // 1 Upcoming appointment (Dr. Sarah Johnson, Tomorrow, 10:00 AM)
  const tomorrow = new Date(Date.now() + 864e5);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const upcomingStart = new Date(`${tomorrowStr}T10:00:00+05:30`);
  const upcomingEnd = new Date(upcomingStart.getTime() + 45 * 60e3);

  const upcomingSlot = await memoryStore.appointmentSlots.create({
    doctorId: drSarah._id,
    startAt: upcomingStart,
    endAt: upcomingEnd,
    status: 'BOOKED',
  });

  const upcomingAppt = await memoryStore.appointments.create({
    patientId: patient._id,
    doctorId: drSarah._id,
    serviceName: 'Cardiology & Heart Care',
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

  // 3 Completed appointments
  const pastDate1 = new Date(Date.now() - 30 * 864e5);
  await memoryStore.appointments.create({
    patientId: patient._id,
    doctorId: drMichael._id,
    serviceName: 'Dermatology & Skin Aesthetics',
    slotId: crypto.randomUUID(),
    startAt: pastDate1,
    endAt: new Date(pastDate1.getTime() + 45 * 60e3),
    consultationType: 'ONLINE',
    reason: 'Skin rash & seasonal allergy consultation',
    consultationFee: drMichael.consultationFee,
    status: 'COMPLETED',
    referenceId: 'MED-2025-0315-089',
  });

  const pastDate2 = new Date(Date.now() - 60 * 864e5);
  await memoryStore.appointments.create({
    patientId: patient._id,
    doctorId: drEmily._id,
    serviceName: 'Neurology & Brain Sciences',
    slotId: crypto.randomUUID(),
    startAt: pastDate2,
    endAt: new Date(pastDate2.getTime() + 45 * 60e3),
    consultationType: 'IN_PERSON',
    reason: 'Occasional migraine follow-up consultation',
    consultationFee: drEmily.consultationFee,
    status: 'COMPLETED',
    referenceId: 'MED-2025-0210-045',
  });

  const pastDate3 = new Date(Date.now() - 90 * 864e5);
  await memoryStore.appointments.create({
    patientId: patient._id,
    doctorId: drJames._id,
    serviceName: 'Orthopedics & Joint Care',
    slotId: crypto.randomUUID(),
    startAt: pastDate3,
    endAt: new Date(pastDate3.getTime() + 45 * 60e3),
    consultationType: 'IN_PERSON',
    reason: 'Knee soreness after marathon training review',
    consultationFee: drJames.consultationFee,
    status: 'COMPLETED',
    referenceId: 'MED-2025-0105-012',
  });

  // 1 Cancelled appointment
  const cancelDate = new Date(Date.now() - 15 * 864e5);
  await memoryStore.appointments.create({
    patientId: patient._id,
    doctorId: drMichael._id,
    serviceName: 'Dermatology & Skin Aesthetics',
    slotId: crypto.randomUUID(),
    startAt: cancelDate,
    endAt: new Date(cancelDate.getTime() + 45 * 60e3),
    consultationType: 'ONLINE',
    reason: 'Routine skin spot checkup',
    consultationFee: drMichael.consultationFee,
    status: 'CANCELLED',
    referenceId: 'MED-2025-0330-077',
  });

  // Seed Medical Records for Priya Sharma
  await memoryStore.medicalRecords.create([
    {
      patientId: patient._id,
      title: 'Complete Blood Count (CBC) Panel',
      category: 'Diagnostic Lab',
      doctorName: 'Dr. Sarah Johnson',
      date: new Date(Date.now() - 10 * 864e5),
      fileUrl: '#',
      fileSize: '1.4 MB',
      status: 'Reviewed',
      notes: 'Hemoglobin and platelet levels optimal; white blood count normal.',
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
      doctorName: 'Dr. Robert Brown',
      date: new Date(Date.now() - 90 * 864e5),
      fileUrl: '#',
      fileSize: '3.1 MB',
      status: 'Completed',
      notes: 'Overall physical health index in top percentile.',
    },
  ]);

  // Seed Notifications (2 unread matching the red badge in image)
  await memoryStore.notifications.create([
    {
      patientId: patient._id,
      title: 'Upcoming Appointment Reminder',
      message: 'Your consultation with Dr. Sarah Johnson at Medora Hospital is scheduled for tomorrow at 10:00 AM.',
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
      message: 'Booking MED-2025-0425-001 has been confirmed with Dr. Sarah Johnson at Medora Hospital.',
      type: 'appointment',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 3600e3),
    },
  ]);

  // Seed Medora Hospital Clinical Services (All 9 sample services from Section 4.B)
  await memoryStore.services.create([
    {
      title: 'General Health & Primary Care',
      specialization: 'General Medicine',
      department: 'General Medicine',
      description: 'Comprehensive primary care checkups, vital health reviews, chronic disease management, fever clinics, and preventative wellness consultations at Medora Hospital.',
      overview: 'Our General Medicine department serves as the foundation of health management, offering expert diagnosis, evidence-based treatments, and individualized lifestyle guidance.',
      benefits: ['Full body vitals screening & biometric analysis', 'Same-day e-prescription & digital health record', 'Complimentary 7-day post-consultation query support', 'Integrated pharmacy and pathology coordination'],
      icon: 'stethoscope',
      startingPrice: 600,
      currency: 'INR',
      features: ['Full body vitals screening', 'Digital prescription', 'Prescription medicine review', 'Free 7-day follow-up'],
      popular: true,
    },
    {
      title: 'Cardiology & Advanced Heart Care',
      specialization: 'Cardiology',
      department: 'Cardiology',
      description: 'Advanced non-invasive cardiac evaluation, digital 12-lead ECG review, 2D Echo triage, blood pressure optimization, and lipid management by Medora Hospital heart specialists.',
      overview: 'Dedicated to cardiac excellence, our cardiologists utilize state-of-the-art diagnostic protocols to detect, manage, and prevent cardiovascular conditions.',
      benefits: ['12-lead digital ECG and rhythm analysis', 'Cardiovascular risk stratification', 'Hypertension & lipid management protocols', 'Direct admission pathway for emergency care'],
      icon: 'heart',
      startingPrice: 1200,
      currency: 'INR',
      features: ['Resting ECG interpretation', 'Cardiovascular risk score', 'Lifestyle & diet guidance', 'Emergency referral triage'],
      popular: true,
    },
    {
      title: 'Dermatology & Skin Aesthetics',
      specialization: 'Dermatology',
      department: 'Dermatology',
      description: 'Specialized clinical dermatology for acne, eczema, psoriasis, hair loss, laser consultations, and advanced allergy diagnostics in Medora Hospital’s Skin Suite.',
      overview: 'Combining medical dermatology and aesthetic care, our dermatologists treat skin, hair, and nail conditions using certified protocols and clinical technologies.',
      benefits: ['High-resolution dermoscopy and skin barrier analysis', 'Individualized acne, eczema, and psoriasis roadmaps', 'Clinical trichology assessments for hair health', 'Safe, medical-grade laser and aesthetic consultations'],
      icon: 'sparkles',
      startingPrice: 900,
      currency: 'INR',
      features: ['Skin barrier analysis', 'Acne treatment plans', 'Hair follicle health audit', 'Allergy testing guidance'],
      popular: false,
    },
    {
      title: 'Neurology & Brain Sciences',
      specialization: 'Neurology',
      department: 'Neurology',
      description: 'Expert neurological evaluations for migraines, chronic headaches, neuropathy, vertigo, seizure disorders, and post-stroke rehabilitation triage.',
      overview: 'Our neurology specialists deliver advanced diagnostics and therapeutic management for complex central and peripheral nervous system disorders.',
      benefits: ['Specialized chronic migraine and headache profiling', 'Comprehensive nerve conduction and reflex testing', 'Sleep disorder and cognitive wellness reviews', 'Targeted neuro-rehabilitation care plans'],
      icon: 'brain',
      startingPrice: 1500,
      currency: 'INR',
      features: ['Reflex & motor function test', 'Migraine trigger mapping', 'Sleep disorder review', 'Cognitive wellness assessment'],
      popular: true,
    },
    {
      title: 'Orthopedics & Joint Care',
      specialization: 'Orthopedics',
      department: 'Orthopedics',
      description: 'Bone density evaluation, joint pain management, sports injury rehabilitation, arthritis triage, and minimally invasive surgical consultations.',
      overview: 'From sports injuries to degenerative arthritis, Medora’s orthopedic team delivers precision diagnostic care, joint preservation strategies, and physical rehabilitation.',
      benefits: ['Detailed joint mobility and range-of-motion assessments', 'Digital X-ray, CT, and MRI evaluations', 'Personalized physical rehabilitation and physiotherapy roadmaps', 'Ergonomic guidance for desk and athletic health'],
      icon: 'activity',
      startingPrice: 1100,
      currency: 'INR',
      features: ['Range-of-motion audit', 'X-ray / MRI review', 'Physical rehab roadmap', 'Ergonomic advisory'],
      popular: false,
    },
    {
      title: 'Pediatrics & Child Healthcare',
      specialization: 'Pediatrics',
      department: 'Pediatrics',
      description: 'Child wellness assessments, infant growth milestones, pediatric nutrition, and complete WHO/IAP vaccination schedules in Medora Hospital’s child-friendly wing.',
      overview: 'Providing compassionate care from birth through adolescence, our pediatric team ensures your child’s optimal physical, cognitive, and emotional development.',
      benefits: ['Growth percentile and developmental tracking', 'Cold-chain certified WHO and IAP vaccination schedules', 'Pediatric allergy and nutrition guidance', 'Direct access to pediatric emergency care'],
      icon: 'baby',
      startingPrice: 800,
      currency: 'INR',
      features: ['Growth percentile chart', 'Vaccination certificate', 'Diet & lactation counselling', 'Pediatric emergency triage'],
      popular: false,
    },
    {
      title: 'Gynecology & Women’s Health',
      specialization: 'Gynecology',
      department: 'Gynecology',
      description: 'Antenatal care, PCOS/PCOD management, hormonal health, cervical screenings, and personalized family planning guidance in a confidential, supportive clinic.',
      overview: 'Dedicated to women across all life stages, our gynecology department provides empathetic care covering preventive screening, hormonal balance, and maternal care.',
      benefits: ['High-resolution pelvic ultrasound and pap smear reviews', 'Structured PCOS/PCOD metabolic lifestyle programs', 'Comprehensive prenatal and antenatal health roadmaps', 'Confidential and compassionate clinical environment'],
      icon: 'female',
      startingPrice: 1000,
      currency: 'INR',
      features: ['Pelvic ultrasound review', 'Hormonal balance panel', 'Prenatal nutrition advice', 'Confidential consultation'],
      popular: true,
    },
    {
      title: 'Dental Care & Oral Surgery',
      specialization: 'Dentistry',
      department: 'Dental Care',
      description: 'Digital smile design, painless root canals, teeth alignment, dental scaling, cavity prevention, and surgical extractions in our modern dental operatory.',
      overview: 'Our dental suite at Medora Hospital offers restorative, preventative, and cosmetic oral healthcare delivered with advanced sterile instrumentation.',
      benefits: ['High-definition intraoral camera diagnostics', 'Painless single-sitting root canal treatment options', 'Ultrasonic dental scaling and enamel protection', 'Transparent pricing with take-home oral care kits'],
      icon: 'smile',
      startingPrice: 700,
      currency: 'INR',
      features: ['Intraoral camera examination', 'Digital dental mapping', 'Enamel polish & cleaning', 'Post-procedure care kit'],
      popular: false,
    },
    {
      title: 'Diagnostics & Laboratory Services',
      specialization: 'Diagnostics and Laboratory',
      department: 'Diagnostics',
      description: 'NABL-accredited diagnostic testing including complete metabolic panels, thyroid profiles, lipid panels, urine cytology, and digital radiology.',
      overview: 'Equipped with cutting-edge automated analyzers, Medora Hospital’s pathology and diagnostic laboratory delivers precise results within hours.',
      benefits: ['Automated barcoded specimen processing', 'Verified digital reports delivered via patient portal within 12-24 hours', 'Doctor review included with abnormal laboratory values', 'Strict international quality assurance standards'],
      icon: 'activity',
      startingPrice: 500,
      currency: 'INR',
      features: ['NABL accredited lab processing', 'Digital report in 12 hours', 'Barcode tracking', 'Consulting doctor review'],
      popular: true,
    },
    {
      title: 'Physiotherapy & Rehabilitation',
      specialization: 'Physiotherapy',
      department: 'Physiotherapy',
      description: 'Evidence-based physical therapy for post-surgical recovery, chronic back and neck pain, sports rehabilitation, and ergonomic realignment.',
      overview: 'Our experienced physical therapists help restore strength, mobility, and functional independence through tailored therapeutic exercise and modalities.',
      benefits: ['Targeted musculoskeletal and postural assessment', 'Manual therapy and therapeutic ultrasound modalities', 'Home exercise program with video instructions', 'Accelerated recovery timelines for sports injuries'],
      icon: 'activity',
      startingPrice: 750,
      currency: 'INR',
      features: ['Targeted physical assessment', 'Modalities & manual therapy', 'Home exercise guide', 'Post-surgical rehab'],
      popular: false,
    },
  ]);

  console.log('[DB] Seeded Medora Hospital demo data: Priya Sharma (patient@demo.medora), 8 Medora Doctors, 5 Appointments, Medical Records, Notifications, 10 Hospital Services.');
}
