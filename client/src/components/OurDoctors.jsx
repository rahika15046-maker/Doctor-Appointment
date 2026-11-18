import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  StarIcon,
  BadgeCheckIcon,
  CalendarIcon,
  ArrowRightIcon,
  ClockIcon,
  HospitalIcon,
  VideoIcon,
  ShieldCheckIcon,
} from './Icons';
import api from '../services/api';

export default function OurDoctors({
  initialDepartment = 'All',
  onSelectDoctor,
  onBookDoctor,
}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment);
  const [selectedConsultationType, setSelectedConsultationType] = useState('ALL');

  useEffect(() => {
    setSelectedDepartment(initialDepartment);
  }, [initialDepartment]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctors({
        specialization: selectedDepartment !== 'All' ? selectedDepartment : undefined,
        consultationType: selectedConsultationType !== 'ALL' ? selectedConsultationType : undefined,
        q: searchQuery.trim() || undefined,
      });
      setDoctors(res.data || []);
    } catch (err) {
      console.warn('Doctors fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [selectedDepartment, selectedConsultationType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDoctors();
  };

  const departments = [
    'All',
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
  ];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 24px 72px' }}>
      {/* Medora Hospital Header */}
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F0FDFA',
          color: '#0D9488',
          padding: '6px 16px',
          borderRadius: 9999,
          fontSize: '0.84rem',
          fontWeight: 700,
          marginBottom: 12,
          border: '1px solid #CCFBF1',
        }}>
          <ShieldCheckIcon size={16} />
          <span>Medora Hospital Medical Faculty</span>
        </div>
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.5px',
          marginBottom: 8,
        }}>
          Our Specialists & Clinicians
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: 640, margin: '0 auto' }}>
          Consult with our board-certified department heads, surgeons, and physicians practicing at Medora Hospital.
        </p>
      </div>

      {/* Search and Department Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: '20px 24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: 36,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            position: 'relative',
            flex: '1 1 320px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <SearchIcon size={18} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search Medora doctor by name, designation, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px 11px 42px',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                fontSize: '0.92rem',
                color: '#0F172A',
                outline: 'none',
              }}
            />
          </div>

          {/* Consultation Type Filter */}
          <select
            value={selectedConsultationType}
            onChange={(e) => setSelectedConsultationType(e.target.value)}
            style={{
              padding: '11px 16px',
              borderRadius: 12,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Consultation Types</option>
            <option value="IN_PERSON">In-Person at Hospital</option>
            <option value="ONLINE">Online Video Consultation</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '11px 24px' }}>
            Search Doctors
          </button>
        </form>

        {/* Department / Specialty Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748B', marginRight: 4 }}>
            Department:
          </span>
          {departments.map((dept) => {
            const active = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                style={{
                  border: 'none',
                  backgroundColor: active ? '#0D9488' : '#F1F5F9',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.82rem',
                  padding: '7px 16px',
                  borderRadius: 9999,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none',
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Summary */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.92rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A' }}>{doctors.length}</strong> Medora Hospital medical specialists
          {selectedDepartment !== 'All' ? ` in ${selectedDepartment}` : ''}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#64748B' }}>
          Loading Medora Hospital doctors...
        </div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            No doctors found matching criteria
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 18 }}>
            Try adjusting your search terms or select "All" departments.
          </p>
          <button
            onClick={() => { setSelectedDepartment('All'); setSearchQuery(''); setSelectedConsultationType('ALL'); }}
            className="btn btn-outline btn-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 28,
        }}>
          {doctors.map((doc) => (
            <div
              key={doc._id || doc.id}
              className="card-3d"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div>
                {/* Doctor Header */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                  <img
                    src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                    alt={doc.name}
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #2DD4BF',
                      boxShadow: '0 6px 14px rgba(13, 148, 136, 0.2)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <h3 style={{
                        fontSize: '1.18rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}>
                        {doc.name}
                      </h3>
                      <BadgeCheckIcon size={18} />
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D9488', marginBottom: 3 }}>
                      {doc.designation || 'Senior Consultant'}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 6 }}>
                      {doc.qualification} • {doc.experience} yrs exp
                    </div>

                    {/* Hospital Affiliation Tag */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#F0FDFA',
                      color: '#0F766E',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px solid #CCFBF1',
                    }}>
                      <HospitalIcon size={12} />
                      <span>Medora Hospital</span>
                    </div>
                  </div>
                </div>

                {/* Short Introduction */}
                <p style={{
                  fontSize: '0.86rem',
                  color: '#475569',
                  lineHeight: 1.5,
                  marginBottom: 14,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {doc.about || 'Practicing clinical specialist at Medora Hospital delivering inpatient and outpatient consultations.'}
                </p>

                {/* Services Offered Tags */}
                {doc.servicesOffered && doc.servicesOffered.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {doc.servicesOffered.slice(0, 3).map((srv, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#F8FAFC',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rating & Consultation Modes */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 700, color: '#92400E' }}>
                    <StarIcon size={14} />
                    <span>{doc.averageRating || 4.8} ({doc.reviewsCount || 2100}+)</span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    {doc.consultationTypes?.includes('IN_PERSON') && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <HospitalIcon size={13} style={{ color: '#0D9488' }} /> Hospital
                      </span>
                    )}
                    {doc.consultationTypes?.includes('ONLINE') && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <VideoIcon size={13} style={{ color: '#0D9488' }} /> Online Video
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing and Action Buttons */}
              <div style={{
                paddingTop: 16,
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>CONSULTATION FEE</div>
                  <div style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0F172A' }}>
                    ₹{doc.firstVisitFee || doc.consultationFee || 800}
                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}> / session</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {onSelectDoctor && (
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      Profile
                    </button>
                  )}
                  <button
                    onClick={() => onBookDoctor && onBookDoctor(doc)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                  >
                    <span>Book</span>
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
