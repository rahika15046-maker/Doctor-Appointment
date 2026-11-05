import React from 'react';
import { CheckCircleIcon, MailIcon } from './Icons';

export default function BookingSuccessModal({
  isOpen,
  appointment,
  doctor,
  onViewAppointments,
  onGoToDashboard,
}) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '40px 32px', textAlign: 'center', maxWidth: 480 }}>
        {/* Animated Green Checkmark Icon */}
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          backgroundColor: '#DCFCE7',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 10px 25px rgba(22, 163, 74, 0.2)',
        }}>
          <CheckCircleIcon size={44} />
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
          Appointment Booked Successfully!
        </h2>

        <p style={{ fontSize: '0.92rem', color: '#64748B', marginBottom: 16 }}>
          Your appointment has been confirmed.
        </p>

        {/* Reference ID Pill */}
        <div style={{
          display: 'inline-block',
          backgroundColor: '#F0FDFA',
          border: '1px solid #CCFBF1',
          color: '#0F766E',
          padding: '8px 16px',
          borderRadius: 9999,
          fontSize: '0.9rem',
          fontWeight: 700,
          marginBottom: 28,
        }}>
          Reference ID: {appointment.referenceId || 'MED-2025-0425-001'}
        </div>

        {/* Doctor & Time Summary Box */}
        {doctor && (
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 14,
            padding: '16px',
            border: '1px solid #E2E8F0',
            marginBottom: 28,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <img
              src={doctor.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
              alt={doctor.name}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{doctor.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{doctor.specialization} • {appointment.consultationType === 'IN_PERSON' ? 'In-Person' : 'Online Video'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0D9488' }}>
                ₹{appointment.consultationFee || (appointment.isFollowup ? 600 : 1000)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                {appointment.isFollowup ? 'Follow-up' : 'First Visit'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <button
            onClick={onViewAppointments}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            View My Appointments
          </button>

          <button
            onClick={onGoToDashboard}
            className="btn btn-outline"
            style={{ width: '100%', padding: '12px' }}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Email sent notification alert */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.82rem',
          color: '#0369A1',
          textAlign: 'left',
        }}>
          <MailIcon size={18} style={{ flexShrink: 0 }} />
          <span>A confirmation email has been sent to your email address.</span>
        </div>
      </div>
    </div>
  );
}
