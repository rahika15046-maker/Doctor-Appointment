import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const schema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'], default: 'AVAILABLE' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
}, { timestamps: true });
schema.index({ doctorId: 1, startAt: 1 }, { unique: true });

const MongooseSlot = mongoose.model('AppointmentSlot', schema);

const SlotProxy = new Proxy(MongooseSlot, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.appointmentSlots[prop] === 'function'
        ? memoryStore.appointmentSlots[prop].bind(memoryStore.appointmentSlots)
        : memoryStore.appointmentSlots[prop];
    }
    return target[prop];
  }
});

export default SlotProxy;
