import React, { useState, useEffect } from 'react';
import {
  StethoscopeIcon,
  ActivityIcon,
  ShieldCheckIcon,
  VideoIcon,
  HeartIcon,
  ArrowRightIcon,
  SearchIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  XIcon,
} from './Icons';
import {
  HeartIcon3D,
  SparklesIcon3D,
  BrainIcon3D,
  BabyIcon3D,
  FemaleIcon3D,
  ToothIcon3D,
  StethoscopeIcon3D,
  ActivityIcon3D,
  Hospital3DIcon,
  Video3DIcon,
  Shield3DIcon,
  Clock3DIcon,
} from './Icons3D';
import api from '../services/api';

export function getService3DIcon(service, size = 52) {
  const text = `${service?.icon || ''} ${service?.title || ''} ${service?.name || ''} ${service?.department || ''} ${service?.specialization || ''}`.toLowerCase();
  
  if (text.includes('cardio') || text.includes('heart')) return <HeartIcon3D size={size} />;
  if (text.includes('neuro') || text.includes('brain')) return <BrainIcon3D size={size} />;
  if (text.includes('derma') || text.includes('skin') || text.includes('sparkle')) return <SparklesIcon3D size={size} />;
  if (text.includes('pediatric') || text.includes('child') || text.includes('baby')) return <BabyIcon3D size={size} />;
  if (text.includes('gynec') || text.includes('women') || text.includes('female')) return <FemaleIcon3D size={size} />;
  if (text.includes('dent') || text.includes('tooth') || text.includes('oral') || text.includes('smile')) return <ToothIcon3D size={size} />;
  if (text.includes('ortho') || text.includes('joint') || text.includes('physio') || text.includes('bone')) return <ActivityIcon3D size={size} />;
  if (text.includes('diag') || text.includes('lab') || text.includes('patholog')) return <ActivityIcon3D size={size} />;
  if (text.includes('tele') || text.includes('video')) return <Video3DIcon size={size} />;
  if (text.includes('vaccin') || text.includes('immun') || text.includes('shield') || text.includes('prevent')) return <Shield3DIcon size={size} />;
  if (text.includes('emergency') || text.includes('urgent') || text.includes('clock')) return <Clock3DIcon size={size} />;
  if (text.includes('hospital') || text.includes('clinic')) return <Hospital3DIcon size={size} />;
  
  return <StethoscopeIcon3D size={size} />;
}

