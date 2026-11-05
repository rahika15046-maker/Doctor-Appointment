import React from 'react';
import { MedoraCross, PhoneIcon, MailIcon, MapPinIcon } from './Icons';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      backgroundColor: '#042F2E',
      color: '#E2E8F0',
      padding: '64px 24px 32px 24px',
      borderTop: '1px solid #0F766E',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 40,
        marginBottom: 48,
      }}>
        {/* Brand Column */}
        <div style={{ maxWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MedoraCross size={30} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
              MEDORA
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: 16 }}>
            Better Healthcare Begins With One Appointment. Connecting patients with premier clinical specialists effortlessly.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 18 }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
            {['Home', 'Find Doctors', 'Services', 'About Us', 'Contact'].map((name) => (
              <li key={name}>
                <button
                  onClick={() => onNavigate && onNavigate(name.toLowerCase().replace(' ', '-'))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5EEAD4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 18 }}>
            Specialties
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
            {['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'].map((name) => (
              <li key={name}>
                <button
                  onClick={() => onNavigate && onNavigate('find-doctors', name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5EEAD4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 18 }}>
            Contact Us
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PhoneIcon size={16} />
              <span>+91 98765 43210</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MailIcon size={16} />
              <span>support@medora.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <MapPinIcon size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>123 Healthcare Ave, Connaught Place, New Delhi, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        paddingTop: 24,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        color: '#64748B',
        gap: 12,
      }}>
        <span>© 2026 Medora Healthcare Inc. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span>•</span>
          <span style={{ cursor: 'pointer' }}>Terms & Conditions</span>
        </div>
      </div>
    </footer>
  );
}
