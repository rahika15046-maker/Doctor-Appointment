import mongoose from 'mongoose';
import crypto from 'crypto';
import Appointment from '../models/Appointment.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import { ApiError } from '../utils/ApiError.js';
import { isMemoryMode } from '../db.js';

const CONFLICT_MSG = 'Sorry, this appointment slot has just been booked by another patient. Please select another available time.';
const ref = () => `MED-${new Date().getUTCFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

async function runTxn(fn) {
  if (isMemoryMode || !mongoose.connection || mongoose.connection.readyState !== 1) {
    return await fn(null);
  }
  let session;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (e) {
    // If standalone MongoDB does not support transactions, fall back to atomic non-transactional execution
    if (e.message && (e.message.includes('replica set') || e.message.includes('Transaction numbers'))) {
      return await fn(null);
    }
    if (e instanceof ApiError) throw e;
    if (e.code === 11000 || e.code === 112 || e.hasErrorLabel?.('TransientTransactionError')) throw new ApiError(409, CONFLICT_MSG);
    throw e;
  } finally {
    if (session) await session.endSession().catch(() => {});
  }
}

// Atomic claim: matches only if still AVAILABLE.
const claimSlot = async (slotId, doctorId, session) => {
  const filter = { _id: slotId, doctorId, status: 'AVAILABLE' };
  const update = { status: 'BOOKED' };
  const opts = { new: true };
  if (session) opts.session = session;
  return await AppointmentSlot.findOneAndUpdate(filter, update, opts);
};

export async function bookAppointment({ patientId, doctorId, serviceId, serviceName, slotId, consultationType, reason, additionalComments, medicalReports = [], consultationFee, isFollowup = false, idempotencyKey }) {
  if (idempotencyKey) {
    const prev = await Appointment.findOne({ patientId, idempotencyKey });
    if (prev) return { appointment: prev, replayed: true };
  }
  try {
    const appointment = await runTxn(async (session) => {
      const slot = await claimSlot(slotId, doctorId, session);
      if (!slot) throw new ApiError(409, CONFLICT_MSG);
      
      const apptData = {
        patientId,
        doctorId,
        serviceId,
        serviceName,
        slotId: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        consultationType,
        reason,
        additionalComments,
        medicalReports,
        consultationFee,
        isFollowup,
        currency: 'INR',
        idempotencyKey,
        status: 'CONFIRMED',
        referenceId: ref(),
      };

      let appt;
      if (session) {
        const created = await Appointment.create([apptData], { session });
        appt = created[0];
      } else {
        appt = await Appointment.create(apptData);
      }

      slot.appointmentId = appt._id;
      if (typeof slot.save === 'function') {
        await slot.save(session ? { session } : {});
      } else {
        await AppointmentSlot.updateOne({ _id: slot._id }, { appointmentId: appt._id });
      }

      return appt;
    });
    return { appointment, replayed: false };
  } catch (e) {
    if (idempotencyKey) {
      const prev = await Appointment.findOne({ patientId, idempotencyKey });
      if (prev) return { appointment: prev, replayed: true };
    }
    throw e;
  }
}

export async function cancelAppointment({ appointmentId, patientId }) {
  const cutoff = Number(process.env.CANCEL_CUTOFF_HOURS ?? 2) * 3600e3;
  return runTxn(async (session) => {
    const filter = { _id: appointmentId, patientId };
    const appt = session ? await Appointment.findOne(filter).session(session) : await Appointment.findOne(filter);
    if (!appt) throw new ApiError(404, 'Appointment not found');
    if (!['PENDING', 'CONFIRMED'].includes(appt.status)) throw new ApiError(400, 'Appointment cannot be cancelled');
    if (new Date(appt.startAt).getTime() - Date.now() < cutoff) throw new ApiError(400, 'Too close to appointment time to cancel');
    
    appt.status = 'CANCELLED';
    if (typeof appt.save === 'function') {
      await appt.save(session ? { session } : {});
    } else {
      await Appointment.updateOne({ _id: appt._id }, { status: 'CANCELLED' });
    }

    if (appt.slotId) {
      await AppointmentSlot.updateOne(
        { _id: appt.slotId },
        { status: 'AVAILABLE', appointmentId: null },
        session ? { session } : {}
      );
    }
    return appt;
  });
}

export async function rescheduleAppointment({ appointmentId, patientId, newSlotId }) {
  return runTxn(async (session) => {
    const filter = { _id: appointmentId, patientId };
    const appt = session ? await Appointment.findOne(filter).session(session) : await Appointment.findOne(filter);
    if (!appt || !['PENDING', 'CONFIRMED'].includes(appt.status)) throw new ApiError(404, 'Appointment not found or not reschedulable');
    
    const slot = await claimSlot(newSlotId, appt.doctorId, session);
    if (!slot) throw new ApiError(409, CONFLICT_MSG);
    
    const oldSlotId = appt.slotId;
    appt.slotId = slot._id;
    appt.startAt = slot.startAt;
    appt.endAt = slot.endAt;

    if (typeof appt.save === 'function') {
      await appt.save(session ? { session } : {});
    } else {
      await Appointment.updateOne({ _id: appt._id }, { slotId: slot._id, startAt: slot.startAt, endAt: slot.endAt });
    }

    slot.appointmentId = appt._id;
    if (typeof slot.save === 'function') {
      await slot.save(session ? { session } : {});
    } else {
      await AppointmentSlot.updateOne({ _id: slot._id }, { appointmentId: appt._id });
    }

    if (oldSlotId) {
      await AppointmentSlot.updateOne(
        { _id: oldSlotId },
        { status: 'AVAILABLE', appointmentId: null },
        session ? { session } : {}
      );
    }

    return appt;
  });
}
