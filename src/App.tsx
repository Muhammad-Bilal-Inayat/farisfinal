import { VisualEditorProvider } from './components/VisualEditorContext';
import { BookingTrackerProvider } from './context/BookingTrackerContext';
import DeferredRender from './components/DeferredRender';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';

// Lazy load non-critical UI components aggressively
const Footer = React.lazy(() => import('./components/Footer'));
const FloatingWhatsApp = React.lazy(() => import('./components/FloatingWhatsApp'));
const MobileBottomBar = React.lazy(() => import('./components/MobileBottomBar'));
const PromoPopup = React.lazy(() => import('./components/PromoPopup'));
const BookingStatusModal = React.lazy(() => import('./components/BookingStatusModal'));

import ScrollToTop from './components/ScrollToTop';
import TopProgressBar from './components/TopProgressBar';
import OfflineBanner from './components/OfflineBanner';


// Lazy load Pages for better performance (Fix LCP and FCP)
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Vehicles = React.lazy(() => import('./pages/Vehicles'));
const RoutesRates = React.lazy(() => import('./pages/RoutesRates'));
const Booking = React.lazy(() => import('./pages/Booking'));
const TrackBooking = React.lazy(() => import('./pages/TrackBooking'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminHomeEditor = React.lazy(() => import('./pages/admin/AdminHomeEditor'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const UserDashboard = React.lazy(() => import('./pages/Dashboard'));
const Services = React.lazy(() => import('./pages/Services'));
const Ziyarat = React.lazy(() => import('./pages/Ziyarat'));
const Faq = React.lazy(() => import('./pages/Faq'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Reviews = React.lazy(() => import('./pages/Reviews'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Privacy = React.lazy(() => import('./pages/Privacy'));

// Minimal loading skeleton
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <BookingTrackerProvider>
      <div className="flex flex-col min-h-screen pb-[90px] md:pb-0">
        <ScrollToTop />
        <TopProgressBar />
        <OfflineBanner />
        <Header />
        <main className="flex-grow pt-16 md:pt-20 lg:pt-28">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/routes-rates" element={<RoutesRates />} />
              <Route path="/services" element={<Services />} />
              <Route path="/ziyarat" element={<Ziyarat />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/track" element={<TrackBooking />} />
              <Route path="/track-booking" element={<TrackBooking />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/drivers" element={<AdminDashboard initialTab="drivers" />} />
              <Route path="/admin/orders" element={<AdminDashboard initialTab="bookings" />} />
              <Route path="/admin/bookings" element={<AdminDashboard initialTab="bookings" />} />
              <Route path="/admin/home-editor" element={<AdminHomeEditor />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              {/* Catch all */}
              <Route path="*" element={<div className="container mx-auto py-20 text-center"><h2>Page coming soon</h2></div>} />
            </Routes>
          </Suspense>
        </main>
        
        {/* Aggressive chunking: defer rendering of non-critical UI until scroll or idle timeout */}
        <DeferredRender fallbackDelay={4000}>
          <Suspense fallback={null}>
            <Footer />
            <FloatingWhatsApp />
            <MobileBottomBar />
            <PromoPopup />
            <BookingStatusModal />
          </Suspense>
        </DeferredRender>
        
      </div>
    </BookingTrackerProvider>
  );
}
