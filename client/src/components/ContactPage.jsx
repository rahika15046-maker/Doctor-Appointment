import React, { useState } from 'react';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from './Icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
          marginBottom: 12,
          border: '1px solid #CCFBF1',
        }}>
          <span>✦ Patient Care & Clinic Support</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 12 }}>
          We're Here For You 24/7
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: 640, margin: '0 auto' }}>
          Have questions about appointment booking, doctor availability, or hospital services? Our dedicated clinical support team is ready to help.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gap: 36,
        alignItems: 'start',
      }}>
        {/* Left Column: Direct Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card 1: Emergency & Helpline */}
          <div className="card-3d" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
              Direct Healthcare Helplines
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#F0FDFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0D9488',
                  flexShrink: 0,
                }}>
                  <PhoneIcon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>PATIENT HELPLINE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>+91 98765 43210</div>
                  <div style={{ fontSize: '0.78rem', color: '#0D9488' }}>Toll-Free • 24 Hours Active</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                  flexShrink: 0,
                }}>
                  <PhoneIcon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>EMERGENCY AMBULANCE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#DC2626' }}>108 / 102</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Immediate Regional Ambulance Dispatch</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F766E',
                  flexShrink: 0,
                }}>
                  <MailIcon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>EMAIL DESK</div>
                  <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A' }}>support@medora.care</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Average response in under 20 minutes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Metro Regional Clinic Centers */}
          <div className="card-3d" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
              Major City Hospital Centers
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { city: 'New Delhi', address: '123 Healthcare Ave, Saket Medical District, New Delhi 110017' },
                { city: 'Mumbai', address: '45 Bandra Kurla Complex, Bandra West, Mumbai 400051' },
                { city: 'Bengaluru', address: '88 Indiranagar 100ft Rd, Bengaluru 560038' },
                { city: 'Hyderabad', address: '24 Jubilee Hills Rd 36, Hyderabad 500033' },
              ].map((loc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem' }}>
                  <MapPinIcon size={18} style={{ color: '#0D9488', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{loc.city}: </span>
                    <span style={{ color: '#64748B' }}>{loc.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Message Form */}
        <div className="card-3d" style={{ padding: '36px', backgroundColor: '#FFFFFF', borderRadius: 22, border: '1px solid #E2E8F0' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <CheckCircleIcon size={58} style={{ color: '#0D9488', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                Thank You, Message Received!
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Our clinical support coordinators have logged your ticket. A member of our team will contact you at <strong>{formData.email || formData.phone}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ fullName: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                }}
                className="btn btn-outline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                Send us a Message
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 24 }}>
                Fill out the form below and our medical coordinators will respond right away.
              </p>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="General Inquiry">General Healthcare Inquiry</option>
                  <option value="Appointment Reschedule">Appointment Rescheduling / Slot Issue</option>
                  <option value="Doctor Inquiry">Doctor Consultation & Fee Details</option>
                  <option value="Billing & Invoices">Billing & Session Payment</option>
                  <option value="Technical Support">Technical / Website Issue</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe how we can assist you..."
                  className="form-input"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.96rem', marginTop: 10 }}
              >
                {loading ? 'Submitting Message...' : 'Send Message to Medora Team'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