export default function ServicesPage({ onBookAppointment, onFindDoctor }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getServices()
      .then((res) => {
        if (mounted) setServices(res.data || []);
      })
      .catch((err) => {
        console.warn('Failed to fetch services, using fallbacks:', err);
        if (mounted) {
          setServices([
            {
              id: 'srv-1',
              title: 'General Health & Primary Care',
              name: 'General Health & Primary Care',
              specialization: 'General Medicine',
              department: 'General Medicine',
              category: 'General Care',
              description: 'Comprehensive physical examination, primary diagnosis, chronic disease management, and prescription guidance.',
              overview: 'Our General Medicine department serves as the foundation of health management at Medora Hospital, offering expert diagnosis, evidence-based treatments, and individualized lifestyle guidance.',
              benefits: ['Full body vitals screening & biometric analysis', 'Same-day digital prescription & medical record', 'Complimentary 7-day query support', 'Integrated pharmacy and pathology coordination'],
              startingPrice: 600,
              sessionPrice: 600,
              features: ['Complete clinical physical assessment', 'Digital prescription & summary', 'Follow-up query support'],
              icon: 'stethoscope',
            },
            {
              id: 'srv-2',
              title: 'Cardiology & Advanced Heart Care',
              name: 'Cardiology & Advanced Heart Care',
              specialization: 'Cardiology',
              department: 'Cardiology',
              category: 'Specialized Care',
              description: 'Advanced non-invasive cardiac evaluation, digital 12-lead ECG review, 2D Echo triage, blood pressure optimization, and lipid management.',
              overview: 'Dedicated to cardiac excellence, Medora Hospital cardiologists utilize state-of-the-art diagnostic protocols to detect, manage, and prevent cardiovascular conditions.',
              benefits: ['12-lead digital ECG and rhythm analysis', 'Cardiovascular risk stratification', 'Hypertension & lipid management protocols', 'Direct admission pathway for emergency care'],
              startingPrice: 1200,
              sessionPrice: 1200,
              features: ['12-lead digital ECG review', 'Cardiovascular risk stratification', 'Lifestyle & dietary planning'],
              icon: 'heart',
            },
            {
              id: 'srv-3',
              title: 'Dermatology & Skin Aesthetics',
              name: 'Dermatology & Skin Aesthetics',
              specialization: 'Dermatology',
              department: 'Dermatology',
              category: 'Specialized Care',
              description: 'Specialized clinical dermatology for acne, eczema, psoriasis, hair loss, laser consultations, and advanced allergy diagnostics.',
              overview: 'Combining medical dermatology and aesthetic care, our dermatologists treat skin, hair, and nail conditions using certified protocols and clinical technologies.',
              benefits: ['High-resolution dermoscopy and skin barrier analysis', 'Individualized acne, eczema, and psoriasis roadmaps', 'Clinical trichology assessments for hair health', 'Safe, medical-grade laser and aesthetic consultations'],
              startingPrice: 900,
              sessionPrice: 900,
              features: ['Skin barrier analysis', 'Acne treatment plans', 'Hair follicle health audit'],
              icon: 'sparkles',
            },
            {
              id: 'srv-4',
              title: 'Neurology & Brain Sciences',
              name: 'Neurology & Brain Sciences',
              specialization: 'Neurology',
              department: 'Neurology',
              category: 'Specialized Care',
              description: 'Expert neurological evaluations for migraines, chronic headaches, neuropathy, vertigo, seizure disorders, and cognitive wellness.',
              overview: 'Our neurology specialists deliver advanced diagnostics and therapeutic management for complex central and peripheral nervous system disorders.',
              benefits: ['Specialized chronic migraine and headache profiling', 'Comprehensive nerve conduction and reflex testing', 'Sleep disorder and cognitive wellness reviews', 'Targeted neuro-rehabilitation care plans'],
              startingPrice: 1500,
              sessionPrice: 1500,
              features: ['Reflex & motor function test', 'Migraine trigger mapping', 'Cognitive wellness assessment'],
              icon: 'brain',
            },
            {
              id: 'srv-5',
              title: 'Orthopedics & Joint Care',
              name: 'Orthopedics & Joint Care',
              specialization: 'Orthopedics',
              department: 'Orthopedics',
              category: 'Specialized Care',
              description: 'Bone density evaluation, joint pain management, sports injury rehabilitation, arthritis triage, and minimally invasive surgical consultations.',
              overview: 'From sports injuries to degenerative arthritis, Medora’s orthopedic team delivers precision diagnostic care, joint preservation strategies, and physical rehabilitation.',
              benefits: ['Detailed joint mobility and range-of-motion assessments', 'Digital X-ray, CT, and MRI evaluations', 'Personalized physical rehabilitation roadmaps', 'Ergonomic guidance for musculoskeletal health'],
              startingPrice: 1100,
              sessionPrice: 1100,
              features: ['Range-of-motion audit', 'X-ray / MRI review', 'Physical rehab roadmap'],
              icon: 'activity',
            },
            {
              id: 'srv-6',
              title: 'Pediatrics & Child Healthcare',
              name: 'Pediatrics & Child Healthcare',
              specialization: 'Pediatrics',
              department: 'Pediatrics',
              category: 'Specialized Care',
              description: 'Child wellness assessments, infant growth milestones, pediatric nutrition, and complete WHO/IAP vaccination schedules.',
              overview: 'Providing compassionate care from birth through adolescence, our pediatric team ensures your child’s optimal physical, cognitive, and emotional development.',
              benefits: ['Growth percentile and developmental tracking', 'Cold-chain certified WHO and IAP vaccination schedules', 'Pediatric allergy and nutrition guidance', 'Direct access to pediatric emergency care'],
              startingPrice: 800,
              sessionPrice: 800,
              features: ['Growth percentile chart', 'Vaccination certificate', 'Diet & lactation counselling'],
              icon: 'baby',
            },
            {
              id: 'srv-7',
              title: 'Gynecology & Women’s Health',
              name: 'Gynecology & Women’s Health',
              specialization: 'Gynecology',
              department: 'Gynecology',
              category: 'Specialized Care',
              description: 'Antenatal care, PCOS/PCOD management, hormonal health, cervical screenings, and personalized family planning guidance.',
              overview: 'Dedicated to women across all life stages, our gynecology department provides empathetic care covering preventive screening, hormonal balance, and maternal care.',
              benefits: ['High-resolution pelvic ultrasound and pap smear reviews', 'Structured PCOS/PCOD metabolic lifestyle programs', 'Comprehensive prenatal and antenatal health roadmaps', 'Confidential and compassionate clinical environment'],
              startingPrice: 1000,
              sessionPrice: 1000,
              features: ['Pelvic ultrasound review', 'Hormonal balance panel', 'Confidential consultation'],
              icon: 'female',
            },
            {
              id: 'srv-8',
              title: 'Dental Care & Oral Surgery',
              name: 'Dental Care & Oral Surgery',
              specialization: 'Dentistry',
              department: 'Dental Care',
              category: 'Specialized Care',
              description: 'Digital smile design, painless root canals, teeth alignment, dental scaling, cavity prevention, and surgical extractions.',
              overview: 'Our dental suite at Medora Hospital offers restorative, preventative, and cosmetic oral healthcare delivered with advanced sterile instrumentation.',
              benefits: ['High-definition intraoral camera diagnostics', 'Painless single-sitting root canal treatment options', 'Ultrasonic dental scaling and enamel protection', 'Transparent pricing with take-home oral care kits'],
              startingPrice: 700,
              sessionPrice: 700,
              features: ['Intraoral camera examination', 'Digital dental mapping', 'Enamel polish & cleaning'],
              icon: 'tooth',
            },
            {
              id: 'srv-9',
              title: 'Diagnostics & Laboratory Services',
              name: 'Diagnostics & Laboratory Services',
              specialization: 'Diagnostics and Laboratory',
              department: 'Diagnostics',
              category: 'Diagnostics',
              description: 'NABL-accredited diagnostic tests including complete metabolic panels, thyroid profiles, lipid panels, urine cytology, and digital radiology.',
              overview: 'Equipped with cutting-edge automated analyzers, Medora Hospital’s pathology and diagnostic laboratory delivers precise results within hours.',
              benefits: ['Automated barcoded specimen processing', 'Verified digital reports delivered via patient portal within 12-24 hours', 'Doctor review included with abnormal laboratory values', 'Strict international quality assurance standards'],
              startingPrice: 500,
              sessionPrice: 500,
              features: ['Home sample collection available', 'Digital report delivery within 24 hours', 'Doctor review included'],
              icon: 'activity',
            },
            {
              id: 'srv-10',
              title: 'HD Telemedicine Video Consultation',
              name: 'HD Telemedicine Video Consultation',
              specialization: 'General Medicine',
              department: 'Telemedicine',
              category: 'Telemedicine',
              description: 'End-to-end encrypted video consultation with senior board-certified specialists from anywhere in India.',
              overview: 'Experience high-definition video healthcare consultations from the comfort of your home with certified Medora Hospital specialists.',
              benefits: ['Zero waiting room time', 'Encrypted audio/video room', 'E-prescription delivered instantly to patient portal', 'Follow-up consultation booking discount'],
              startingPrice: 900,
              sessionPrice: 900,
              features: ['Zero waiting room time', 'Encrypted audio/video room', 'E-prescription delivered instantly'],
              icon: 'video',
            },
          ]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const categories = ['ALL', 'General Care', 'Specialized Care', 'Diagnostics', 'Preventive', 'Telemedicine'];

  const filteredServices = services.filter((srv) => {
    const title = srv.title || srv.name || '';
    const desc = srv.description || srv.overview || '';
    const dept = srv.department || srv.specialization || '';
    const matchesCat = selectedCategory === 'ALL' ||
      srv.category === selectedCategory ||
      (selectedCategory === 'Specialized Care' && ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dentistry'].includes(srv.specialization));
    
    const matchesQuery = !searchQuery ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesQuery;
  });

  const handleOpenBooking = (srv) => {
    if (onBookAppointment) {
      onBookAppointment(srv);
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F0FDFA',
          color: '#0D9488',
          padding: '6px 16px',
          borderRadius: 9999,
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: 14,
          border: '1px solid #CCFBF1',
        }}>
          <span>✦ Clinical Excellence & Specialized Healthcare</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 12 }}>
          Medora Hospital Clinical Services
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
          Explore our range of hospital care, diagnostics, preventive programs, and video consultations.
          Every service is backed by board-certified specialists and transparent session-based pricing in Indian Rupees (₹).
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: '16px 20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: 36,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 320px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search clinical services, departments, treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.92rem',
              color: '#0F172A',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  border: 'none',
                  backgroundColor: active ? '#0D9488' : '#F1F5F9',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.82rem',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#64748B' }}>
          Loading clinical services catalog...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            No matching services found
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 16 }}>
            Try searching for another treatment or clear your category filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="btn btn-outline btn-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 28,
        }}>
          {filteredServices.map((srv) => {
            const title = srv.title || srv.name || 'Medical Service';
            const price = srv.startingPrice || srv.sessionPrice || srv.price || 800;
            const dept = srv.department || srv.specialization || 'Clinical Care';

            return (
              <div
                key={srv._id || srv.id || title}
                className="card-3d"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '28px',
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Header with 3D Icon & Category Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ cursor: 'pointer' }} onClick={() => setSelectedServiceForDetail(srv)}>
                      {getService3DIcon(srv, 52)}
                    </div>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0D9488',
                      backgroundColor: '#F0FDFA',
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid #CCFBF1',
                    }}>
                      {dept}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedServiceForDetail(srv)}
                    style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 10, cursor: 'pointer' }}
                  >
                    {title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.55, marginBottom: 20 }}>
                    {srv.description || srv.overview}
                  </p>

                  {/* Features List */}
                  {srv.features && srv.features.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
                      {srv.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#334155' }}>
                          <CheckCircleIcon size={15} style={{ color: '#0D9488', flexShrink: 0 }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div style={{
                  paddingTop: 18,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>SESSION FEE</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D9488' }}>
                      ₹{price}
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}> / session</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setSelectedServiceForDetail(srv)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px 12px', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenBooking(srv)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      <span>Book</span>
                      <ArrowRightIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SERVICE DETAILS MODAL (WITH DIRECT BOOKING OPTION) */}
      {selectedServiceForDetail && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedServiceForDetail(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="modal-content card-3d"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              maxWidth: 720,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '36px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedServiceForDetail(null)}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
              }}
            >
              <XIcon size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              {getService3DIcon(selectedServiceForDetail, 64)}
              <div>
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0D9488',
                  backgroundColor: '#F0FDFA',
                  padding: '3px 10px',
                  borderRadius: 6,
                  border: '1px solid #CCFBF1',
                  marginBottom: 6,
                }}>
                  {selectedServiceForDetail.department || selectedServiceForDetail.specialization || 'Medora Specialty'}
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                  {selectedServiceForDetail.title || selectedServiceForDetail.name}
                </h2>
              </div>
            </div>

            {/* Clinical Overview */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                Clinical Service Overview
              </h4>
              <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6 }}>
                {selectedServiceForDetail.overview || selectedServiceForDetail.description}
              </p>
            </div>

            {/* Clinical Benefits Grid */}
            {selectedServiceForDetail.benefits && selectedServiceForDetail.benefits.length > 0 && (
              <div style={{ marginBottom: 24, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                  Key Clinical Benefits & Inclusions
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {selectedServiceForDetail.benefits.map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircleIcon size={18} style={{ color: '#0D9488', marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & Consultation Info */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '20px 24px',
              backgroundColor: '#F0FDFA',
              borderRadius: 16,
              border: '1px solid #CCFBF1',
              marginBottom: 28,
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F766E' }}>
                  TRANSPARENT SESSION RATE
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D9488' }}>
                  ₹{selectedServiceForDetail.startingPrice || selectedServiceForDetail.sessionPrice || selectedServiceForDetail.price || 800}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}> / clinical session</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0F766E', marginTop: 2 }}>
                  ✦ Follow-up consultation discounts automatically applied
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Hospital Facility</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  Medora Hospital, Saket Campus
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 600 }}>
                  In-Person OPD & Encrypted Video
                </div>
              </div>
            </div>

            {/* Action Buttons: Book This Service & Browse Doctors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const spec = selectedServiceForDetail.specialization || selectedServiceForDetail.department;
                  setSelectedServiceForDetail(null);
                  if (onFindDoctor) onFindDoctor(spec);
                }}
                className="btn btn-outline"
                style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}
              >
                Browse Department Doctors
              </button>
              
              <button
                onClick={() => {
                  const srv = selectedServiceForDetail;
                  setSelectedServiceForDetail(null);
                  handleOpenBooking(srv);
                }}
                className="btn btn-primary"
                style={{
                  padding: '12px 28px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CalendarIcon size={18} />
                <span>Book This Service</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Guarantee Banner */}
      <div style={{
        marginTop: 56,
        padding: '32px',
        borderRadius: 22,
        backgroundColor: '#042F2E',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        <div style={{ maxWidth: 640 }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Need guidance choosing the right clinical specialty?
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#99F6E4', lineHeight: 1.5 }}>
            Our healthcare triage team can assist you in finding the exact doctor or diagnostic test suited to your symptoms.
          </p>
        </div>
        <button
          onClick={() => onFindDoctor && onFindDoctor()}
          className="btn"
          style={{
            backgroundColor: '#2DD4BF',
            color: '#042F2E',
            fontWeight: 800,
            padding: '12px 28px',
            borderRadius: 12,
          }}
        >
          Browse All Medora Doctors
        </button>
      </div>
    </div>
  );
}
