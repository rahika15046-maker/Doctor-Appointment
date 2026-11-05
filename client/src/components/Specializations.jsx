import React from 'react';
import { SPECIALTY_3D_MAP, StethoscopeIcon3D } from './Icons3D';
import { ArrowRightIcon } from './Icons';

export default function Specializations({ specializations = [], selectedSpec, onSelectSpec, onViewAll }) {
  const defaultSpecs = [
    { id: 'cardiology', name: 'Cardiology', desc: 'Heart & Vascular' },
    { id: 'dermatology', name: 'Dermatology', desc: 'Skin & Aesthetics' },
    { id: 'neurology', name: 'Neurology', desc: 'Brain & Nerves' },
    { id: 'pediatrics', name: 'Pediatrics', desc: 'Child Healthcare' },
    { id: 'gynecology', name: 'Gynecology', desc: "Women's Health" },
    { id: 'dentistry', name: 'Dentistry', desc: 'Dental & Smile' },
    { id: 'general-medicine', name: 'General Medicine', desc: 'Family Medicine' },
    { id: 'orthopedics', name: 'Orthopedics', desc: 'Bone & Joints' },
  ];

  const items = specializations.length > 0 ? specializations : defaultSpecs;

  return (
    <section style={{
      maxWidth: 1280,
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#0D9488',
            marginBottom: 6,
          }}>
            <span>✨ 3D Specialty Explorer</span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}>
            Our Specializations
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#64748B',
          }}>
            Expert clinical consultations across leading medical disciplines
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

      {/* 3D Specialization Tiles Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))',
        gap: 18,
      }}>
        {items.map((spec) => {
          const Icon3D = SPECIALTY_3D_MAP[spec.id] || StethoscopeIcon3D;
          const isSelected = selectedSpec === spec.name;

          return (
            <div
              key={spec.id || spec.name}
              onClick={() => onSelectSpec(spec.name)}
              className={`specialty-tile-3d ${isSelected ? 'active' : ''}`}
            >
              <Icon3D size={56} />
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: isSelected ? '#0F766E' : '#1E293B',
                  marginBottom: 2,
                }}>
                  {spec.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>
                  {spec.desc || 'Specialists'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
