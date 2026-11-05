import React, { useState } from 'react';
import { MedoraCross, BellIcon, UserIcon, LogOutIcon, CalendarIcon } from './Icons';

export default function Navbar({
  user,
  currentView,
  onNavigate,
  onOpenAuth,
  onLogout,
  unreadNotificationsCount = 0,
  onOpenNotifications,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <MedoraCross size={32} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.42rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              color: '#0F766E',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              lineHeight: 1.1,
            }}>
              MEDORA
            </span>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              color: '#0D9488',
              letterSpacing: '1.2px',
            }}>
              HOSPITAL
            </span>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: 28,
        }} className="desktop-nav">
          {[
            { id: 'home', label: 'Home' },
            { id: 'about', label: 'About Us' },
            { id: 'services', label: 'Services' },
            { id: 'our-doctors', label: 'Our Doctors' },
            { id: 'booking', label: 'Book Appointment' },
            ...(user ? [{ id: 'appointments', label: 'My Appointments' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.92rem',
                fontWeight: currentView === item.id ? 700 : 500,
                color: currentView === item.id ? '#0D9488' : '#334155',
                cursor: 'pointer',
                padding: '6px 0',
                position: 'relative',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
              {currentView === item.id && (
                <span style={{
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 2.5,
                  borderRadius: 2,
                  backgroundColor: '#0D9488',
                }} />
              )}
            </button>
          ))}
        </nav>

        {/* Actions / User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                style={{
                  position: 'relative',
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
                title="Notifications"
              >
                <BellIcon size={20} />
                {unreadNotificationsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 2px #FFFFFF'
                  }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Patient Dashboard Button */}
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn btn-outline btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CalendarIcon size={16} />
                <span>Dashboard</span>
              </button>

              {/* User Avatar & Name */}
              <div
                onClick={() => onNavigate('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px 4px 4px',
                  borderRadius: 9999,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'}
                  alt={user.name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Log out"
              >
                <LogOutIcon size={19} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => onOpenAuth('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F766E',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: 9999,
                }}
              >
                Login
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary"
                style={{ fontSize: '0.92rem', padding: '9px 20px' }}
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
            }}
            className="mobile-hamburger"
          >
            <div style={{ width: 22, height: 2, background: '#1E293B', marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: '#1E293B', marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: '#1E293B' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'about', label: 'About Us' },
            { id: 'services', label: 'Services' },
            { id: 'our-doctors', label: 'Our Doctors' },
            { id: 'booking', label: 'Book Appointment' },
            ...(user ? [{ id: 'appointments', label: 'My Appointments' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: currentView === item.id ? 700 : 500,
                color: currentView === item.id ? '#0D9488' : '#334155',
                padding: '8px 0',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 768px) {
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
