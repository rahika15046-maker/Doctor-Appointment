import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  specialization: { type: String, required: true, index: true },
  department: { type: String },
  description: { type: String, required: true },
  overview: { type: String },
  benefits: [{ type: String }],
  icon: { type: String, default: 'stethoscope' },
  startingPrice: { type: Number, default: 600 },
  currency: { type: String, default: 'INR' },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
}, { timestamps: true });

const MongooseService = mongoose.model('Service', schema);

const ServiceProxy = new Proxy(MongooseService, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.services[prop] === 'function'
        ? memoryStore.services[prop].bind(memoryStore.services)
        : memoryStore.services[prop];
    }
    return target[prop];
  }
});

export default ServiceProxy;
