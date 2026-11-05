import mongoose from 'mongoose';
import { isMemoryMode, memoryStore } from '../db.js';

const s = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const MongooseNotification = mongoose.model('Notification', s);

const NotificationProxy = new Proxy(MongooseNotification, {
  get(target, prop) {
    if (isMemoryMode) {
      if (prop === 'schema') return target.schema;
      return typeof memoryStore.notifications[prop] === 'function'
        ? memoryStore.notifications[prop].bind(memoryStore.notifications)
        : memoryStore.notifications[prop];
    }
    return target[prop];
  }
});

export default NotificationProxy;
