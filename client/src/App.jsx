import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Specializations from './components/Specializations';
import FeaturedDoctors from './components/FeaturedDoctors';
import HowItWorks from './components/HowItWorks';
import ServicesSection from './components/ServicesSection';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import BookingFlow from './components/BookingFlow';
import BookingSuccessModal from './components/BookingSuccessModal';
import MyAppointments from './components/MyAppointments';
import DoctorProfileModal from './components/DoctorProfileModal';
import MedicalRecords from './components/MedicalRecords';
import NotificationsModal from './components/NotificationsModal';
import ProfileSettings from './components/ProfileSettings';
import FindDoctors from './components/FindDoctors';
import OurDoctors from './components/OurDoctors';
import ServicesPage from './components/ServicesPage';
import AboutUsPage from './components/AboutUsPage';
import ContactPage from './components/ContactPage';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'find-doctors' | 'dashboard' | 'booking' | 'appointments' | 'records' | 'profile' | 'services' | 'about' | 'contact'
  
  // Data lists
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);
  const [doctorProfileOpen, setDoctorProfileOpen] = useState(false);
  const [bookingSuccessModalOpen, setBookingSuccessModalOpen] = useState(false);
  const [bookedAppointmentData, setBookedAppointmentData] = useState(null);
  const [bookedDoctorData, setBookedDoctorData] = useState(null);
  const [preselectedDoctorForBooking, setPreselectedDoctorForBooking] = useState(null);
  const [preselectedServiceForBooking, setPreselectedServiceForBooking] = useState(null);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Filter params for FindDoctors
  const [findDoctorSpec, setFindDoctorSpec] = useState('All');

  // Check login on mount & load initial data
  useEffect(() => {
    // Check session
    api.getMe()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {});

    // Load specializations
    api.getSpecializations()
      .then((res) => setSpecializations(res.data || []))
      .catch(() => {});

    // Load featured & all doctors
    api.getDoctors()
      .then((res) => {
        const list = res.data || [];
        setAllDoctors(list);
        setFeaturedDoctors(list.slice(0, 4));
      })
      .catch(() => {});

    // Check notifications
    api.getNotifications()
      .then((res) => setUnreadNotifications(res.unreadCount ?? 2))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setCurrentView('home');
    } catch (err) {
      console.warn(err);
      setUser(null);
      setCurrentView('home');
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleDoctorClick = (doc) => {
    setSelectedDoctorForProfile(doc);
    setDoctorProfileOpen(true);
  };

  const handleStartBooking = (doctor = null, service = null) => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setPreselectedDoctorForBooking(doctor);
    setPreselectedServiceForBooking(service);
    setCurrentView('booking');
  };

  const handleBookingCompleted = (appointment, doctor) => {
    setBookedAppointmentData(appointment);
    setBookedDoctorData(doctor);
    setBookingSuccessModalOpen(true);
  };

  const handleSelectSpecialization = (specName) => {
    setFindDoctorSpec(specName);
    setCurrentView('find-doctors');
  };

  const handleSearchDoctors = (query) => {
    setFindDoctorSpec('All');
    setCurrentView('find-doctors');
  };

  // Render main view based on currentView
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            activeTab="dashboard"
            onNavigateTab={(tab) => setCurrentView(tab)}
            onOpenBooking={() => handleStartBooking(null)}
            onOpenFindDoctor={() => setCurrentView('find-doctors')}
            onViewAppointmentDetails={() => setCurrentView('appointments')}
            onRescheduleAppointment={() => setCurrentView('appointments')}
            onOpenNotifications={() => setNotificationsModalOpen(true)}
            onLogout={handleLogout}
          />
        );

      case 'booking':
        return (
          <BookingFlow
            preselectedDoctor={preselectedDoctorForBooking}
            preselectedService={preselectedServiceForBooking}
            allDoctors={allDoctors}
            onBookingSuccess={handleBookingCompleted}
            onCancel={() => setCurrentView('home')}
            onViewDoctorProfile={(doc) => {
              setSelectedDoctorForProfile(doc);
              setDoctorProfileOpen(true);
            }}
          />
        );

      case 'appointments':
        return (
          <MyAppointments
            onBookNew={() => handleStartBooking(null)}
            onViewDoctorProfile={handleDoctorClick}
          />
        );

      case 'our-doctors':
      case 'find-doctors':
        return (
          <OurDoctors
            initialDepartment={findDoctorSpec}
            onSelectDoctor={handleDoctorClick}
            onBookDoctor={handleStartBooking}
          />
        );

      case 'services':
        return (
          <ServicesPage
            onBookAppointment={(srv) => handleStartBooking(null, srv)}
            onFindDoctor={(spec) => {
              setFindDoctorSpec(spec || 'All');
              setCurrentView('our-doctors');
            }}
          />
        );

      case 'about':
      case 'about-us':
        return (
          <AboutUsPage
            onFindDoctors={() => setCurrentView('our-doctors')}
            onBookAppointment={() => handleStartBooking(null)}
          />
        );

      case 'contact':
        return <ContactPage />;

      case 'records':
        return <MedicalRecords />;

      case 'profile':
      case 'settings':
        return (
          <ProfileSettings
            user={user}
            onProfileUpdated={(updated) => setUser(updated)}
          />
        );

      case 'home':
      default:
        return (
          <main>
            <Hero
              onFindDoctor={() => setCurrentView('find-doctors')}
              onBookNow={() => handleStartBooking(null)}
              onSearch={handleSearchDoctors}
            />

            <Specializations
              specializations={specializations}
              selectedSpec={findDoctorSpec}
              onSelectSpec={handleSelectSpecialization}
              onViewAll={() => setCurrentView('find-doctors')}
            />

            <FeaturedDoctors
              doctors={featuredDoctors}
              onBookDoctor={handleStartBooking}
              onSelectDoctor={handleDoctorClick}
              onViewAll={() => setCurrentView('find-doctors')}
            />

            <HowItWorks />

            <ServicesSection
              onSelectService={(srv) => {
                if (srv && srv.name) {
                  setFindDoctorSpec(srv.department || 'All');
                }
                setCurrentView('services');
              }}
              onViewAll={() => setCurrentView('services')}
            />

            <WhyChooseUs
              onGetStarted={() => {
                if (user) setCurrentView('dashboard');
                else handleOpenAuth('register');
              }}
            />
          </main>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view, extra) => {
          if (extra) setFindDoctorSpec(extra);
          setCurrentView(view);
        }}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadNotifications}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
      />

      {/* Main Body */}
      <div className="main-content">
        {renderView()}
      </div>

      {/* Footer (show on public pages) */}
      {!['dashboard'].includes(currentView) && (
        <Footer onNavigate={(view) => setCurrentView(view)} />
      )}

      {/* Authentication Modal */}
      <AuthModal
        initialMode={authModalMode}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          setCurrentView('dashboard');
        }}
      />

      {/* Doctor Profile Modal */}
      <DoctorProfileModal
        doctor={selectedDoctorForProfile}
        isOpen={doctorProfileOpen}
        onClose={() => setDoctorProfileOpen(false)}
        onBookAppointment={(srv) => handleStartBooking(null, srv)}
      />

      {/* Booking Success Modal */}
      <BookingSuccessModal
        isOpen={bookingSuccessModalOpen}
        appointment={bookedAppointmentData}
        doctor={bookedDoctorData}
        onViewAppointments={() => {
          setBookingSuccessModalOpen(false);
          setCurrentView('appointments');
        }}
        onGoToDashboard={() => {
          setBookingSuccessModalOpen(false);
          setCurrentView('dashboard');
        }}
      />

      {/* Notifications Drawer / Modal */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        onRefreshCount={(c) => setUnreadNotifications(c)}
      />
    </div>
  );
}


