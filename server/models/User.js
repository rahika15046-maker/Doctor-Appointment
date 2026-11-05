import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const s = new mongoose.Schema({
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

const MongooseUser = mongoose.model('User', s);

const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.users[prop] === 'function'
        ? memoryStore.users[prop].bind(memoryStore.users)
        : memoryStore.users[prop];
    }
    return target[prop];
  }
});

export default UserProxy;
