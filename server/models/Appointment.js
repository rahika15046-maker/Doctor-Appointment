import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const ACTIVE = ['PENDING', 'CONFIRMED'];
const schema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName: { type: String },
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppointmentSlot', required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  consultationType: { type: String, enum: ['IN_PERSON', 'ONLINE'], default: 'IN_PERSON', required: true },
  reason: { type: String, required: true, maxlength: 500 },
  additionalComments: String,
  medicalReports: [{ type: String }],
  consultationFee: { type: Number, required: true },
  isFollowup: { type: Boolean, default: false },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'], default: 'PENDING' },
  referenceId: { type: String, required: true, unique: true },
  idempotencyKey: String,
}, { timestamps: true });

schema.index({ doctorId: 1, startAt: 1 }, { unique: true, partialFilterExpression: { status: { $in: ACTIVE } } });
schema.index({ patientId: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } });

const MongooseAppointment = mongoose.model('Appointment', schema);

const AppointmentProxy = new Proxy(MongooseAppointment, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.appointments[prop] === 'function'
        ? memoryStore.appointments[prop].bind(memoryStore.appointments)
        : memoryStore.appointments[prop];
    }
    return target[prop];
  }
});

export default AppointmentProxy;
