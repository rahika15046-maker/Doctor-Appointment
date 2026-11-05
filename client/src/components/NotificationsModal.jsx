import React, { useState, useEffect } from 'react';
import { BellIcon, XIcon, CheckCircleIcon, CalendarIcon, FileTextIcon } from './Icons';
import api from '../services/api';

export default function NotificationsModal({ isOpen, onClose, onRefreshCount }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.data || []);
      if (onRefreshCount) onRefreshCount(res.unreadCount || 0);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen]);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      await loadNotifications();
    } catch (err) {
      console.warn(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await loadNotifications();
    } catch (err) {
      console.warn(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 0 }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BellIcon size={20} style={{ color: '#0D9488' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              Notifications
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={markAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#0D9488',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Mark all read
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div style={{ padding: '16px 20px', maxHeight: 380, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>No notifications</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map((n) => (
                <div
                  key={n._id || n.id}
                  onClick={() => !n.isRead && markRead(n._id || n.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    backgroundColor: n.isRead ? '#FFFFFF' : '#F0FDFA',
                    border: n.isRead ? '1px solid #E2E8F0' : '1.5px solid #99F6E4',
                    cursor: n.isRead ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: n.isRead ? '#F1F5F9' : '#CCFBF1',
                    color: n.isRead ? '#64748B' : '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {n.type === 'appointment' ? <CalendarIcon size={16} /> : <FileTextIcon size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{n.title}</h4>
                      {!n.isRead && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0D9488' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4, marginBottom: 4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
