import React from 'react';
import { SearchIcon, CalendarIcon, CheckCircleIcon, VideoIcon } from './Icons';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Search Doctor',
      desc: 'Discover verified specialists by medical field or clinic location.',
      icon: SearchIcon,
    },
    {
      num: 2,
      title: 'Select Appointment',
      desc: 'Pick your preferred date, convenient time slot, and consultation type.',
      icon: CalendarIcon,
    },
    {
      num: 3,
      title: 'Confirm Booking',
      desc: 'Review doctor details, reason for visit, and lock your slot instantly.',
      icon: CheckCircleIcon,
    },
    {
      num: 4,
      title: 'Consult Doctor',
      desc: 'Visit in-person or connect via high-definition video telemedicine.',
      icon: VideoIcon,
    },
  ];

  return (
    <section style={{
      backgroundColor: '#F8FAFC',
      borderTop: '1px solid #E2E8F0',
      borderBottom: '1px solid #E2E8F0',
      padding: '64px 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.5px',
            marginBottom: 8,
          }}>
            How It Works
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B' }}>
            Simple steps to better healthcare
          </p>
        </div>

        {/* Steps Pipeline */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 28,
          position: 'relative',
        }}>
          {steps.map((s) => {
            const IconComp = s.icon;
            return (
              <div
                key={s.num}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: '32px 24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {/* Step badge */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)',
                }}>
                  {s.num}
                </div>

                {/* Icon */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: '#CCFBF1',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <IconComp size={28} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                  {s.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
