import React from 'react';
import { CheckCircleIcon, ShieldCheckIcon } from './Icons';

export default function WhyChooseUs({ onGetStarted }) {
  const perks = [
    'Verified Doctors with credentials vetted by medical boards',
    'Easy 1-Minute Booking with real-time slot synchronization',
    'Secure Digital Health Records with end-to-end privacy',
    'Patient-First Experience & dedicated 24/7 care coordination',
  ];

  return (
    <section style={{
      maxWidth: 1280,
      margin: '0 auto 64px auto',
      padding: '0 24px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #042F2E 0%, #0F766E 60%, #14B8A6 100%)',
        borderRadius: 24,
        padding: '48px',
        color: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 40,
        alignItems: 'center',
        boxShadow: '0 20px 40px -10px rgba(15, 118, 110, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }} />

        {/* Left Column */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 16,
          }}>
            <ShieldCheckIcon size={16} />
            <span>Medora Quality Promise</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            marginBottom: 24,
          }}>
            Why Choose Medora?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {perks.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  color: '#5EEAD4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircleIcon size={20} />
                </div>
                <span style={{ fontSize: '0.98rem', fontWeight: 500, color: '#F0FDFA' }}>
                  {p}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onGetStarted}
            className="btn"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F766E',
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            Get Started Now
          </button>
        </div>

        {/* Right Column: High Quality Medical Team Image */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=700"
            alt="Healthcare professionals"
            style={{
              width: '100%',
              maxHeight: 340,
              objectFit: 'cover',
              borderRadius: 20,
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
