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
  ActivityIcon3D,
  BabyIcon3D,
  Shield3DIcon,
  XRayIcon3D,
  CtScanIcon3D,
  MriScanIcon3D,
  SonographyIcon3D,
  BloodTestIcon3D,
} from './Icons3D';
import { getService3DIcon } from './ServicesPage';
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

  // Stepper state:
  // Step 1: Doctor Concern (Choose Specialist)
  // Step 2: Hospital Diagnostic Service (Optional: X-Ray, CT Scan, MRI, Sonography, Blood Tests)
  // Step 3: Consultation Mode (In-Person OPD vs Video)
  // Step 4: Date & Available Time Slot
  // Step 5: Patient Details & Reports
  // Step 6: Review & Atomic Lock
  const [step, setStep] = useState(1);

  // Search in doctor selection
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
  const [reason, setReason] = useState('General consultation & healthcare review');
  const [additionalComments, setAdditionalComments] = useState('');
  const [medicalReports, setMedicalReports] = useState([]);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [slotConflict, setSlotConflict] = useState(false);
  
  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync prop changes
  useEffect(() => {
    if (preselectedDoctor) {
      setSelectedDoctor(preselectedDoctor);
      setStep(preselectedService ? 3 : 2);
    }
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [preselectedDoctor, preselectedService]);

  // 1. Load Medora Hospital Diagnostic Services
  useEffect(() => {
    setLoadingServices(true);
    api.getServices()
      .then((res) => {
        const srvs = res.data || [];
        setServicesList(srvs);
      })
      .catch((err) => console.warn('Services load error:', err))
      .finally(() => setLoadingServices(false));
  }, []);

  // 2. Load Medora Doctors
  useEffect(() => {
    if (doctorsList.length === 0) {
      setLoadingDoctors(true);
      api.getDoctors()
        .then((res) => {
          setDoctorsList(res.data || []);
          if (!selectedDoctor && res.data?.length > 0 && !preselectedDoctor) {
            // Default first doctor if none preselected
            setSelectedDoctor(res.data[0]);
          }
        })
        .catch((err) => console.warn('Doctors load error:', err))
        .finally(() => setLoadingDoctors(false));
    } else if (!selectedDoctor && !preselectedDoctor) {
      setSelectedDoctor(doctorsList[0]);
    }
  }, [doctorsList]);

  // 3. Fetch Fee Preview whenever Doctor changes
  useEffect(() => {
    if (selectedDoctor) {
      const docId = selectedDoctor._id || selectedDoctor.id;
      setLoadingFee(true);
      api.getDoctorFeePreview(docId)
        .then((res) => {
          if (res.data) setFeeInfo(res.data);
        })
        .catch(() => {
          setFeeInfo({
            isFollowup: false,
            firstVisitFee: selectedDoctor.firstVisitFee || selectedDoctor.consultationFee || 800,
            followupFee: selectedDoctor.followupFee || 500,
            applicableFee: selectedDoctor.firstVisitFee || selectedDoctor.consultationFee || 800,
            currency: 'INR',
            visitType: 'First Visit Consultation',
          });
        })
        .finally(() => setLoadingFee(false));
    }
  }, [selectedDoctor]);

  // 4. Fetch Available Slots for selected doctor & date
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const docId = selectedDoctor._id || selectedDoctor.id;
      setLoadingSlots(true);
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
    if (step === 1 && !selectedDoctor) {
      setError('Please select a Medora doctor for your consultation.');
      return;
    }
    if (step === 4 && (!selectedDate || !selectedSlot)) {
      setError('Please select an available appointment time slot.');
      return;
    }
    if (step === 5 && !reason.trim()) {
      setError('Please provide a brief reason or chief complaint for the visit.');
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
        setError('⚠️ This appointment slot was just booked by another patient. Please select an alternate time slot below.');
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

  const filteredDoctors = doctorsList.filter((doc) => {
    if (!doctorSearch) return true;
    return doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.department?.toLowerCase().includes(doctorSearch.toLowerCase());
  });

  const stepsList = [
    { num: 1, label: 'Doctor Concern' },
    { num: 2, label: 'Diagnostic Service' },
    { num: 3, label: 'Mode' },
    { num: 4, label: 'Date & Time' },
    { num: 5, label: 'Details & Reports' },
    { num: 6, label: 'Review & Confirm' },
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

  const serviceFee = selectedService ? (selectedService.startingPrice || selectedService.sessionPrice || 0) : 0;
  const doctorFee = feeInfo.applicableFee || selectedDoctor?.firstVisitFee || 600;
  const totalEstimatedFee = doctorFee + serviceFee;

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
            Schedule Your Consultation & Hospital Services
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
            Book in-person specialist consultations, X-Ray, CT Scan, MRI, Sonography, or Blood Tests
          </p>
        </div>

        {selectedDoctor && step > 1 && (
          <button
            onClick={() => setStep(1)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            ← Change Specialist ({selectedDoctor.name})
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
          gridTemplateColumns: selectedDoctor && step > 1 ? '290px 1fr' : '1fr',
          gap: 36,
          alignItems: 'start',
        }}>
          {/* Left Preview: Selected Doctor & Service Summary (shows on steps 2-6) */}
          {selectedDoctor && step > 1 && (
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
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                {selectedDoctor.name}
              </h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D9488', marginBottom: 2 }}>
                {selectedDoctor.specialization}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 12 }}>
                Medora Hospital, Saket Campus
              </div>

              {/* Selected Diagnostic Service Badge */}
              {selectedService ? (
                <div style={{
                  backgroundColor: '#F0FDFA',
                  borderRadius: 12,
                  padding: '10px 12px',
                  border: '1px solid #CCFBF1',
                  marginBottom: 16,
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>
                    + Diagnostic Service Attached:
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    {selectedService.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                    ₹{selectedService.startingPrice}
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#F1F5F9',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  color: '#64748B',
                  marginBottom: 16,
                }}>
                  Consultation Only (No Diagnostics)
                </div>
              )}

              {/* Consultation Fee Box */}
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
                    {feeInfo.isFollowup ? 'Follow-up Rate:' : 'Doctor Fee:'}
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: feeInfo.isFollowup ? '#059669' : '#0F172A' }}>
                    ₹{doctorFee}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Flat session fee in Indian Rupees
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
            {/* STEP 1: Select Doctor Concern */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 1: Select Medical Concern & Specialist
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Choose a senior board-certified specialist practicing at Medora Hospital for your consultation
                </p>

                {/* Doctor Search input */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <SearchIcon size={16} style={{ position: 'absolute', left: 14, top: 13, color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search doctor by name or medical specialty (General Medicine, Cardiology, Orthopedics, Pediatrics)..."
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
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                    Loading Medora Hospital doctors...
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16,
                  }}>
                    {filteredDoctors.map((doc) => {
                      const isSelected = selectedDoctor?._id === doc._id || selectedDoctor?.id === doc.id;
                      return (
                        <div
                          key={doc._id || doc.id}
                          onClick={() => {
                            setSelectedDoctor(doc);
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
                            gap: 14,
                            boxShadow: isSelected ? '0 8px 20px rgba(13, 148, 136, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)',
                          }}
                        >
                          <img
                            src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                            alt={doc.name}
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #2DD4BF',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                                {doc.name}
                              </h4>
                              <BadgeCheckIcon size={16} />
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D9488', marginBottom: 2 }}>
                              {doc.specialization}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 8 }}>
                              {doc.experience} yrs exp • {doc.qualification}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: 6 }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                                ₹{doc.firstVisitFee || doc.consultationFee || 600}
                              </span>
                              <span style={{ fontSize: '0.76rem', color: '#0D9488', fontWeight: 700 }}>
                                Select Specialist →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Hospital Diagnostic Service Selection (Optional) */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
                  <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A' }}>
                    Step 2: Attach Hospital Diagnostic Service (Optional)
                  </h3>
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    ← Change Doctor ({selectedDoctor?.name})
                  </button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Need an X-Ray, CT Scan, MRI, Sonography, or Blood Tests with your visit? Select below or proceed with consultation only.
                </p>

                {/* Option 0: Consultation Only */}
                <div
                  onClick={() => {
                    setSelectedService(null);
                    setStep(3);
                  }}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 14,
                    border: !selectedService ? '2px solid #0D9488' : '1px solid #E2E8F0',
                    backgroundColor: !selectedService ? '#F0FDFA' : '#FFFFFF',
                    cursor: 'pointer',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: !selectedService ? '6px solid #0D9488' : '2px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                    }} />
                    <div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                        Doctor Consultation Only
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                        No diagnostic scans or laboratory blood tests required for this appointment
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(null);
                      setStep(3);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    Proceed →
                  </button>
                </div>

                {/* Diagnostic Services List */}
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
                          setStep(3);
                        }}
                        style={{
                          padding: '18px',
                          borderRadius: 16,
                          border: isSelected ? '2px solid #0D9488' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          boxShadow: isSelected ? '0 8px 20px rgba(13, 148, 136, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {getService3DIcon(srv, 44)}
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D9488', backgroundColor: '#F0FDFA', padding: '4px 10px', borderRadius: 8, border: '1px solid #CCFBF1' }}>
                            ₹{srv.startingPrice}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                            {srv.title}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {srv.description}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                            {isSelected ? '✓ Attached to Booking' : 'Select Service →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Consultation Mode */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 3: Select Consultation Mode
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 24 }}>
                  Choose how you would like to consult with {selectedDoctor.name} at Medora Hospital
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                  {/* IN_PERSON */}
                  <div
                    onClick={() => setConsultationType('IN_PERSON')}
                    style={{
                      padding: '24px',
                      borderRadius: 18,
                      border: consultationType === 'IN_PERSON' ? '2.5px solid #0D9488' : '1.5px solid #E2E8F0',
                      backgroundColor: consultationType === 'IN_PERSON' ? '#F0FDFA' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <Hospital3DIcon size={44} />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                          In-Person Visit
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                          Hospital OPD & Diagnostic Suite
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, marginBottom: 12 }}>
                      Physical checkup, vitals examination, and direct access to on-site imaging and diagnostic suites at Medora Hospital.
                    </p>
                    <div style={{ fontSize: '0.76rem', color: '#0F766E', fontWeight: 700 }}>
                      ✓ Recommended for imaging, X-Rays, and physical exams
                    </div>
                  </div>

                  {/* ONLINE VIDEO */}
                  <div
                    onClick={() => setConsultationType('ONLINE')}
                    style={{
                      padding: '24px',
                      borderRadius: 18,
                      border: consultationType === 'ONLINE' ? '2.5px solid #0D9488' : '1.5px solid #E2E8F0',
                      backgroundColor: consultationType === 'ONLINE' ? '#F0FDFA' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <Video3DIcon size={44} />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                          Encrypted Video Consultation
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                          High-Definition Telemedicine
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, marginBottom: 12 }}>
                      Consult with Dr. {selectedDoctor.name.split(' ')[1] || selectedDoctor.name} over secure video with instant e-prescription download.
                    </p>
                    <div style={{ fontSize: '0.76rem', color: '#0F766E', fontWeight: 700 }}>
                      ✓ Zero commute time, join from any device
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Date & Available Time Slot */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 4: Select Appointment Date & Time
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Choose your preferred clinical appointment slot. Real-time atomic reservation guarantees no double bookings.
                </p>

                {/* 14-Day Horizontal Calendar Ribbon */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: 10 }}>
                    Select Consultation Date (Next 14 Days):
                  </div>
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                    {dateOptions.map((opt) => {
                      const isSelected = selectedDate === opt.dateStr;
                      return (
                        <button
                          key={opt.dateStr}
                          type="button"
                          onClick={() => setSelectedDate(opt.dateStr)}
                          style={{
                            minWidth: 70,
                            padding: '12px 10px',
                            borderRadius: 14,
                            border: isSelected ? '2px solid #0D9488' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#0D9488' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, opacity: isSelected ? 0.9 : 0.6 }}>
                            {opt.dayName}
                          </span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                            {opt.dayNum}
                          </span>
                          <span style={{ fontSize: '0.72rem', opacity: isSelected ? 0.9 : 0.6 }}>
                            {opt.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Slots */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569' }}>
                      Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}:
                    </div>
                    {availableSlots.length > 0 && (
                      <span style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
                        {availableSlots.filter(s => s.status === 'AVAILABLE').length} Slots Open
                      </span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      Checking doctor availability...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
                      <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                        No slots available on this date. Please select another date from the calendar.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                      {availableSlots.map((slot) => {
                        const isAvailable = slot.status === 'AVAILABLE';
                        const isSelected = selectedSlot?._id === slot._id;
                        const timeStr = new Date(slot.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                        return (
                          <button
                            key={slot._id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(slot)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 12,
                              border: isSelected
                                ? '2px solid #0D9488'
                                : isAvailable
                                  ? '1px solid #CBD5E1'
                                  : '1px solid #F1F5F9',
                              backgroundColor: isSelected
                                ? '#0D9488'
                                : isAvailable
                                  ? '#FFFFFF'
                                  : '#F8FAFC',
                              color: isSelected
                                ? '#FFFFFF'
                                : isAvailable
                                  ? '#0F172A'
                                  : '#94A3B8',
                              fontWeight: isSelected ? 800 : 600,
                              fontSize: '0.86rem',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <ClockIcon size={14} />
                            <span>{timeStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Reason, Symptoms & Medical Reports */}
            {step === 5 && (
              <div>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Step 5: Clinical Notes & Medical Reports
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 20 }}>
                  Share your primary medical concern, symptoms, and previous diagnostic reports with the consulting specialist
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Reason for Consultation / Medical Concern *
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Chest discomfort, back pain review, routine annual health check, or diagnostic test..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        color: '#0F172A',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Additional Notes or Symptoms (Optional)
                    </label>
                    <input
                      type="text"
                      value={additionalComments}
                      onChange={(e) => setAdditionalComments(e.target.value)}
                      placeholder="e.g. History of hypertension, current medications, fasting status..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        color: '#0F172A',
                      }}
                    />
                  </div>

                  {/* Medical Reports File Upload */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    padding: '20px',
                    border: '1.5px dashed #CBD5E1',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                          Upload Prior Scans or Blood Reports
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          PDF, JPG, or PNG up to 10MB each
                        </div>
                      </div>
                      <label
                        className="btn btn-secondary btn-sm"
                        style={{ cursor: uploadingReport ? 'wait' : 'pointer' }}
                      >
                        <span>{uploadingReport ? 'Uploading...' : '+ Upload File'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleReportUpload}
                          disabled={uploadingReport}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {medicalReports.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {medicalReports.map((rep, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: 8,
                              border: '1px solid #E2E8F0',
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.82rem',
                            }}
                          >
                            <span>📄 {rep.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveReport(idx)}
                              style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 800 }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                  Please verify your clinical booking summary before atomic database reservation
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                  }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>CONSULTING SPECIALIST</div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>{selectedDoctor.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#0D9488' }}>{selectedDoctor.specialization}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>CONSULTATION MODE</div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                        {consultationType === 'IN_PERSON' ? 'In-Person Hospital Visit' : 'Encrypted Video Consultation'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Medora Hospital, Saket Campus</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>DATE & TIME</div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                        {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700 }}>
                        {selectedSlot ? new Date(selectedSlot.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>DIAGNOSTIC SERVICE</div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                        {selectedService ? selectedService.title : 'None (Consultation Only)'}
                      </div>
                      {selectedService && (
                        <div style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700 }}>₹{selectedService.startingPrice}</div>
                      )}
                    </div>
                  </div>

                  {/* Fee Itemization */}
                  <div style={{
                    backgroundColor: '#F0FDFA',
                    borderRadius: 14,
                    padding: '16px 20px',
                    border: '1px solid #CCFBF1',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                      <span style={{ color: '#475569' }}>
                        Specialist Fee ({feeInfo.isFollowup ? 'Follow-up Rate' : 'First Visit'}):
                      </span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{doctorFee}</span>
                    </div>

                    {selectedService && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>
                          Diagnostic Service ({selectedService.title}):
                        </span>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{serviceFee}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 10,
                      marginTop: 6,
                      borderTop: '1px solid #CCFBF1',
                    }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F766E' }}>
                        Total Hospital Fee:
                      </span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0D9488' }}>
                        ₹{totalEstimatedFee}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 24,
              borderTop: '1px solid #F1F5F9',
              marginTop: 12,
            }}>
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-outline"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <ChevronLeftIcon size={16} />
                <span>{step === 1 ? 'Cancel' : 'Back'}</span>
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  <span>Continue</span>
                  <ArrowRightIcon size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 30px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
                  }}
                >
                  <span>{submitting ? 'Reserving Slot...' : 'Confirm & Book Appointment'}</span>
                  <CheckCircleIcon size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
