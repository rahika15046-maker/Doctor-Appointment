import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  BellIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  MedoraCross,
  PlusIcon,
  ActivityIcon,
  ArrowRightIcon,
} from './Icons';
import api from '../services/api';

export default function Dashboard({
  user,
  activeTab,
  onNavigateTab,
  onOpenBooking,
  onOpenFindDoctor,
  onViewAppointmentDetails,
  onRescheduleAppointment,
  onOpenNotifications,
  onLogout,
}) {
  const [statsData, setStatsData] = useState({
    stats: { upcoming: 1, total: 5, completed: 3, cancelled: 1 },
    profileCompletion: 80,
    upcomingAppointment: null,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.data) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard stats fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = statsData.stats || { upcoming: 1, total: 5, completed: 3, cancelled: 1 };
  const upcoming = statsData.upcomingAppointment;

  // Sidebar navigation items matching the image
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: CalendarIcon },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'book', label: 'Book Appointment', icon: PlusIcon, action: onOpenBooking },
    { id: 'appointments', label: 'My Appointments', icon: CalendarIcon },
    { id: 'records', label: 'Medical Records', icon: FileTextIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, badge: 2, action: onOpenNotifications },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="dashboard-layout">
      {/* Dark Teal Sidebar */}
      <aside className="dashboard-sidebar">
        {/* Logo and Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <MedoraCross size={28} />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
            MEDORA
          </span>
        </div>

        {/* Patient Profile Widget in Sidebar */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'}
            alt="Priya Sharma"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #2DD4BF',
            }}
          />
          <div>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
              {user?.name || 'Priya Sharma'}
            </h4>
            <span style={{
              fontSize: '0.75rem',
              color: '#99F6E4',
              backgroundColor: 'rgba(45, 212, 191, 0.18)',
              padding: '2px 8px',
              borderRadius: 6,
              fontWeight: 600,
            }}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient'}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action();
                  else onNavigateTab(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: isActive ? '#0D9488' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#CBD5E1',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconComp size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 9999,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom of sidebar */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 16px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#F87171',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOutIcon size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="dashboard-main">
        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 440 }}>
            <div style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}>
              <SearchIcon size={18} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search doctors, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenFindDoctor && onOpenFindDoctor(searchQuery)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 40px',
                  borderRadius: 9999,
                  border: '1px solid #E2E8F0',
                  fontSize: '0.88rem',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              style={{
                position: 'relative',
                background: '#F1F5F9',
                border: 'none',
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <BellIcon size={20} />
              <span style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                boxShadow: '0 0 0 2px #FFFFFF',
              }} />
            </button>

            {/* Profile Avatar */}
            <div
              onClick={() => onNavigateTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'}
                alt="Avatar"
                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <main className="dashboard-body">
          {/* Welcome Greeting Banner */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: '24px 28px',
            marginBottom: 28,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Priya'}! 👋
              </h1>
              <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
                Your health journey matters to us. Keep track of appointments and medical updates.
              </p>
            </div>

            {/* Profile Completion Meter (80%) */}
            <div style={{ minWidth: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Profile Completion</span>
                <span style={{ fontWeight: 800, color: '#0D9488' }}>{statsData.profileCompletion}%</span>
              </div>
              <div style={{
                height: 8,
                backgroundColor: '#E2E8F0',
                borderRadius: 9999,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${statsData.profileCompletion}%`,
                  height: '100%',
                  backgroundColor: '#0D9488',
                  borderRadius: 9999,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          </div>

          {/* 4 Key Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}>
            {/* Upcoming */}
            <div className="card-3d" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CalendarIcon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Upcoming</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>{stats.upcoming}</div>
              </div>
            </div>

            {/* Total Appointments */}
            <div className="card-3d" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#CCFBF1',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileTextIcon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Total Appointments</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>{stats.total}</div>
              </div>
            </div>

            {/* Completed */}
            <div className="card-3d" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircleIcon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Completed</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>{stats.completed}</div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="card-3d" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircleIcon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Cancelled</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>{stats.cancelled}</div>
              </div>
            </div>
          </div>

          {/* Two Columns: Upcoming Spotlight & Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 32,
          }}>
            {/* Upcoming Appointment Spotlight */}
            <div className="card-3d">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                  Upcoming Appointment
                </h3>
                <button
                  onClick={() => onNavigateTab('appointments')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0D9488',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View All →
                </button>
              </div>

              {upcoming ? (
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 16,
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={upcoming.doctorId?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
                        alt={upcoming.doctorId?.name || 'Doctor'}
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2DD4BF' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                          {upcoming.doctorId?.name || 'Dr. Sarah Johnson'}
                        </h4>
                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {upcoming.doctorId?.specialization || 'Cardiologist'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="badge badge-confirmed">Confirmed</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                        ₹{upcoming.consultationFee || 1000}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: '0.88rem',
                    color: '#475569',
                    marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarIcon size={16} />
                      <span>{new Date(upcoming.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ActivityIcon size={16} />
                      <span>{new Date(upcoming.startAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => onViewAppointmentDetails && onViewAppointmentDetails(upcoming)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '9px 14px' }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onRescheduleAppointment && onRescheduleAppointment(upcoming)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, padding: '9px 14px' }}
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                  <CalendarIcon size={36} style={{ marginBottom: 10, color: '#94A3B8' }} />
                  <p style={{ fontSize: '0.92rem', marginBottom: 14 }}>No upcoming appointment scheduled.</p>
                  <button onClick={onOpenBooking} className="btn btn-primary btn-sm">
                    Book Now
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Book New Appointment', icon: CalendarIcon, action: onOpenBooking, color: '#0D9488', bg: '#F0FDFA' },
                  { label: 'Find a Doctor', icon: SearchIcon, action: onOpenFindDoctor, color: '#0284C7', bg: '#F0F9FF' },
                  { label: 'View Medical Records', icon: FileTextIcon, action: () => onNavigateTab('records'), color: '#7C3AED', bg: '#F5F3FF' },
                  { label: 'Update Profile', icon: UserIcon, action: () => onNavigateTab('profile'), color: '#EA580C', bg: '#FFF7ED' },
                ].map((act, i) => {
                  const IconComp = act.icon;
                  return (
                    <button
                      key={i}
                      onClick={act.action}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 14,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: act.bg,
                          color: act.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <IconComp size={18} />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                          {act.label}
                        </span>
                      </div>
                      <ArrowRightIcon size={16} style={{ color: '#94A3B8' }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigateTab('appointments')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0D9488',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View All →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(statsData.recentActivities?.length > 0 ? statsData.recentActivities : [
                { id: '1', title: 'Appointment confirmed with Dr. Sarah Johnson', timestamp: '2 hours ago' },
                { id: '2', title: 'Medical record uploaded: Complete Blood Count', timestamp: '1 day ago' },
                { id: '3', title: 'Profile information updated', timestamp: '3 days ago' },
              ]).map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    borderRadius: 12,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#CCFBF1',
                    color: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ActivityIcon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {act.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
