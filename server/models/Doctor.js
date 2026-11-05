import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const s = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
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
  workingDays: [{ type: Number }], // 1 = Mon, ..., 7 = Sun
  averageRating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  avatar: String,
  about: String,
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED'], default: 'VERIFIED' },
  isDemo: { type: Boolean, default: true },
}, { timestamps: true });

const MongooseDoctor = mongoose.model('Doctor', s);

const DoctorProxy = new Proxy(MongooseDoctor, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.doctors[prop] === 'function'
        ? memoryStore.doctors[prop].bind(memoryStore.doctors)
        : memoryStore.doctors[prop];
    }
    return target[prop];
  }
});

export default DoctorProxy;
