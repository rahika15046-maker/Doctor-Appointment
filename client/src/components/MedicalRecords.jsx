import React, { useState, useEffect } from 'react';
import { FileTextIcon, PlusIcon, XIcon, CheckCircleIcon } from './Icons';
import api from '../services/api';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Diagnostic Lab');
  const [newDoctor, setNewDoctor] = useState('Dr. Sarah Johnson');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getMedicalRecords();
      setRecords(res.data || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await api.addMedicalRecord({
        title: newTitle.trim(),
        category: newCategory,
        doctorName: newDoctor,
        notes: newNotes,
        fileSize: '2.1 MB',
      });
      setNewTitle('');
      setNewNotes('');
      setShowUploadModal(false);
      await loadRecords();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            Medical Records
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
            Store, view, and organize all your diagnostic reports & prescriptions
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
          <PlusIcon size={18} />
          <span>Upload Record</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
          Loading medical records...
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <FileTextIcon size={44} style={{ color: '#94A3B8', marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>No medical records yet</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 16 }}>
            Upload your laboratory tests, doctor prescriptions, or vaccine charts.
          </p>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary btn-sm">
            Upload Record
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {records.map((rec) => (
            <div
              key={rec._id || rec.id}
              className="card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#F0FDFA',
                  color: '#0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileTextIcon size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                    {rec.title}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    {rec.category} • {rec.doctorName || 'Prescribed Physician'} • {new Date(rec.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-confirmed">
                  {rec.status || 'Verified'}
                </span>
                <button
                  onClick={() => alert(`Downloading ${rec.title}...`)}
                  className="btn btn-outline btn-sm"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Upload Medical Record</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Record Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lipid Profile Blood Test"
                  className="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="Diagnostic Lab">Diagnostic Lab</option>
                  <option value="Cardiology Report">Cardiology Report</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Prescription">Prescription</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Attending Doctor / Lab</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Johnson"
                  className="form-input"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  placeholder="Additional patient notes..."
                  className="form-input"
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Uploading...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
