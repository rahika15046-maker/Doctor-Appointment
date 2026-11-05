import React, { useState, useEffect } from 'react';
import {
  HospitalIcon,
  VideoIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  StarIcon,
  CheckCircleIcon,
  BadgeCheckIcon,
  SearchIcon,
  ShieldCheckIcon,
} from './Icons';
import {
  Hospital3DIcon,
  Video3DIcon,
  HeartIcon3D,
  BrainIcon3D,
  SparklesIcon3D,
  StethoscopeIcon3D,
  Shield3DIcon,
} from './Icons3D';
import api from '../services/api';

export default function BookingFlow({
  preselectedDoctor = null,
  preselectedService = null,
  allDoctors = [],
  onBookingSuccess,
  onCancel,
  onViewDoctorProfile,
}) {
  const [servicesList, setServicesList] = useState([]);
  const [selectedService, setSelectedService] = useState(preselectedService || null);
  const [loadingServices, setLoadingServices] = useState(false);

  const [doctorsList, setDoctorsList] = useState(allDoctors || []);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || null);

  // Stepper state: 1: Service, 2: Doctor, 3: Mode, 4: Slot, 5: Details/Reports, 6: Review
  const [step, setStep] = useState(preselectedDoctor ? 3 : preselectedService ? 2 : 1);

  // Filters for Step 2 Doctor Selection
  const [doctorSearch, setDoctorSearch] = useState('');

  // Consultation mode
  const [consultationType, setConsultationType] = useState('IN_PERSON'); // 'IN_PERSON' | 'ONLINE'
  
  // Date selection (default tomorrow)
  const tomorrowStr = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  
  // Slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fee preview from backend (First visit vs Follow-up in ₹)
  const [feeInfo, setFeeInfo] = useState({
    isFollowup: false,
    firstVisitFee: 1000,
    followupFee: 650,
    applicableFee: 1000,
    currency: 'INR',
    visitType: 'First Visit Consultation',
  });
  const [loadingFee, setLoadingFee] = useState(false);

  // Details & Reports
  const [reason, setReason] = useState('Routine consultation & health review');
  const [additionalComments, setAdditionalComments] = useState('');
  const [medicalReports, setMedicalReports] = useState([]);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [slotConflict, setSlotConflict] = useState(false);
  
  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Load Medora Hospital Services
  useEffect(() => {
    setLoadingServices(true);
    api.getServices()
      .then((res) => {
        const srvs = res.data || [];
        setServicesList(srvs);
        if (preselectedDoctor && !selectedService) {
          const matching = srvs.find(s => s.specialization === preselectedDoctor.specialization);
          if (matching) setSelectedService(matching);
        }
      })
      .catch((err) => console.warn('Services load error:', err))
      .finally(() => setLoadingServices(false));
  }, []);

  // 2. Load Medora Doctors
  useEffect(() => {
    if (doctorsList.length === 0) {
      setLoadingDoctors(true);
      api.getDoctors()
        .then((res) => setDoctorsList(res.data || []))
        .catch((err) => console.warn('Doctors load error:', err))
        .finally(() => setLoadingDoctors(false));
    }
  }, []);

  // 3. Preselected Doctor Prop Changes
  useEffect(() => {
    if (preselectedDoctor) {
      setSelectedDoctor(preselectedDoctor);
      setStep(3);
    }
  }, [preselectedDoctor]);

  // 4. Fetch fee preview from backend whenever selectedDoctor changes
  useEffect(() => {
    if (selectedDoctor) {
      const docId = selectedDoctor._id || selectedDoctor.id;
      setLoadingFee(true);
      api.getDoctorFeePreview(docId)
        .then((res) => {
          if (res.data) setFeeInfo(res.data);
        })
        .catch(() => {
          const firstFee = selectedDoctor.firstVisitFee || selectedDoctor.consultationFee || 800;
          const followFee = selectedDoctor.followupFee || Math.round(firstFee * 0.65);
          setFeeInfo({
            isFollowup: false,
            firstVisitFee: firstFee,
            followupFee: followFee,
            applicableFee: firstFee,
            currency: 'INR',
            visitType: 'First Visit Consultation',
          });
        })
        .finally(() => setLoadingFee(false));
    }
  }, [selectedDoctor]);

  // 5. Load slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const docId = selectedDoctor._id || selectedDoctor.id;
      setLoadingSlots(true);
      setSelectedSlot(null);
      api.getDoctorAvailability(docId, selectedDate)
        .then((res) => {
          const slots = res.data || [];
          setAvailableSlots(slots);
          const firstAvail = slots.find(s => s.status === 'AVAILABLE');
          if (firstAvail) setSelectedSlot(firstAvail);
        })
        .catch(() => {
          const fallback = [9, 10, 11, 12, 14, 15, 16, 17].map((h) => {
            const startAt = new Date(`${selectedDate}T${String(h).padStart(2, '0')}:00:00+05:30`);
            return {
              _id: `slot-${h}`,
              startAt,
              endAt: new Date(startAt.getTime() + 45 * 60e3),
              status: 'AVAILABLE',
            };
          });
          setAvailableSlots(fallback);
          setSelectedSlot(fallback[0]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDoctor, selectedDate]);

  // Handle report file upload
  const handleReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReport(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('report', file);
      const res = await api.uploadMedicalReport(formData);
      if (res.fileUrl) {
        setMedicalReports((prev) => [
          ...prev,
          {
            name: file.name,
            url: res.fileUrl,
            size: res.fileSize || `${(file.size / 1024).toFixed(1)} KB`,
          },
        ]);
      }
    } catch (err) {
      setError(err.message || 'Medical report upload failed. Only PDF, JPG, PNG allowed.');
    } finally {
      setUploadingReport(false);
      e.target.value = '';
    }
  };

  const handleRemoveReport = (index) => {
    setMedicalReports((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !selectedService) {
      setError('Please select a hospital service to continue.');
      return;
    }
    if (step === 2 && !selectedDoctor) {
      setError('Please select a Medora doctor to continue.');
      return;
    }
    if (step === 4 && (!selectedDate || !selectedSlot)) {
      setError('Please select an available appointment time slot.');
      return;
    }
    if (step === 5 && !reason.trim()) {
      setError('Please provide a brief reason for the visit.');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setSlotConflict(false);
    if (step > 1) {
      setStep(step - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleConfirmBooking = async () => {
    setError('');
    setSlotConflict(false);
    setSubmitting(true);
    const docId = selectedDoctor._id || selectedDoctor.id;
    const slotId = selectedSlot?._id || selectedSlot?.id;
    try {
      const res = await api.bookAppointment({
        doctorId: docId,
        serviceId: selectedService?._id,
        serviceName: selectedService?.title || selectedDoctor.specialization,
        slotId,
        consultationType,
        reason: reason.trim(),
        additionalComments: additionalComments.trim(),
        medicalReports: medicalReports.map(r => r.url || r),
      });
      if (res.data) {
        onBookingSuccess(res.data, selectedDoctor);
      }
    } catch (err) {
      const isConflict = err.status === 409 || err.message?.toLowerCase().includes('already') || err.message?.toLowerCase().includes('conflict');
      if (isConflict) {
        setSlotConflict(true);
        setError('⚠️ This appointment slot was just booked by another patient a moment ago. Please select an alternate available time slot below.');
        try {
          const freshSlots = await api.getDoctorAvailability(docId, selectedDate);
          setAvailableSlots(freshSlots.data || []);
          setSelectedSlot(null);
        } catch (e) {
          console.warn('Slot refresh error:', e);
        }
        setStep(4); // Jump back to Time Slot step!
      } else {
        setError(err.message || 'Appointment could not be confirmed. Please check your information.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Doctors filtered by selected service
  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesService = !selectedService ||
      doc.specialization === selectedService.specialization ||
      doc.department === selectedService.department ||
      (doc.servicesOffered && doc.servicesOffered.includes(selectedService.specialization));
    const matchesQuery = !doctorSearch ||
      doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.designation?.toLowerCase().includes(doctorSearch.toLowerCase());
    return matchesService && matchesQuery;
  });

  const stepsList = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Doctor' },
    { num: 3, label: 'Mode' },
    { num: 4, label: 'Date & Time' },
    { num: 5, label: 'Details' },
    { num: 6, label: 'Review' },
  ];

  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + (i + 1) * 864e5);
    return {
      dateStr: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const renderServiceIcon = (iconName) => {
    const lower = (iconName || '').toLowerCase();
    if (lower.includes('heart')) return <HeartIcon3D size={44} />;
    if (lower.includes('brain')) return <BrainIcon3D size={44} />;
    if (lower.includes('sparkle') || lower.includes('skin')) return <SparklesIcon3D size={44} />;
    if (lower.includes('shield')) return <Shield3DIcon size={44} />;
    return <StethoscopeIcon3D size={44} />;
  };

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0D9488', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
            <HospitalIcon size={14} />
            <span>MEDORA HOSPITAL APPOINTMENT BOOKING</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            Schedule Your Consultation
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
            Book an in-person hospital appointment or telemedicine video consultation session
          </p>
        </div>

        {selectedDoctor && step > 2 && (
          <button
            onClick={() => setStep(2)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            ← Change Doctor ({selectedDoctor.name.split(' ')[1] || selectedDoctor.name})
          </button>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="stepper-container" style={{ marginBottom: 28 }}>
        {stepsList.map((s) => {
          const isCompleted = step > s.num;
          const isActive = step === s.num;
          return (
            <div
              key={s.num}
              className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="step-circle">
                {isCompleted ? '✓' : s.num}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error / Conflict Alert Banner */}
      {error && (
        <div style={{
          backgroundColor: slotConflict ? '#FFFBEB' : '#FEF2F2',
          color: slotConflict ? '#B45309' : '#DC2626',
          border: `1.5px solid ${slotConflict ? '#FCD34D' : '#FECACA'}`,
          borderRadius: 14,
          padding: '14px 20px',
          marginBottom: 24,
          fontSize: '0.92rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}>
          {error}
        </div>
      )}

      {/* Main Container Card */}
      <div className="card-3d" style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedDoctor && step > 2 ? '290px 1fr' : '1fr',
          gap: 36,
          alignItems: 'start',
        }}>
          {/* Left Preview: Selected Doctor Card (shows on steps 3-6) */}
          {selectedDoctor && step > 2 && (
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 20,
              border: '1.5px solid #E2E8F0',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.04)',
            }}>
              <img
                src={selectedDoctor.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
                alt={selectedDoctor.name}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 12px auto',
                  border: '3px solid #2DD4BF',
                  boxShadow: '0 6px 16px rgba(13, 148, 136, 0.25)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0F172A' }}>
                  {selectedDoctor.name}
                </h3>
                <BadgeCheckIcon size={18} />
              </div>

              <p style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0D9488', marginBottom: 2 }}>
                {selectedDoctor.designation || 'Senior Consultant'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 12 }}>
                {selectedDoctor.qualification} • {selectedDoctor.experience} yrs exp
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#FEF3C7',
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#92400E',
                marginBottom: 16,
              }}>
                <StarIcon size={14} />
                <span>{selectedDoctor.averageRating || 4.8} ({selectedDoctor.reviewsCount || 2100}+ reviews)</span>
              </div>

              {/* Medora Hospital Tag */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 12px',
                border: '1px solid #E2E8F0',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                color: '#0F766E',
                fontWeight: 700,
              }}>
                <HospitalIcon size={16} />
                <span>Medora Hospital, Saket</span>
              </div>

              {/* Fee Box */}
              <div style={{
                backgroundColor: feeInfo.isFollowup ? '#ECFDF5' : '#F0FDFA',
                borderRadius: 14,
                padding: '12px 14px',
                border: feeInfo.isFollowup ? '1.5px solid #A7F3D0' : '1px solid #CCFBF1',
                marginBottom: 16,
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: '0.76rem', color: feeInfo.isFollowup ? '#065F46' : '#64748B', fontWeight: 700 }}>
                    {feeInfo.isFollowup ? 'Follow-up Rate:' : 'First Visit Rate:'}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: feeInfo.isFollowup ? '#059669' : '#0F172A' }}>
                    ₹{feeInfo.applicableFee}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Flat rate per 45-min clinical session
                </div>
              </div>

              {onViewDoctorProfile && (
                <button
                  type="button"
                  onClick={() => onViewDoctorProfile(selectedDoctor)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0D9488',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    width: '100%',
                  }}
                >
                  <span>View Full Profile</span>
                  <ArrowRightIcon size={14} />
                </button>
              )}
            </div>
          )}

          {/* Right Area: Stepper Forms */}
          <div>
            {/* STEP 1: Select Medora Hospital Service */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 1: Select Hospital Service
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 24 }}>
                  Choose a Medora Hospital clinical department or specialty service for your consultation
                </p>

                {loadingServices ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                    Loading Medora clinical services...
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16,
                  }}>
                    {servicesList.map((srv) => {
                      const isSelected = selectedService?._id === srv._id || selectedService?.title === srv.title;
                      return (
                        <div
                          key={srv._id || srv.title}
                          onClick={() => {
                            setSelectedService(srv);
                            setSelectedDoctor(null);
                            setStep(2);
                          }}
                          style={{
                            padding: '20px',
                            borderRadius: 16,
                            border: isSelected ? '2px solid #0D9488' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            boxShadow: isSelected ? '0 8px 20px rgba(13, 148, 136, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {renderServiceIcon(srv.icon)}
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D9488', backgroundColor: '#F0FDFA', padding: '3px 8px', borderRadius: 6 }}>
                              From ₹{srv.startingPrice}
                            </span>
                          </div>

                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                              {srv.title}
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {srv.description}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                              Select Department →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Select Medora Doctor */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
                  <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A' }}>
                    Step 2: Choose Medora Doctor
                  </h3>
                  {selectedService && (
                    <button
                      onClick={() => setStep(1)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      ← Change Service ({selectedService.title})
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Select an available specialist in Medora Hospital’s {selectedService?.specialization || 'Clinical'} Department
                </p>

                {/* Doctor Search input */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <SearchIcon size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search doctor in this department by name..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 12,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {loadingDoctors ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    Loading specialists...
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No specialists found matching this service.
                    <button onClick={() => setSelectedService(null)} className="btn btn-link" style={{ marginLeft: 8 }}>
                      Show all doctors
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {filteredDoctors.map((doc) => {
                      const isSelected = selectedDoctor?._id === doc._id;
                      return (
                        <div
                          key={doc._id}
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setStep(3);
                          }}
                          style={{
                            padding: '18px',
                            borderRadius: 16,
                            border: isSelected ? '2px solid #0D9488' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: 14,
                            alignItems: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 8px 18px rgba(13, 148, 136, 0.2)' : 'none',
                          }}
                        >
                          <img
                            src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                            alt={doc.name}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #2DD4BF',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                              {doc.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                              {doc.designation || doc.specialization}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {doc.experience} yrs exp • ₹{doc.firstVisitFee || doc.consultationFee || 800}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Consultation Mode */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 3: Select Consultation Mode
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 24 }}>
                  Choose whether you want to visit Medora Hospital in person or consult online via HD Video
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                  {/* In-Person Option */}
                  <div
                    onClick={() => setConsultationType('IN_PERSON')}
                    style={{
                      border: consultationType === 'IN_PERSON' ? '2.5px solid #0D9488' : '1px solid #E2E8F0',
                      backgroundColor: consultationType === 'IN_PERSON' ? '#F0FDFA' : '#FFFFFF',
                      borderRadius: 18,
                      padding: '24px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 14,
                      boxShadow: consultationType === 'IN_PERSON' ? '0 12px 24px -4px rgba(13, 148, 136, 0.25)' : 'none',
                    }}
                  >
                    <Hospital3DIcon size={56} />
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        In-Person Hospital Visit
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.4 }}>
                        Consult at Medora Hospital Outpatient Clinic (Saket, New Delhi)
                      </p>
                    </div>
                  </div>

                  {/* Online Video Option */}
                  <div
                    onClick={() => setConsultationType('ONLINE')}
                    style={{
                      border: consultationType === 'ONLINE' ? '2.5px solid #0D9488' : '1px solid #E2E8F0',
                      backgroundColor: consultationType === 'ONLINE' ? '#F0FDFA' : '#FFFFFF',
                      borderRadius: 18,
                      padding: '24px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 14,
                      boxShadow: consultationType === 'ONLINE' ? '0 12px 24px -4px rgba(13, 148, 136, 0.25)' : 'none',
                    }}
                  >
                    <Video3DIcon size={56} />
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        Online Video Consult
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.4 }}>
                        Encrypted high-definition telemedicine consultation from anywhere
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Fee Transparency Box */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 16,
                  padding: '16px 20px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                      {feeInfo.visitType}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Complete 45-minute clinical consultation session at Medora Hospital
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D9488' }}>
                      ₹{feeInfo.applicableFee}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Flat rate • No hidden minute charges
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Date & Available Time Slot */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 4: Select Appointment Date & Slot
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Select an available consultation slot with {selectedDoctor?.name}
                </p>

                {/* Date options */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: 10,
                  marginBottom: 24,
                }}>
                  {dateOptions.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <div
                        key={d.dateStr}
                        onClick={() => setSelectedDate(d.dateStr)}
                        style={{
                          padding: '12px 6px',
                          borderRadius: 14,
                          border: isSelected ? '2.5px solid #0D9488' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#0D9488' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#1E293B',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 6px 14px rgba(13, 148, 136, 0.35)' : 'none',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.7 }}>{d.dayName}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{d.dayNum}</div>
                        <div style={{ fontSize: '0.7rem', opacity: isSelected ? 0.9 : 0.7 }}>{d.month}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Time Slots */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                    Available Slots on {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}:
                  </div>

                  {loadingSlots ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                      Querying real-time slot availability from Medora database...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: 12 }}>
                      No available slots on this date. Please pick another date above.
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(116px, 1fr))',
                      gap: 12,
                    }}>
                      {availableSlots.map((s) => {
                        const isAvailable = s.status === 'AVAILABLE';
                        const isSelected = selectedSlot?._id === s._id;
                        const timeStr = new Date(s.startAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Kolkata',
                        });

                        return (
                          <button
                            key={s._id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(s)}
                            style={{
                              padding: '12px 8px',
                              borderRadius: 14,
                              border: isSelected ? '2.5px solid #0D9488' : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? '#0D9488' : isAvailable ? '#FFFFFF' : '#F1F5F9',
                              color: isSelected ? '#FFFFFF' : isAvailable ? '#0F172A' : '#94A3B8',
                              fontSize: '0.88rem',
                              fontWeight: isSelected ? 800 : 600,
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              textDecoration: !isAvailable ? 'line-through' : 'none',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 6px 14px rgba(13, 148, 136, 0.3)' : 'none',
                            }}
                          >
                            {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Reason, Symptoms & Medical Report Upload */}
            {step === 5 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 5: Appointment Details & Reports
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Help {selectedDoctor?.name} understand your symptoms and review any prior records
                </p>

                <div className="form-group">
                  <label className="form-label">Reason for Consultation *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chronic cough, cardiac follow-up, routine wellness review"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Symptoms & Notes (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe any current symptoms, current medication, or health background..."
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                  />
                </div>

                {/* Optional Medical Reports Upload */}
                <div className="form-group" style={{ marginTop: 20 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Attach Medical Records / Reports (Optional)</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>PDF, JPG, PNG up to 10MB</span>
                  </label>

                  <div style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: 14,
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    position: 'relative',
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleReportUpload}
                      disabled={uploadingReport}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                    <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>📄</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0D9488' }}>
                      {uploadingReport ? 'Uploading Report to Medical Vault...' : 'Click or Drop Medical Records Here'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                      Upload previous blood panels, MRI/X-ray scans, or discharge summaries
                    </div>
                  </div>

                  {medicalReports.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {medicalReports.map((rep, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            backgroundColor: '#F0FDFA',
                            border: '1px solid #CCFBF1',
                            borderRadius: 10,
                            fontSize: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                            <span>📎</span>
                            <span style={{ fontWeight: 600, color: '#0F766E', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {rep.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({rep.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveReport(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#DC2626',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: Review & Final Confirmation */}
            {step === 6 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 6: Review & Lock Appointment
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Confirm your appointment booking details at Medora Hospital
                </p>

                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 18,
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Hospital</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>Medora Hospital (Saket, New Delhi)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Department / Service</span>
                    <span style={{ fontWeight: 700, color: '#0D9488' }}>
                      {selectedService?.title || selectedDoctor?.specialization}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Doctor</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>
                      {selectedDoctor?.name} ({selectedDoctor?.designation || selectedDoctor?.qualification})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Consultation Mode</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>
                      {consultationType === 'IN_PERSON' ? 'In-Person at Medora Hospital' : 'Online HD Video Consult'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Date & Time</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>
                      {selectedSlot && new Date(selectedSlot.startAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Reason</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{reason}</span>
                  </div>

                  {medicalReports.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                      <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Attached Reports</span>
                      <span style={{ fontWeight: 600, color: '#0D9488' }}>{medicalReports.length} report(s) uploaded</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '1.05rem' }}>Total Session Fee</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{feeInfo.visitType} • Indian Rupees (INR)</div>
                    </div>
                    <span style={{ color: '#0D9488', fontWeight: 800, fontSize: '1.5rem' }}>
                      ₹{feeInfo.applicableFee}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid #F1F5F9',
            }}>
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ padding: '10px 24px' }}
              >
                Back
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ padding: '11px 30px' }}
                >
                  <span>Next Step</span>
                  <ArrowRightIcon size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className="btn btn-primary"
                  style={{ padding: '12px 34px', fontSize: '1rem' }}
                >
                  {submitting ? 'Locking Appointment...' : `Confirm & Pay ₹${feeInfo.applicableFee}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
