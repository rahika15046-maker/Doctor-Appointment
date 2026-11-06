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
  XRayIcon3D,
  CtScanIcon3D,
  MriScanIcon3D,
  SonographyIcon3D,
  BloodTestIcon3D,
  HeartIcon3D,
  BrainIcon3D,
  StethoscopeIcon3D,
  ActivityIcon3D,
  Hospital3DIcon,
} from './Icons3D';
import api from '../services/api';

export function getService3DIcon(service, size = 52) {
  const text = `${service?.icon || ''} ${service?.title || ''} ${service?.name || ''} ${service?.department || ''} ${service?.specialization || ''}`.toLowerCase();
  
  if (text.includes('xray') || text.includes('x-ray') || text.includes('radiography')) return <XRayIcon3D size={size} />;
  if (text.includes('ct') || text.includes('ctscan') || text.includes('computed')) return <CtScanIcon3D size={size} />;
  if (text.includes('mri') || text.includes('resonance') || text.includes('mr scan')) return <MriScanIcon3D size={size} />;
  if (text.includes('sonography') || text.includes('ultrasound') || text.includes('usg') || text.includes('doppler')) return <SonographyIcon3D size={size} />;
  if (text.includes('blood') || text.includes('patholog') || text.includes('cbc') || text.includes('lipid') || text.includes('lab') || text.includes('test')) return <BloodTestIcon3D size={size} />;
  if (text.includes('cardio') || text.includes('heart')) return <HeartIcon3D size={size} />;
  if (text.includes('neuro') || text.includes('brain')) return <BrainIcon3D size={size} />;
  if (text.includes('ortho') || text.includes('joint') || text.includes('bone')) return <ActivityIcon3D size={size} />;
  
  return <Hospital3DIcon size={size} />;
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
              id: 'srv-xray',
              title: 'Digital X-Ray (High-Resolution Radiography)',
              name: 'Digital X-Ray (High-Resolution Radiography)',
              specialization: 'Radiology',
              department: 'Radiology & Diagnostic Imaging',
              category: 'Radiology & Imaging',
              description: 'Advanced low-dose digital radiography for chest, bones, joints, spine, and abdominal diagnostics with instant high-clarity radiologist interpretation.',
              overview: 'Medora Hospital’s Radiology Department is equipped with low-dose digital radiography systems offering rapid, high-precision skeletal and pulmonary diagnosis.',
              benefits: [
                'Ultra-low radiation dosage exposure',
                'Immediate digital film preview & instant radiologist analysis',
                'Direct integration with patient portal for quick retrieval',
                'Available 24/7 for acute trauma and routine checks'
              ],
              startingPrice: 600,
              sessionPrice: 600,
              features: ['Immediate digital imaging', 'Certified radiologist report', 'Low radiation technology', 'Available 24x7'],
              icon: 'xray',
            },
            {
              id: 'srv-ct',
              title: 'CT Scan (Computed Tomography 128-Slice)',
              name: 'CT Scan (Computed Tomography 128-Slice)',
              specialization: 'Radiology',
              department: 'Radiology & Diagnostic Imaging',
              category: 'Radiology & Imaging',
              description: 'Ultra-fast sub-second multi-slice CT scanning for brain, chest, abdomen, pelvis, and angiography with 3D multi-planar reconstruction.',
              overview: 'Our 128-slice CT scanner delivers volumetric cross-sectional imaging for prompt emergency evaluation of stroke, trauma, chest anomalies, and internal pathologies.',
              benefits: [
                'High-speed scanning in seconds with minimum breath-hold',
                'Sub-millimeter slice resolution with 3D vascular reconstruction',
                'Non-ionic safe contrast administration with kidney protection check',
                'Certified senior radiologist emergency review'
              ],
              startingPrice: 2500,
              sessionPrice: 2500,
              features: ['128-Slice rapid scan', '3D Multi-planar reconstruction', 'Emergency stroke triage', 'High diagnostic accuracy'],
              icon: 'ctscan',
            },
            {
              id: 'srv-mri',
              title: 'MRI Scan (Magnetic Resonance 1.5 Tesla)',
              name: 'MRI Scan (Magnetic Resonance 1.5 Tesla)',
              specialization: 'Radiology',
              department: 'Radiology & Diagnostic Imaging',
              category: 'Radiology & Imaging',
              description: 'High-field 1.5 Tesla silent MRI scanning for brain, neuro-spine, joints, musculoskeletal conditions, and soft tissue diagnostics without radiation.',
              overview: 'Experience silent, comfortable, radiation-free neuro and musculoskeletal imaging with Medora Hospital’s high-field Magnetic Resonance system.',
              benefits: [
                'Zero ionizing radiation exposure',
                'Superior soft-tissue contrast for brain, spine, ligaments, and joints',
                'Acoustic noise reduction technology for enhanced patient comfort',
                'Comprehensive sub-specialty neuro & musculoskeletal reporting'
              ],
              startingPrice: 4000,
              sessionPrice: 4000,
              features: ['Silent scan technology', 'Zero radiation exposure', 'High-definition soft tissue', 'Expert neuro-radiology review'],
              icon: 'mriscan',
            },
            {
              id: 'srv-usg',
              title: 'Ultrasound Sonography (USG & 4D Color Doppler)',
              name: 'Ultrasound Sonography (USG & 4D Color Doppler)',
              specialization: 'Radiology',
              department: 'Radiology & Diagnostic Imaging',
              category: 'Radiology & Imaging',
              description: 'Safe acoustic sound wave imaging for whole abdomen, pelvis, KUB, thyroid, musculoskeletal, and vascular color Doppler assessments.',
              overview: 'Our advanced ultrasound suite delivers high-frequency real-time imaging for abdominal organs, maternal wellness, thyroid profiling, and vascular blood flow.',
              benefits: [
                'Completely safe, non-invasive acoustic sound wave diagnostic',
                'High-resolution color Doppler for arterial & venous blood flow',
                'Immediate bedside printout and digital video recording',
                'Comfortable examination conducted by experienced sonologists'
              ],
              startingPrice: 1200,
              sessionPrice: 1200,
              features: ['Color Doppler imaging', 'Non-invasive & radiation free', 'Immediate digital report', 'Conducted by certified MD sonologist'],
              icon: 'sonography',
            },
            {
              id: 'srv-blood',
              title: 'Comprehensive Blood Tests & Pathology Panel',
              name: 'Comprehensive Blood Tests & Pathology Panel',
              specialization: 'Pathology',
              department: 'Pathology & Diagnostic Laboratory',
              category: 'Pathology & Lab Tests',
              description: 'NABL-accredited automated pathology tests including Complete Blood Count (CBC), Lipid Profile, Liver (LFT), Kidney (KFT), Thyroid (T3/T4/TSH), and HbA1c.',
              overview: 'Medora Hospital’s fully automated pathology laboratory processes blood samples using barcode verification to ensure verified results delivered within 12 hours.',
              benefits: [
                'NABL accredited automated robotic sample analyzers',
                'Complete metabolic health audit (CBC, LFT, KFT, Lipids, Blood Sugar)',
                'Digital pathology report delivered to patient portal in 12 hours',
                'Complimentary consulting doctor interpretation support'
              ],
              startingPrice: 800,
              sessionPrice: 800,
              features: ['Automated barcode processing', 'Report ready in 12 hours', 'Home collection available', 'Consulting physician review'],
              icon: 'bloodtest',
            },
          ]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const categories = ['ALL', 'Radiology & Imaging', 'Pathology & Lab Tests'];

  const filteredServices = services.filter((srv) => {
    const title = srv.title || srv.name || '';
    const desc = srv.description || srv.overview || '';
    const dept = srv.department || srv.specialization || '';
    const matchesCat = selectedCategory === 'ALL' ||
      srv.category === selectedCategory ||
      (selectedCategory === 'Radiology & Imaging' && (dept.includes('Radiology') || srv.specialization === 'Radiology')) ||
      (selectedCategory === 'Pathology & Lab Tests' && (dept.includes('Pathology') || srv.specialization === 'Pathology'));
    
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
          <span>✦ Medora Diagnostic & Radiology Suites</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 12 }}>
          Hospital Diagnostic & Imaging Services
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
          Schedule high-precision Digital X-Ray, 128-Slice CT Scan, 1.5 Tesla MRI, 4D Ultrasound Sonography, and Comprehensive Diagnostic Blood Tests with immediate digital reporting in Indian Rupees (₹).
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
            placeholder="Search diagnostic services (X-Ray, CT Scan, MRI, Sonography, Blood Tests)..."
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
          Loading diagnostic services...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            No matching diagnostic services found
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 16 }}>
            Try searching for X-Ray, CT Scan, MRI, Sonography, or Blood Tests.
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
            const title = srv.title || srv.name || 'Diagnostic Service';
            const price = srv.startingPrice || srv.sessionPrice || srv.price || 600;
            const dept = srv.department || 'Radiology & Diagnostic Imaging';

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
                      {getService3DIcon(srv, 56)}
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
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>FEE / TEST</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D9488' }}>
                      ₹{price}
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
                      <span>Book Service</span>
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
              {getService3DIcon(selectedServiceForDetail, 68)}
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
                  {selectedServiceForDetail.department || 'Hospital Diagnostic Facility'}
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                  {selectedServiceForDetail.title || selectedServiceForDetail.name}
                </h2>
              </div>
            </div>

            {/* Clinical Overview */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                Clinical Diagnostic Scope & Technology
              </h4>
              <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6 }}>
                {selectedServiceForDetail.overview || selectedServiceForDetail.description}
              </p>
            </div>

            {/* Clinical Benefits Grid */}
            {selectedServiceForDetail.benefits && selectedServiceForDetail.benefits.length > 0 && (
              <div style={{ marginBottom: 24, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                  Key Diagnostic Inclusions & Patient Safeguards
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

            {/* Pricing & Facility Info */}
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
                  HOSPITAL SERVICE FEE
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D9488' }}>
                  ₹{selectedServiceForDetail.startingPrice || selectedServiceForDetail.sessionPrice || selectedServiceForDetail.price || 600}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0F766E', marginTop: 2 }}>
                  ✦ Includes digital film preview and certified radiologist/pathologist report
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Diagnostic Center</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  Medora Hospital, Saket Campus
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 600 }}>
                  Wing B, Radiology & Pathology Block
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedServiceForDetail(null)}
                className="btn btn-outline"
                style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}
              >
                Close
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
            Have a prescription from your doctor?
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#99F6E4', lineHeight: 1.5 }}>
            Book your X-Ray, CT Scan, MRI Scan, Ultrasound, or Blood Test slot online with priority access and zero waiting line.
          </p>
        </div>
        <button
          onClick={() => handleOpenBooking(null)}
          className="btn"
          style={{
            backgroundColor: '#2DD4BF',
            color: '#042F2E',
            fontWeight: 800,
            padding: '12px 28px',
            borderRadius: 12,
          }}
        >
          Book An Appointment Now
        </button>
      </div>
    </div>
  );
}
