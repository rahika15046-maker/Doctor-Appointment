import React, { useState } from 'react';
import {
  XIcon,
  StarIcon,
  HeartIcon,
  BadgeCheckIcon,
  HospitalIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
} from './Icons';

export default function DoctorProfileModal({
  doctor,
  isOpen,
  onClose,
  onBookAppointment,
}) {
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'experience' | 'reviews' | 'availability'
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!isOpen || !doctor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}>
        {/* Top Header Card (matching screenshot) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '28px 28px 20px 28px',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <XIcon size={18} />
          </button>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <img
              src={doctor.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
              alt={doctor.name}
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #CCFBF1',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  {doctor.name}
                </h2>
                <BadgeCheckIcon size={19} />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 6 }}>
                {doctor.qualification || 'MBBS, MD'} - {doctor.specialization}
              </div>

              {/* Rating and Experience row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontWeight: 700 }}>
                  <StarIcon size={15} />
                  <span>{doctor.averageRating || 4.8} ({doctor.reviewsCount || '2,164'} reviews)</span>
                </div>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <span style={{ color: '#475569', fontWeight: 600 }}>
                  {doctor.experience || 15}+ Years Experience
                </span>
              </div>
            </div>
          </div>

          {/* Session Fee Structure in Indian Rupees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginTop: 18,
            backgroundColor: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #CCFBF1',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
            }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                First Visit Session
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  ₹{doctor.firstVisitFee || doctor.consultationFee || 1000}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/session</span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid #A7F3D0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Follow-up Session
                </span>
                <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 6 }}>
                  Save 35%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                  ₹{doctor.followupFee || Math.round((doctor.firstVisitFee || 1000) * 0.65)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/session</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Book Appointment & Wishlist */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              onClick={() => {
                onClose();
                onBookAppointment(doctor);
              }}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px 20px', fontSize: '0.92rem' }}
            >
              Book Appointment
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                fontSize: '0.88rem',
              }}
            >
              <HeartIcon size={17} filled={isWishlisted} />
              <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (About, Experience, Reviews, Availability) */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          padding: '0 24px',
        }}>
          {[
            { id: 'about', label: 'About' },
            { id: 'experience', label: 'Experience' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'availability', label: 'Availability' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '14px 16px',
                fontSize: '0.9rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#0D9488' : '#64748B',
                borderBottom: activeTab === tab.id ? '2.5px solid #0D9488' : 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ padding: '24px 28px', maxHeight: 320, overflowY: 'auto' }}>
          {activeTab === 'about' && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                About Doctor
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: 18 }}>
                {doctor.about || `${doctor.name} is a renowned ${doctor.specialization} with over ${doctor.experience || 15} years of clinical practice in diagnosing and treating complex medical disorders. Dedicated to patient-centric, evidence-based care.`}
              </p>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                Hospital Affiliation
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', fontSize: '0.9rem' }}>
                <HospitalIcon size={18} />
                <span>Medora Hospital</span>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>{doctor.designation || 'Senior Consultant Specialist'}</div>
                <div style={{ fontSize: '0.82rem', color: '#0D9488' }}>Medora Hospital • Full-Time Faculty</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Leading department clinical teams, inpatient rounds, and outpatient consultations.</div>
              </div>

              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>Clinical Residency & Fellowships</div>
                <div style={{ fontSize: '0.82rem', color: '#0D9488' }}>Premier Medical Institutions • Advanced Clinical Training</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Specialized in acute and preventive diagnostics and clinical procedures.</div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Rohan Mehra', rating: 5, date: '2 weeks ago', text: 'Dr. Johnson was extremely attentive, explained my cardiac ECG in detail, and made me feel completely at ease.' },
                { name: 'Ananya Roy', rating: 5, date: '1 month ago', text: 'Prompt, kind, and knowledgeable. Booking through Medora was super fast.' },
              ].map((rev, i) => (
                <div key={i} style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{rev.name}</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{rev.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <StarIcon key={idx} size={13} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>{rev.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'availability' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CalendarIcon size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Working Days: Monday – Saturday</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ClockIcon size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Clinic Hours: 09:00 AM – 06:00 PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheckIcon size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Consultation Modes: In-Person & Online Video</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
