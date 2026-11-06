import React from 'react';
import {
  ArrowRightIcon,
} from './Icons';
import {
  XRayIcon3D,
  CtScanIcon3D,
  MriScanIcon3D,
  SonographyIcon3D,
  BloodTestIcon3D,
} from './Icons3D';

export default function ServicesSection({ onSelectService, onViewAll }) {
  const diagnosticServices = [
    {
      id: 'xray',
      title: 'Digital X-Ray',
      desc: 'High-clarity skeletal & chest radiography with instant digital radiologist analysis.',
      icon: <XRayIcon3D size={52} />,
      price: 600,
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
    },
    {
      id: 'ct-scan',
      title: 'CT Scan (128-Slice)',
      desc: 'High-speed volumetric scanning for brain, trauma, chest, and 3D angiography.',
      icon: <CtScanIcon3D size={52} />,
      price: 2500,
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
    },
    {
      id: 'mri-scan',
      title: 'MRI Scan (1.5 Tesla)',
      desc: 'Radiation-free silent neuro, spine, and joint soft-tissue magnetic resonance imaging.',
      icon: <MriScanIcon3D size={52} />,
      price: 4000,
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
    },
    {
      id: 'sonography',
      title: 'Ultrasound Sonography',
      desc: 'Real-time color Doppler, abdominal, pelvic, and obstetrics ultrasound imaging.',
      icon: <SonographyIcon3D size={52} />,
      price: 1200,
      specialization: 'Radiology',
      department: 'Radiology & Diagnostic Imaging',
    },
    {
      id: 'blood-tests',
      title: 'Diagnostic Blood Tests',
      desc: 'Automated CBC, Lipid Profile, Liver & Kidney Panels, Thyroid, and HbA1c in 12 hours.',
      icon: <BloodTestIcon3D size={52} />,
      price: 800,
      specialization: 'Pathology',
      department: 'Pathology & Diagnostic Laboratory',
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
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0D9488', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
            <span>DIAGNOSTIC & CLINICAL SERVICES</span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}>
            Hospital Diagnostic & Imaging Services
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#64748B',
          }}>
            State-of-the-art radiology, advanced scanner suites, and NABL automated pathology laboratory
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
        {diagnosticServices.map((item) => (
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
              <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
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
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0D9488' }}>
                ₹{item.price}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#0D9488', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Book Service</span>
                <ArrowRightIcon size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
