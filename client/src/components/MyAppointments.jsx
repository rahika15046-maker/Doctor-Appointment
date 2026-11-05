import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  HospitalIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from './Icons';
import api from '../services/api';

export default function MyAppointments({
  onBookNew,
  onViewDoctorProfile,
}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'PENDING'
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [actionError, setActionError] = useState('');
  
  // Modals inside appointments
  const [detailModalAppt, setDetailModalAppt] = useState(null);
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date(Date.now() + 864e5).toISOString().slice(0, 10));
  const [rescheduling, setRescheduling] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      console.warn('Appointments fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (appt) => {
    if (!window.confirm(`Are you sure you want to cancel your appointment with ${appt.doctorId?.name || 'the doctor'}?`)) {
      return;
    }
    setActionError('');
    try {
      await api.cancelAppointment(appt._id || appt.id);
      await loadAppointments();
    } catch (err) {
      setActionError(err.message || 'Cannot cancel appointment within 2 hours of scheduled time.');
    }
  };

  const openReschedule = async (appt) => {
    setRescheduleModalAppt(appt);
    setSelectedRescheduleSlot(null);
    setActionError('');
    const docId = appt.doctorId?._id || appt.doctorId?.id || appt.doctorId;
    try {
      const res = await api.getDoctorAvailability(docId, rescheduleDate);
      setRescheduleSlots(res.data || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDateChangeForReschedule = async (newDate) => {
    setRescheduleDate(newDate);
    if (!rescheduleModalAppt) return;
    const docId = rescheduleModalAppt.doctorId?._id || rescheduleModalAppt.doctorId?.id || rescheduleModalAppt.doctorId;
    try {
      const res = await api.getDoctorAvailability(docId, newDate);
      setRescheduleSlots(res.data || []);
      setSelectedRescheduleSlot(null);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedRescheduleSlot) return;
    setRescheduling(true);
    setActionError('');
    try {
      await api.rescheduleAppointment(
        rescheduleModalAppt._id || rescheduleModalAppt.id,
        selectedRescheduleSlot._id || selectedRescheduleSlot.id
      );
      setRescheduleModalAppt(null);
      await loadAppointments();
    } catch (err) {
      setActionError(err.message || 'Reschedule failed. Please select another slot.');
    } finally {
      setRescheduling(false);
    }
  };

  // Filter list
  const filteredAppointments = appointments.filter((appt) => {
    if (selectedYear !== 'ALL') {
      const apptYear = appt.startAt ? new Date(appt.startAt).getFullYear().toString() : '';
      if (apptYear && apptYear !== selectedYear) return false;
    }
    if (filterStatus === 'UPCOMING') {
      return ['CONFIRMED', 'PENDING'].includes(appt.status) && new Date(appt.startAt) > new Date();
    }
    if (filterStatus === 'COMPLETED') return appt.status === 'COMPLETED';
    if (filterStatus === 'CANCELLED') return appt.status === 'CANCELLED';
    if (filterStatus === 'PENDING') return appt.status === 'PENDING';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-confirmed">Confirmed</span>;
      case 'PENDING':
        return <span className="badge badge-pending">Pending</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Title & Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            My Appointments
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
            View and manage all your scheduled healthcare consultations
          </p>
        </div>

        <button onClick={onBookNew} className="btn btn-primary">
          + Book New Appointment
        </button>
      </div>

      {actionError && (
        <div style={{
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: '0.88rem',
        }}>
          {actionError}
        </div>
      )}

      {/* Filter Tabs Bar (matching image: All, Upcoming, Completed, Cancelled, Pending) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 12px',
        border: '1px solid #E2E8F0',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
            { id: 'PENDING', label: 'Pending' },
          ].map((tab) => {
            const active = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  border: 'none',
                  backgroundColor: active ? '#0D9488' : 'transparent',
                  color: active ? '#FFFFFF' : '#64748B',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.86rem',
                  padding: '7px 16px',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Year Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              backgroundColor: '#F8FAFC',
              outline: 'none',
            }}
          >
            <option value="ALL">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Loading your appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <CalendarIcon size={44} style={{ color: '#94A3B8', marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
            No appointments found
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 18 }}>
            You do not have any appointments under this category.
          </p>
          <button onClick={onBookNew} className="btn btn-primary btn-sm">
            Book an Appointment
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id || appt.id}
              className="card-3d"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                padding: '20px 24px',
              }}
            >
              {/* Doctor Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260 }}>
                <img
                  src={appt.doctorId?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                  alt={appt.doctorId?.name || 'Doctor'}
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2DD4BF' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                    {appt.doctorId?.name || 'Dr. Specialist'}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#0D9488', fontWeight: 600, marginBottom: 2 }}>
                    {appt.doctorId?.specialization || 'Cardiology'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Ref: {appt.referenceId || 'MED-2025-001'}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                  <CalendarIcon size={16} />
                  <span>{new Date(appt.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#64748B' }}>
                  <ClockIcon size={15} />
                  <span>{new Date(appt.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>{appt.consultationType === 'IN_PERSON' ? 'In-Person' : 'Online Video'}</span>
                </div>
              </div>

              {/* Fee & Visit Type */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  ₹{appt.consultationFee || (appt.isFollowup ? 600 : 1000)}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: appt.isFollowup ? '#059669' : '#0D9488',
                  backgroundColor: appt.isFollowup ? '#ECFDF5' : '#F0FDFA',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: appt.isFollowup ? '1px solid #A7F3D0' : '1px solid #CCFBF1',
                }}>
                  {appt.isFollowup ? 'Follow-up Session' : 'First Visit'}
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {getStatusBadge(appt.status)}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setDetailModalAppt(appt)}
                  className="btn btn-secondary btn-sm"
                >
                  View Details
                </button>

                {['CONFIRMED', 'PENDING'].includes(appt.status) && (
                  <>
                    <button
                      onClick={() => openReschedule(appt)}
                      className="btn btn-outline btn-sm"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(appt)}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {detailModalAppt && (
        <div className="modal-overlay" onClick={() => setDetailModalAppt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Appointment Details</h3>
              <button onClick={() => setDetailModalAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XIcon size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12 }}>
                <img
                  src={detailModalAppt.doctorId?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                  alt="Doctor"
                  style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{detailModalAppt.doctorId?.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#0D9488' }}>{detailModalAppt.doctorId?.specialization}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{detailModalAppt.doctorId?.hospital}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Date & Time</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                    {new Date(detailModalAppt.startAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Status</div>
                  <div>{getStatusBadge(detailModalAppt.status)}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 10 }}>
                {detailModalAppt.serviceName && (
                  <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Medora Service</div>
                    <div style={{ fontSize: '0.9rem', color: '#0D9488', fontWeight: 700 }}>
                      {detailModalAppt.serviceName}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>Reason for Consultation</div>
                <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 500 }}>
                  {detailModalAppt.reason || 'General health consultation'}
                </div>
                {detailModalAppt.additionalComments && (
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 6 }}>
                    Notes: {detailModalAppt.additionalComments}
                  </div>
                )}
                {detailModalAppt.medicalReports && detailModalAppt.medicalReports.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 6 }}>Attached Medical Reports:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {detailModalAppt.medicalReports.map((rep, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: '#F0FDFA',
                          color: '#0D9488',
                          border: '1px solid #CCFBF1',
                          fontWeight: 600,
                        }}>
                          📄 {rep.name || `Report ${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>Consultation Fee</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {detailModalAppt.isFollowup ? 'Follow-up Session rate' : 'First Visit Consultation rate'}
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: '#0D9488', fontSize: '1.25rem' }}>
                  ₹{detailModalAppt.consultationFee || (detailModalAppt.isFollowup ? 600 : 1000)}
                </span>
              </div>

              <button onClick={() => setDetailModalAppt(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="modal-overlay" onClick={() => setRescheduleModalAppt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reschedule Appointment</h3>
              <button onClick={() => setRescheduleModalAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XIcon size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 18 }}>
              Select a new date and available time slot for your consultation with {rescheduleModalAppt.doctorId?.name}.
            </p>

            <div className="form-group">
              <label className="form-label">Pick Date</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={rescheduleDate}
                onChange={(e) => handleDateChangeForReschedule(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Time Slots</label>
              {rescheduleSlots.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#64748B', padding: '12px 0' }}>
                  No available slots on this date. Please pick another date.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {rescheduleSlots.map((s) => {
                    const isAvailable = s.status === 'AVAILABLE';
                    const isSelected = selectedRescheduleSlot?._id === s._id;
                    const timeStr = new Date(s.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <button
                        key={s._id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedRescheduleSlot(s)}
                        style={{
                          padding: '8px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #0D9488' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#0D9488' : isAvailable ? '#FFFFFF' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : isAvailable ? '#1E293B' : '#94A3B8',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setRescheduleModalAppt(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                disabled={!selectedRescheduleSlot || rescheduling}
                onClick={handleConfirmReschedule}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {rescheduling ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
