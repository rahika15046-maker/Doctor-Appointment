import React, { useState } from 'react';
import { SearchIcon, ArrowRightIcon, ActivityIcon, ShieldCheckIcon, StarIcon } from './Icons';

export default function Hero({ onFindDoctor, onBookNow, onSearch }) {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchInput);
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #F0FDFA 0%, #FFFFFF 100%)',
      padding: '48px 24px 64px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 48,
        alignItems: 'center',
      }}>
        {/* Left Column: Text & CTA */}
        <div>
          {/* Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#CCFBF1',
            color: '#0F766E',
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 20,
          }}>
            <ShieldCheckIcon size={16} />
            <span>Medora Hospital • Premier Multi-Specialty Care</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#0F172A',
            letterSpacing: '-1px',
            marginBottom: 18,
          }}>
            Your Health,<br />
            <span style={{ color: '#0D9488' }}>Our Priority.</span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '1.15rem',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: 480,
            marginBottom: 32,
          }}>
            Consult with board-certified department heads and medical specialists at Medora Hospital. Explore hospital services, check availability, and schedule your appointment effortlessly.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 40,
          }}>
            <button
              onClick={onFindDoctor}
              className="btn btn-primary"
              style={{ padding: '14px 26px', fontSize: '0.98rem' }}
            >
              <span>Our Doctors</span>
              <ArrowRightIcon size={18} />
            </button>

            <button
              onClick={onBookNow}
              className="btn btn-outline"
              style={{ padding: '14px 26px', fontSize: '0.98rem' }}
            >
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 9999,
              padding: '6px 8px 6px 20px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              border: '1.5px solid #CCFBF1',
              maxWidth: 520,
            }}
          >
            <SearchIcon size={20} className="" style={{ color: '#0D9488', marginRight: 10 }} />
            <input
              type="text"
              placeholder="Search Medora hospital services, departments, or doctors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: '#1E293B',
                fontFamily: 'inherit',
                background: 'transparent',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ padding: '10px 20px' }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Right Column: Hero Doctor Visual */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Big Teal Circular Backdrop */}
          <div style={{
            width: 'clamp(280px, 40vw, 440px)',
            height: 'clamp(280px, 40vw, 440px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #99F6E4 0%, #2DD4BF 50%, #0D9488 100%)',
            position: 'absolute',
            zIndex: 1,
            opacity: 0.85,
            filter: 'blur(1px)',
          }} />

          {/* Doctor Image */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: 'clamp(280px, 38vw, 420px)',
            height: 'clamp(320px, 44vw, 480px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=700"
              alt="Medora Doctor"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '30px',
                boxShadow: '0 25px 50px -12px rgba(15, 118, 110, 0.25)',
              }}
            />
          </div>

          {/* Floating Badge 1: Heart Rate / ECG */}
          <div style={{
            position: 'absolute',
            top: '12%',
            right: '-10px',
            background: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: 16,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 3,
            border: '1px solid #E2E8F0',
          }}>
            <div style={{
              background: '#CCFBF1',
              color: '#0D9488',
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ActivityIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Verified Care</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>Top Specialists</div>
            </div>
          </div>

          {/* Floating Badge 2: Rating */}
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '-10px',
            background: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: 16,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 3,
            border: '1px solid #E2E8F0',
          }}>
            <div style={{
              background: '#FEF3C7',
              color: '#F59E0B',
              width: 38,
              height: 38,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <StarIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>4.9 / 5.0</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Over 10,000+ Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
