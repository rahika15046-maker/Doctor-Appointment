import React from 'react';
import {
  StethoscopeIcon,
  ActivityIcon,
  ShieldCheckIcon,
  VideoIcon,
  HeartIcon,
  ArrowRightIcon,
} from './Icons';
import {
  HeartIcon3D,
  BrainIcon3D,
  SparklesIcon3D,
  StethoscopeIcon3D,
  Hospital3DIcon,
} from './Icons3D';

export default function ServicesSection({ onSelectService, onViewAll }) {
  const services = [
    {
      id: 'cardiology',
      title: 'Cardiology Care',
      desc: 'ECG, 2D echo triage, hypertension clinic, and cardiac wellness.',
      icon: <HeartIcon3D size={48} />,
      price: 1200,
      specialization: 'Cardiology',
    },
    {
      id: 'dermatology',
      title: 'Dermatology Suite',
      desc: 'Clinical skin therapy, acne protocols, dermato-surgery, and allergies.',
      icon: <SparklesIcon3D size={48} />,
      price: 900,
      specialization: 'Dermatology',
    },
    {
      id: 'neurology',
      title: 'Neurology Sciences',
      desc: 'Specialized headache clinic, neuropathy, cognitive assessment & stroke triage.',
      icon: <BrainIcon3D size={48} />,
      price: 1500,
      specialization: 'Neurology',
    },
    {
      id: 'general',
      title: 'General Medicine',
      desc: 'Primary health reviews, fever clinics, lifestyle syndromes & prevention.',
      icon: <StethoscopeIcon3D size={48} />,
      price: 600,
      specialization: 'General Medicine',
    },
    {
      id: 'diagnostics',
      title: 'Diagnostics Lab',
      desc: 'NABL automated blood profiling, metabolic panels & digital imaging.',
      icon: <Hospital3DIcon size={48} />,
      price: 500,
      specialization: 'Diagnostics and Laboratory',
    },
  ];

  return (
    <section style={{
      maxWidth: 1280,
      margin: '0 auto',
      padding: '48px 24px 64px',
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
            <span>CLINICAL DEPARTMENTS & CARE</span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}>
            Medora Hospital Services
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#64748B',
          }}>
            Explore our specialized clinical departments and outpatient healthcare programs
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
          <span>All Hospital Services</span>
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {services.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectService && onSelectService(item)}
            className="card-3d"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: '24px 20px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ marginBottom: 16 }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, marginBottom: 16 }}>
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
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D9488' }}>
                From ₹{item.price}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
