'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';
import RegistrationModal from '@/components/events/RegistrationModal';
import CreateEventFormModal from '@/components/events/CreateEventFormModal';
import QrTicketPass from '@/components/tickets/QrTicketPass';
import QrScannerModal from '@/components/tickets/QrScannerModal';
import DigitalCertificate from '@/components/certificates/DigitalCertificate';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import Modal from '@/components/common/Modal';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { IEvent, IEventRegistration, ICertificate, IClub } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  QrCode, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Star, 
  Search, 
  Film, 
  Image as ImageIcon,
  Building2,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  // Navigation state
  const [activeTab, setActiveTab] = useState('home');

  // Real Database state
  const [events, setEvents] = useState<IEvent[]>([]);
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<IEventRegistration[]>([]);
  const [myCertificates, setMyCertificates] = useState<ICertificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFee, setSelectedFee] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');
  const [momentsFilter, setMomentsFilter] = useState('all');

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<IEvent | null>(null);
  const [viewingTicket, setViewingTicket] = useState<IEventRegistration | null>(null);
  const [viewingCert, setViewingCert] = useState<ICertificate | null>(null);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<any | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [feedbackEvent, setFeedbackEvent] = useState<IEventRegistration | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const heroVideoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
  }, [settings.heroVideoUrl, settings.heroBgType]);

  // Fetch real data from MongoDB APIs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, clubsRes, galleryRes, myRegRes, certsRes, allRegRes] = await Promise.all([
        fetch('/api/events?limit=50').catch(() => null),
        fetch('/api/clubs').catch(() => null),
        fetch('/api/gallery?limit=50').catch(() => null),
        fetch('/api/registrations').catch(() => null),
        fetch('/api/certificates').catch(() => null),
        fetch('/api/registrations?all=true').catch(() => null),
      ]);

      if (eventsRes) {
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setEvents(eventsData.data || []);
        }
      }

      if (clubsRes) {
        const clubsData = await clubsRes.json();
        if (clubsData.success) {
          setClubs(clubsData.data || []);
        }
      }

      if (galleryRes) {
        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setGalleryPhotos(galleryData.data || []);
        }
      }

      if (myRegRes) {
        const myData = await myRegRes.json();
        if (myData.success) {
          setMyRegistrations(myData.data || []);
        }
      }

      if (certsRes) {
        const certData = await certsRes.json();
        if (certData.success) {
          setMyCertificates(certData.data || []);
        }
      }

      if (allRegRes) {
        const allData = await allRegRes.json();
        if (allData.success) {
          setAllEnrollments(allData.data || []);
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;
    if (selectedDepartment !== 'all' && evt.department !== selectedDepartment) return false;
    if (selectedFee === 'free' && evt.registrationFee > 0) return false;
    if (selectedFee === 'paid' && evt.registrationFee <= 0) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        evt.title.toLowerCase().includes(s) ||
        evt.description.toLowerCase().includes(s) ||
        evt.venue.toLowerCase().includes(s) ||
        (evt.organizerName && evt.organizerName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const registeredEventIds = new Set(
    myRegistrations.filter((r) => r.status !== 'cancelled').map((r) => r.eventId)
  );

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEvent) return;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: feedbackEvent.eventId,
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccess('Thank you for your valuable feedback!');
        setTimeout(() => {
          setFeedbackSuccess('');
          setFeedbackEvent(null);
          setFeedbackComment('');
        }, 2000);
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Gallery Filter Categories
  const galleryCategories = [
    'all',
    'Tech Fest',
    'Cultural',
    'Sports',
    'Workshop',
    'Campus Life',
  ];

  const filteredGalleryPhotos = galleryPhotos.filter((item) => {
    if (momentsFilter === 'all') return true;
    return item.category?.toLowerCase() === momentsFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Sticky Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Dynamic Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">

        {/* ================= 01. DASHBOARD / HOME PAGE ================= */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Banner with Looping Video Background */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl min-h-[440px] md:min-h-[500px] flex items-center justify-center p-6 sm:p-10 md:p-16 text-center bg-gradient-to-br from-slate-950 via-purple-950/70 to-slate-950 group">
              {/* Background Video Layer */}
              {(settings.heroBgType || 'video') === 'video' && (
                <video
                  ref={heroVideoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onLoadedData={() => setIsVideoReady(true)}
                  onCanPlay={() => setIsVideoReady(true)}
                  onPlaying={() => setIsVideoReady(true)}
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ease-in-out ${
                    isVideoReady ? '' : 'opacity-0'
                  }`}
                  style={{
                    opacity: isVideoReady ? (settings.heroVideoOpacity ?? 75) / 100 : 0,
                    filter: settings.heroVideoBlur ? `blur(${settings.heroVideoBlur}px)` : undefined,
                  }}
                  src={
                    settings.heroVideoUrl ||
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                  }
                />
              )}

              {/* Dynamic Overlay Darkness (Controllable from Admin) */}
              <div
                className="absolute inset-0 bg-slate-950 pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: ((settings.heroOverlayDarkness ?? 45) / 100) * 0.8,
                }}
              />

              {/* Atmospheric Gradient Layers & Light Accents */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/30 to-slate-950/70 pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Center Content */}
              <div className="relative z-10 max-w-3xl mx-auto space-y-6 flex flex-col items-center">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 backdrop-blur-md shadow-lg shadow-pink-500/10">
                  <Sparkles className="w-4 h-4 text-pink-400 animate-spin-slow" />
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-300">
                    {settings.heroBadgeText || 'Welcome! University Event Hub'}
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight drop-shadow-md">
                  {settings.heroHighlightedWord && settings.heroTitle?.includes(settings.heroHighlightedWord) ? (
                    <>
                      {settings.heroTitle.split(settings.heroHighlightedWord)[0]}
                      <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent underline decoration-pink-500/40 decoration-wavy decoration-2 underline-offset-8">
                        {settings.heroHighlightedWord}
                      </span>
                      {settings.heroTitle.split(settings.heroHighlightedWord).slice(1).join(settings.heroHighlightedWord)}
                    </>
                  ) : (
                    settings.heroTitle || 'Welcome to Campus Events Hub'
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium drop-shadow px-2">
                  {settings.heroSubtitle ||
                    'A state-of-the-art platform for all university tech fests, cultural nights, sports tournaments, seminars, and workshops. Register today to grab your digital QR pass.'}
                </p>

                {/* Call-to-action Action Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-3.5 pt-2">
                  <button
                    onClick={() => setActiveTab('events')}
                    className="group bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>{settings.heroPrimaryBtnText || 'Explore All Events'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('moments')}
                    className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-slate-200 px-6 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 hover:border-slate-600 shadow-lg"
                  >
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span>{settings.heroSecondaryBtnText || 'Campus Moments'}</span>
                  </button>
                </div>

                {/* Micro Quick Highlights */}
                <div className="pt-4 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[11px] font-semibold text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{events.length}+ Live Events</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
                    <QrCode className="w-3 h-3 text-pink-400" />
                    <span>100% Digital QR Pass</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
                    <Award className="w-3 h-3 text-purple-400" />
                    <span>Auto-Verified Certificates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Events Quick Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    Upcoming & Featured Events
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Officially sanctioned and active campus events
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-xs text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1.5 bg-pink-500/10 hover:bg-pink-500/20 px-3.5 py-1.5 rounded-xl border border-pink-500/20 transition"
                >
                  <span>See All Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <div className="w-7 h-7 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Loading events...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-400 text-xs">
                  No active events currently available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.slice(0, 3).map((evt) => (
                    <EventCard
                      key={evt._id}
                      event={evt}
                      onSelect={(e) => setSelectedEvent(e)}
                      onRegister={(e) => setRegisteringEvent(e)}
                      isRegistered={registeredEventIds.has(evt._id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ================= CAMPUS MOMENTS & PHOTO GALLERY SHOWCASE ================= */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-pink-500" />
                    Campus Moments & Photo Gallery
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Memorable moments from fests, celebrations, and campus life
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('moments')}
                  className="text-xs text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1.5 bg-pink-500/10 hover:bg-pink-500/20 px-3.5 py-1.5 rounded-xl border border-pink-500/20 transition"
                >
                  <span>See All Photos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-400 text-xs">
                  No gallery photos added yet. Upload photos from the Admin Panel.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {galleryPhotos.slice(0, 4).map((photo) => (
                    <div
                      key={photo._id}
                      onClick={() => setSelectedGalleryPhoto(photo)}
                      className="glass-card-hover group cursor-pointer overflow-hidden rounded-2xl flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {photo.category}
                        </span>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-pink-500 transition">
                          {photo.title}
                        </h3>
                        {photo.eventName && (
                          <p className="text-[10px] text-pink-400 line-clamp-1 mt-0.5">
                            📍 {photo.eventName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access Action Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab('moments')}
                className="glass-card-hover p-6 rounded-2xl cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center text-xl group-hover:bg-pink-500 group-hover:text-white transition">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Moments Gallery</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Explore past photographs and event recaps
                  </p>
                </div>
                <span className="text-xs text-pink-500 font-bold block pt-2">Open Gallery &rarr;</span>
              </div>

              <a
                href="/admin"
                className="glass-card-hover p-6 rounded-2xl cursor-pointer group space-y-3 block"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl group-hover:bg-purple-500 group-hover:text-white transition">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Admin Control</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage events, registrations and approvals
                  </p>
                </div>
                <span className="text-xs text-purple-500 font-bold block pt-2">Go to /admin &rarr;</span>
              </a>

              <div
                onClick={() => setActiveTab('enrolled')}
                className="glass-card-hover p-6 rounded-2xl cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl group-hover:bg-indigo-500 group-hover:text-white transition">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enrolled Directory</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Live list of all registered student attendees
                  </p>
                </div>
                <span className="text-xs text-indigo-500 font-bold block pt-2">View Directory &rarr;</span>
              </div>

              <div
                onClick={() => {
                  if (user?.role === 'admin') {
                    window.location.href = '/admin';
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="glass-card-hover p-6 rounded-2xl cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live QR Scanner</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Gate check-in and attendance verification
                  </p>
                </div>
                <span className="text-xs text-emerald-500 font-bold block pt-2">Open Scanner &rarr;</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= 02. EVENTS DISCOVERY PAGE ================= */}
        {activeTab === 'events' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">University Campus Events</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Comprehensive listing of all academic, tech, cultural, and sporting events
                </p>
              </div>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsCreateEventOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-pink-500/25 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Event
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <EventFilters
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              selectedFee={selectedFee}
              setSelectedFee={setSelectedFee}
              sortBy={sortBy}
              setSortBy={setSortBy}
              totalCount={filteredEvents.length}
            />

            {/* Events Cards Grid */}
            {filteredEvents.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 space-y-3">
                <Calendar className="w-12 h-12 mx-auto opacity-30 text-pink-500" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Events Found</h3>
                <p className="text-xs max-w-sm mx-auto">
                  No events currently match your selected filters and search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <EventCard
                    key={evt._id}
                    event={evt}
                    onSelect={(e) => setSelectedEvent(e)}
                    onRegister={(e) => setRegisteringEvent(e)}
                    isRegistered={registeredEventIds.has(evt._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 03. FULL MOMENTS & GALLERY PAGE ================= */}
        {activeTab === 'moments' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Moments & Photo Gallery</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Live photo archive capturing unforgettable campus events and festivals
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {galleryCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMomentsFilter(cat)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition ${
                      momentsFilter === cat
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Photos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredGalleryPhotos.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 space-y-3">
                <ImageIcon className="w-12 h-12 mx-auto text-pink-500/40" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No photos found in this category
                </h3>
                <p className="text-xs">Upload new moments via the Admin Panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGalleryPhotos.map((photo) => (
                  <div
                    key={photo._id}
                    onClick={() => setSelectedGalleryPhoto(photo)}
                    className="glass-card-hover group cursor-pointer overflow-hidden rounded-2xl flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {photo.category}
                      </span>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Eye className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-pink-500 transition">
                        {photo.title}
                      </h3>
                      {photo.eventName && (
                        <p className="text-[10px] text-pink-500 line-clamp-1">📍 {photo.eventName}</p>
                      )}
                      {photo.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 04. CLUBS DIRECTORY PAGE ================= */}
        {activeTab === 'clubs' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">University Clubs & Forums</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Discover student clubs and join co-curricular campus activities
                </p>
              </div>

              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Club from Admin</span>
                </a>
              )}
            </div>

            {clubs.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 space-y-3">
                <Building2 className="w-12 h-12 mx-auto text-indigo-500/40" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No clubs currently listed
                </h3>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Log in to the Admin Dashboard to create and register university clubs.
                </p>
                {user?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="inline-block bg-indigo-600 text-white font-bold text-xs px-5 py-2 rounded-xl mt-2"
                  >
                    Create Club
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((c) => (
                  <div key={c._id} className="glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.logo}
                          alt={c.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500/30 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] text-pink-500 uppercase font-bold tracking-wider">
                            {c.category}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                          <p className="text-[11px] text-slate-400">{c.department}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Club President</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.presidentName}</span>
                      </div>
                      <button
                        onClick={() => alert(`🎉 Join request submitted for "${c.name}"!`)}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-pink-600/20 transition"
                      >
                        Join Club
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 05. ENROLLED MEMBERS PAGE ================= */}
        {activeTab === 'enrolled' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registered Students Directory</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Live registry of all students enrolled across university events
                </p>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="glass-card hover:border-pink-500/50 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll in Events
              </button>
            </div>

            {allEnrollments.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto text-indigo-500/40" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No students enrolled yet
                </h3>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Register for campus events from the Events page.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4"># Booking Code</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Event</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {allEnrollments.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4 font-mono text-pink-500 font-bold">{m.registrationCode}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{m.userName}</td>
                        <td className="p-4 font-mono text-slate-500">{m.studentId}</td>
                        <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold">{m.eventTitle}</td>
                        <td className="p-4">{m.department}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            m.status === 'attended'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                          }`}>
                            ● {m.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= 06. STUDENT DASHBOARD / MY EVENTS & PASSES ================= */}
        {activeTab === 'my-events' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Events & Digital Passes</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Access your registered QR passes, attendance history, and certificates
                </p>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Enroll in More Events
              </button>
            </div>

            {myRegistrations.length === 0 ? (
              <div className="glass-card p-12 text-center space-y-4">
                <QrCode className="w-12 h-12 mx-auto text-pink-500 opacity-40" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  You have not enrolled in any events yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Browse our event catalog and register in just a single click.
                </p>
                <button
                  onClick={() => setActiveTab('events')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRegistrations.map((reg) => (
                  <div key={reg._id} className="glass-card p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                          {reg.registrationCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          reg.status === 'attended'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        }`}>
                          {reg.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {reg.eventTitle}
                      </h3>

                      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-pink-500" />
                          <span>{formatDate(reg.eventStartAt)}</span>
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-purple-500" />
                          <span className="truncate">{reg.eventVenue}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        onClick={() => setViewingTicket(reg)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-pink-500/20 flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        View Digital QR Pass
                      </button>

                      {reg.status === 'attended' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => {
                              const matchingCert = myCertificates.find((c) => c.eventId === reg.eventId) || {
                                _id: 'sample_cert',
                                certificateNumber: 'CERT-UNIV-2026-0812',
                                eventId: reg.eventId,
                                eventTitle: reg.eventTitle,
                                userId: user?._id || '',
                                studentName: reg.userName,
                                studentId: reg.studentId,
                                department: reg.department,
                                issueDate: new Date().toISOString(),
                                organizerName: 'University Event Council',
                                qrVerificationUrl: 'http://localhost:3000/certificates/verify/CERT-UNIV-2026-0812',
                              };
                              setViewingCert(matchingCert as any);
                            }}
                            className="bg-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-600 hover:text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Certificate
                          </button>

                          <button
                            onClick={() => setFeedbackEvent(reg)}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            Write Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================= MODALS & LIGHTBOX ================= */}

      {/* 1. Gallery Lightbox Modal */}
      {selectedGalleryPhoto && (
        <Modal
          isOpen={Boolean(selectedGalleryPhoto)}
          onClose={() => setSelectedGalleryPhoto(null)}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={selectedGalleryPhoto.imageUrl}
                alt={selectedGalleryPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="bg-pink-500/10 text-pink-500 font-bold px-3 py-0.5 rounded-full border border-pink-500/20 text-[10px]">
                  {selectedGalleryPhoto.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedGalleryPhoto.title}
                </h3>
                {selectedGalleryPhoto.eventName && (
                  <p className="text-xs text-pink-500 font-semibold">📍 {selectedGalleryPhoto.eventName}</p>
                )}
              </div>

              <a
                href={selectedGalleryPhoto.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <span>View Full Image</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {selectedGalleryPhoto.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
                {selectedGalleryPhoto.description}
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedGalleryPhoto(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Event Detail View Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={selectedEvent.coverImage}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-pink-500/10 text-pink-500 font-bold px-3 py-1 rounded-full border border-pink-500/20">
                {selectedEvent.category}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                {formatDate(selectedEvent.startAt)}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-purple-500" />
                {selectedEvent.venue}
              </span>
              <span className="font-bold text-emerald-500">
                {selectedEvent.registrationFee > 0 ? `৳ ${selectedEvent.registrationFee}` : 'Free'}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Event Details</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const evt = selectedEvent;
                  setSelectedEvent(null);
                  setRegisteringEvent(evt);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
              >
                Register Now
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Registration Modal */}
      <RegistrationModal
        isOpen={Boolean(registeringEvent)}
        onClose={() => setRegisteringEvent(null)}
        event={registeringEvent}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onSuccess={(reg) => {
          setMyRegistrations((prev) => [reg, ...prev]);
          setViewingTicket(reg);
        }}
      />

      {/* 4. QR Ticket Pass Modal */}
      {viewingTicket && (
        <Modal
          isOpen={Boolean(viewingTicket)}
          onClose={() => setViewingTicket(null)}
          maxWidth="lg"
        >
          <QrTicketPass registration={viewingTicket} onClose={() => setViewingTicket(null)} />
        </Modal>
      )}

      {/* 5. Digital Certificate Modal */}
      {viewingCert && (
        <Modal
          isOpen={Boolean(viewingCert)}
          onClose={() => setViewingCert(null)}
          maxWidth="3xl"
        >
          <DigitalCertificate certificate={viewingCert} onClose={() => setViewingCert(null)} />
        </Modal>
      )}

      {/* 6. Live QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        events={events}
        onScanSuccess={() => fetchData()}
      />

      {/* 7. Event Creator Modal */}
      <CreateEventFormModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={(newEvent) => {
          setEvents((prev) => [newEvent, ...prev]);
          alert(user?.role === 'admin' ? '🎉 Event created & published!' : '🎉 Event submitted for admin approval!');
        }}
      />

      {/* 8. Feedback Modal */}
      {feedbackEvent && (
        <Modal
          isOpen={Boolean(feedbackEvent)}
          onClose={() => setFeedbackEvent(null)}
          title="Event Review & Feedback"
          maxWidth="md"
        >
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            {feedbackSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                {feedbackSuccess}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1">Event</label>
              <p className="font-bold text-xs text-slate-900 dark:text-white">{feedbackEvent.eventTitle}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Rating (1 - 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= feedbackRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Your Feedback & Comments</label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your thoughts regarding the event speakers, organization, and experience..."
                rows={3}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:border-pink-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 9. Unified Login & Student Registration Modal */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(role) => {
          if (role === 'admin') {
            window.location.href = '/admin';
          } else {
            setActiveTab('my-events');
          }
        }}
      />

      {/* Global Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
