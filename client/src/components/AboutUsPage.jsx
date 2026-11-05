import React from 'react';
import {
  MedoraCross,
  CheckCircleIcon,
  ShieldCheckIcon,
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
} from './Icons';
import {
  Hospital3DIcon,
  Shield3DIcon,
  SparklesIcon3D,
  Clock3DIcon,
} from './Icons3D';

export default function AboutUsPage({ onFindDoctors, onBookAppointment }) {
  const stats = [
    { value: '50,000+', label: 'Successful Consultations', desc: 'Across outpatient clinics & video consultations' },
    { value: '25+', label: 'Specialized Departments', desc: 'Cardiology, Neurology, Orthopedics, Pediatrics & more' },
    { value: '450+', label: 'Bed Capacity', desc: 'State-of-the-art ICU, surgical suites & emergency care' },
    { value: '98.8%', label: 'Patient Satisfaction', desc: 'Based on genuine post-care patient reviews' },
  ];

  const pillars = [
    {
      title: 'Comprehensive Hospital Services',
      desc: 'Medora Hospital provides cutting-edge inpatient, outpatient, and diagnostic departments equipped with modern medical technologies and expert clinical staff.',
      icon: <Hospital3DIcon size={56} />,
    },
    {
      title: 'Atomic Double-Booking Prevention',
      desc: 'Our proprietary hospital concurrency lock enforces database-level slot reservations. If two patients attempt to book the same slot simultaneously, conflicts are caught cleanly with HTTP 409.',
      icon: <Shield3DIcon size={56} />,
    },
    {
      title: 'Transparent ₹ Session Pricing',
      desc: 'Say goodbye to ambiguous medical bills. Medora Hospital offers flat, predictable session fees in Indian Rupees with automatic discounts on follow-up consultations.',
      icon: <SparklesIcon3D size={56} />,
    },
    {
      title: 'Integrated Health Records & Reports',
      desc: 'Seamlessly upload blood panels, MRI scans, and prescriptions. Your consulting doctor receives direct access before your session begins.',
      icon: <Clock3DIcon size={56} />,
    },
  ];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        maxWidth: 780,
        margin: '0 auto 60px',
      }}>
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
          marginBottom: 16,
          border: '1px solid #CCFBF1',
        }}>
          <MedoraCross size={18} />
          <span>Dedicated to Clinical Excellence at Medora Hospital</span>
        </div>
        <h1 style={{
          fontSize: '2.75rem',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          marginBottom: 18,
        }}>
          Leading Multi-Specialty Hospital Dedicated to Patient-First Healthcare
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748B', lineHeight: 1.6 }}>
          Medora Hospital was founded on a simple promise: healthcare should be compassionate, technologically advanced, and clinically excellent. From comprehensive outpatient consultations to cutting-edge inpatient procedures, our board-certified medical staff delivers world-class care under one roof.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 64,
      }}>
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="card-3d"
            style={{
              padding: '28px 24px',
              textAlign: 'center',
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0D9488', marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Core Architectural Pillars */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
            Built With Modern Healthcare Standards
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#64748B' }}>
            Engineered from the ground up for maximum clinical reliability, speed, and patient trust.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {pillars.map((pil, idx) => (
            <div
              key={idx}
              className="card-3d"
              style={{
                padding: '28px',
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div>{pil.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                {pil.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                {pil.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* City Hubs Banner */}
      <div style={{
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: '36px',
        border: '1px solid #E2E8F0',
        marginBottom: 60,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
              Available in Leading Indian Metropolitan Regions
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
              Book in-person clinic appointments or consultations across major hubs:
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'].map((city) => (
              <span
                key={city}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F766E',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                📍 {city}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        borderRadius: 24,
        background: 'linear-gradient(135deg, #0F766E 0%, #042F2E 100%)',
        color: '#FFFFFF',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
          Ready to experience hassle-free healthcare?
        </h2>
        <p style={{ fontSize: '1rem', color: '#CCFBF1', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.5 }}>
          Search for certified doctors in your city, check real-time available slots, and confirm your visit in under two minutes.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => onFindDoctors && onFindDoctors()}
            className="btn"
            style={{
              backgroundColor: '#2DD4BF',
              color: '#042F2E',
              fontWeight: 800,
              padding: '12px 30px',
              fontSize: '0.95rem',
            }}
          >
            Find Doctors Near You
          </button>
          <button
            onClick={() => onBookAppointment && onBookAppointment()}
            className="btn btn-outline"
            style={{
              borderColor: '#2DD4BF',
              color: '#FFFFFF',
              fontWeight: 700,
              padding: '12px 28px',
            }}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
