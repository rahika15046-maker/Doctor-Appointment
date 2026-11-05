import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const s = new mongoose.Schema({
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

const MongooseRecord = mongoose.model('MedicalRecord', s);

const MedicalRecordProxy = new Proxy(MongooseRecord, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.medicalRecords[prop] === 'function'
        ? memoryStore.medicalRecords[prop].bind(memoryStore.medicalRecords)
        : memoryStore.medicalRecords[prop];
    }
    return target[prop];
  }
});

export default MedicalRecordProxy;
