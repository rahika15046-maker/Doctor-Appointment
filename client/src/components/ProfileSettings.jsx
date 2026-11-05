import React, { useState, useRef } from 'react';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, CheckCircleIcon, ShieldCheckIcon, AlertCircleIcon, CameraIcon } from './Icons';
import api from '../services/api';

export default function ProfileSettings({ user, onProfileUpdated }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || 'Priya Sharma',
    email: user?.email || 'patient@demo.medora',
    phone: user?.phone || '+91 98765 43210',
    bloodGroup: user?.bloodGroup || 'O+',
    dateOfBirth: user?.dateOfBirth || '1992-05-14',
    gender: user?.gender || 'Female',
    emergencyContact: user?.emergencyContact || '+91 98765 00000 (Rahul Sharma - Spouse)',
    address: user?.address || '42 Health Street, Saket, New Delhi',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.updateProfile(form);
      if (res.data) {
        onProfileUpdated(res.data);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await api.uploadAvatar(formData);
      if (res.data) {
        onProfileUpdated(res.data);
        setSuccessMsg('Profile picture updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      setPasswordMsg(res.message || 'Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
          Patient Profile & Settings
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
          Manage your personal medical information, residential location, and account security
        </p>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: '#ECFDF5',
          color: '#059669',
          border: '1px solid #A7F3D0',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          <CheckCircleIcon size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="card-3d" style={{ padding: '32px', marginBottom: 32 }}>
        {/* Profile Avatar Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'}
                alt={user?.name || 'Patient'}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #CCFBF1',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                title="Change Photo"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFileChange}
              />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                {user?.name || 'Priya Sharma'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 6 }}>
                Patient ID: <b style={{ color: '#0D9488' }}>MED-P-88210</b> • Medora Hospital Registered
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge badge-confirmed">Verified Patient</span>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Profile Completion: <b>{user?.profileCompletion ?? 80}%</b>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="btn btn-outline btn-sm"
          >
            {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
          </button>
        </div>

        {/* Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              disabled
              style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              className="form-input"
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
            >
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 10 }}>
          <label className="form-label">Emergency Contact Name & Relation</label>
          <input
            type="text"
            className="form-input"
            value={form.emergencyContact}
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Home Address</label>
          <textarea
            className="form-input"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px' }}>
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <div className="card-3d" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
          Change Password
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 20 }}>
          Ensure your account stays secure by using a strong password with a mix of letters, numbers, and symbols
        </p>

        {passwordMsg && (
          <div style={{
            backgroundColor: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: '0.88rem',
            fontWeight: 600,
          }}>
            {passwordMsg}
          </div>
        )}

        {passwordError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: '0.88rem',
            fontWeight: 600,
          }}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (6+ chars)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={changingPassword}
              className="btn btn-secondary"
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
