import React from 'react';
import { StarIcon, ArrowRightIcon, BadgeCheckIcon } from './Icons';

export default function FeaturedDoctors({ doctors = [], onBookDoctor, onSelectDoctor, onViewAll }) {
  return (
    <section style={{
      maxWidth: 1280,
      margin: '0 auto',
      padding: '24px 24px 64px 24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0D9488', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
            <span>MEDORA HOSPITAL MEDICAL TEAM</span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}>
            Our Senior Specialists
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#64748B',
          }}>
            Dedicated department heads and consultants practicing exclusively at Medora Hospital
          </p>
        </div>

        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#0D9488',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>View All</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {/* Grid of 3D Doctor Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: 26,
      }}>
        {doctors.slice(0, 4).map((doc) => {
          const firstFee = doc.firstVisitFee || doc.consultationFee || 1000;
          const followFee = doc.followupFee || Math.round(firstFee * 0.65);

          return (
            <div
              key={doc._id || doc.id}
              className="card-3d"
              style={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image Container */}
              <div
                onClick={() => onSelectDoctor(doc)}
                style={{
                  height: 220,
                  width: '100%',
                  backgroundColor: '#F1F5F9',
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
                  alt={doc.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.35s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                
                {/* 3D Glass Rating Pill */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 9999,
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                }}>
                  <StarIcon size={14} />
                  <span>{doc.averageRating || 4.8}</span>
                </div>

                {/* Consultation Modes Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 14,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}>
                  In-Person & Online Video
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <h3
                    onClick={() => onSelectDoctor(doc)}
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      cursor: 'pointer',
                    }}
                  >
                    {doc.name}
                  </h3>
                  <BadgeCheckIcon size={18} />
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D9488', marginBottom: 4 }}>
                  {doc.specialization}
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: 14 }}>
                  {doc.qualification || 'MBBS, MD'} • {doc.experience || 12}+ yrs exp
                </div>

                {/* Pricing in Indian Rupees (₹) */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 12,
                  padding: '10px 14px',
                  marginBottom: 18,
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>First Visit:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                      ₹{firstFee}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}> /session</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Follow-up Visit:</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#059669' }}>
                      ₹{followFee}
                      <span style={{ fontSize: '0.72rem', fontWeight: 500 }}> /session</span>
                    </span>
                  </div>
                </div>

                {/* Book Action */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '10px 14px' }}
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
