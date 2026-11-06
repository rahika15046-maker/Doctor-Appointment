import React from 'react';
import {
  HeartIcon3D,
  StethoscopeIcon3D,
  ActivityIcon3D,
  BabyIcon3D,
} from './Icons3D';
import { ArrowRightIcon } from './Icons';

export default function Specializations({ specializations = [], selectedSpec, onSelectSpec, onViewAll }) {
  const defaultSpecs = [
    {
      id: 'general-medicine',
      name: 'General Medicine',
      desc: 'Primary health consultations, fever clinic & preventive wellness',
      icon: <StethoscopeIcon3D size={56} />,
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      desc: 'Heart care, hypertension, ECG & cardiovascular wellness',
      icon: <HeartIcon3D size={56} />,
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      desc: 'Bones, joints, sports trauma & fracture management',
      icon: <ActivityIcon3D size={56} />,
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      desc: 'Infant care, child development & cold-chain immunization',
      icon: <BabyIcon3D size={56} />,
    },
  ];

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
        flexWrap: 'wrap',
        gap: 16,
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
            <span>✨ Medora Clinical Specializations</span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}>
            Our Clinical Departments
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#64748B',
          }}>
            Dedicated in-house hospital medical departments with senior board-certified specialists
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
          <span>Meet Our Doctors</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {/* Grid of 4 Core Clinical Specializations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 24,
      }}>
        {defaultSpecs.map((item) => {
          const isSelected = selectedSpec === item.name;
          return (
            <div
              key={item.id}
              onClick={() => onSelectSpec && onSelectSpec(item.name)}
              className="card-3d"
              style={{
                backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                borderRadius: 22,
                padding: '28px 24px',
                border: isSelected ? '2px solid #0D9488' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 12px 28px -6px rgba(13, 148, 136, 0.25)' : 'none',
              }}
            >
              <div>
                <div style={{ marginBottom: 18 }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: isSelected ? '#0D9488' : '#0F172A',
                  marginBottom: 8,
                }}>
                  {item.name}
                </h3>
                <p style={{
                  fontSize: '0.86rem',
                  color: '#64748B',
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}>
                  {item.desc}
                </p>
              </div>

              <div style={{
                paddingTop: 12,
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0D9488' }}>
                  Consult Specialist
                </span>
                <span style={{ fontSize: '0.82rem', color: '#0D9488' }}>
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
