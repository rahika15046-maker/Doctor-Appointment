import React, { useState, useEffect } from 'react';
import {
  StethoscopeIcon,
  ActivityIcon,
  ShieldCheckIcon,
  VideoIcon,
  HeartIcon,
  ArrowRightIcon,
  SearchIcon,
  ClockIcon,
  CheckCircleIcon,
} from './Icons';
import {
  HeartIcon3D,
  SparklesIcon3D,
  BrainIcon3D,
  StethoscopeIcon3D,
  Hospital3DIcon,
  Video3DIcon,
  Shield3DIcon,
} from './Icons3D';
import api from '../services/api';

export default function ServicesPage({ onBookAppointment, onFindDoctor }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    api.getServices()
      .then((res) => {
        if (mounted) setServices(res.data || []);
      })
      .catch((err) => {
        console.warn('Failed to fetch services, using fallbacks:', err);
        if (mounted) {
          setServices([
            {
              id: 'srv-1',
              name: 'General OPD & Physician Consultation',
              category: 'General Care',
              description: 'Comprehensive physical examination, primary diagnosis, chronic disease management, and prescription guidance.',
              sessionPrice: 800,
              features: ['Complete clinical physical assessment', 'Digital prescription & summary', 'Follow-up query support'],
              icon: 'stethoscope',
            },
            {
              id: 'srv-2',
              name: 'Cardiology & Heart Wellness Check',
              category: 'Specialized Care',
              description: 'Advanced ECG interpretation, blood pressure profiling, lipid analysis, and preventive cardiology protocols.',
              sessionPrice: 1200,
              features: ['12-lead digital ECG review', 'Cardiovascular risk stratification', 'Lifestyle & dietary planning'],
              icon: 'heart',
            },
            {
              id: 'srv-3',
              name: 'Clinical Diagnostics & Pathology',
              category: 'Diagnostics',
              description: 'NABL-accredited diagnostic tests including complete blood counts, metabolic panels, thyroid, and organ profiles.',
              sessionPrice: 1500,
              features: ['Home sample collection available', 'Digital report delivery within 24 hours', 'Doctor review included'],
              icon: 'activity',
            },
            {
              id: 'srv-4',
              name: 'HD Telemedicine Video Consultation',
              category: 'Telemedicine',
              description: 'End-to-end encrypted video consultation with senior board-certified specialists from anywhere in India.',
              sessionPrice: 900,
              features: ['Zero waiting room time', 'Encrypted audio/video room', 'E-prescription delivered instantly'],
              icon: 'video',
            },
            {
              id: 'srv-5',
              name: 'Preventive Immunization & Vaccines',
              category: 'Preventive',
              description: 'Certified vaccination coverage for infants, adults, influenza, HPV, hepatitis, and travel immunizations.',
              sessionPrice: 650,
              features: ['Cold-chain certified vaccines', 'Government-standard vaccine card', 'Post-vaccine observation'],
              icon: 'shield',
            },
            {
              id: 'srv-6',
              name: 'Neurology & Cognitive Health',
              category: 'Specialized Care',
              description: 'Specialized diagnosis and treatment of migraines, neuropathies, vertigo, seizures, and sleep disorders.',
              sessionPrice: 1400,
              features: ['Nerve conduction review', 'Migraine management protocol', 'Memory & cognitive screening'],
              icon: 'brain',
            },
          ]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const categories = ['ALL', 'General Care', 'Specialized Care', 'Diagnostics', 'Preventive', 'Telemedicine'];

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === 'ALL' || srv.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      srv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const renderServiceIcon = (iconType, name) => {
    const lower = (iconType || name || '').toLowerCase();
    if (lower.includes('heart') || lower.includes('cardio')) return <HeartIcon3D size={52} />;
    if (lower.includes('brain') || lower.includes('neuro')) return <BrainIcon3D size={52} />;
    if (lower.includes('tele') || lower.includes('video')) return <Video3DIcon size={52} />;
    if (lower.includes('shield') || lower.includes('vaccin') || lower.includes('prevent')) return <Shield3DIcon size={52} />;
    if (lower.includes('hospital') || lower.includes('clinic')) return <Hospital3DIcon size={52} />;
    return <StethoscopeIcon3D size={52} />;
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
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
          marginBottom: 14,
          border: '1px solid #CCFBF1',
        }}>
          <span>✦ Clinical Excellence & Healthcare Services</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 12 }}>
          Our Specialized Medical Services
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
          Explore our range of hospital care, diagnostics, preventive programs, and video consultations.
          Every service is backed by certified specialists and transparent session-based pricing in Indian Rupees.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: '16px 20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: 36,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 320px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search healthcare services, treatments, tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.92rem',
              color: '#0F172A',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  border: 'none',
                  backgroundColor: active ? '#0D9488' : '#F1F5F9',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.82rem',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#64748B' }}>
          Loading clinical services catalog...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            No matching services found
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 16 }}>
            Try searching for another treatment or clear your category filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="btn btn-outline btn-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 28,
        }}>
          {filteredServices.map((srv) => (
            <div
              key={srv.id || srv._id}
              className="card-3d"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div>
                {/* Header with 3D Icon & Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  {renderServiceIcon(srv.icon, srv.name)}
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#0D9488',
                    backgroundColor: '#F0FDFA',
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: '1px solid #CCFBF1',
                  }}>
                    {srv.category || 'General Care'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
                  {srv.name}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.55, marginBottom: 20 }}>
                  {srv.description}
                </p>

                {/* Features List */}
                {srv.features && srv.features.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
                    {srv.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#334155' }}>
                        <CheckCircleIcon size={15} style={{ color: '#0D9488', flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing & Booking CTA */}
              <div style={{
                paddingTop: 18,
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>SESSION FEE</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D9488' }}>
                    ₹{srv.sessionPrice || srv.price || 900}
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}> / session</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onFindDoctor ? onFindDoctor() : (onBookAppointment && onBookAppointment())}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    <span>Book Now</span>
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Guarantee Banner */}
      <div style={{
        marginTop: 56,
        padding: '32px',
        borderRadius: 22,
        backgroundColor: '#042F2E',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        <div style={{ maxWidth: 640 }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Need guidance choosing the right clinical specialty?
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#99F6E4', lineHeight: 1.5 }}>
            Our healthcare triage team can assist you in finding the exact doctor or diagnostic test suited to your symptoms.
          </p>
        </div>
        <button
          onClick={() => onFindDoctor && onFindDoctor()}
          className="btn"
          style={{
            backgroundColor: '#2DD4BF',
            color: '#042F2E',
            fontWeight: 800,
            padding: '12px 28px',
            borderRadius: 12,
          }}
        >
          Explore Doctors Near You
        </button>
      </div>
    </div>
  );
}
