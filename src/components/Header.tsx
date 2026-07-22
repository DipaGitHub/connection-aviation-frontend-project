import { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Phone, Mail, Globe, Calendar } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";
import { API, API_BASE_URL } from "../services/api.ts";

interface ServiceLink {
  slug: string;
  title: string;
}

interface NewsItem {
  id: number;
  title: string;
  description: string;
  publish_date: string;
  image_path?: string;
}

const Header = () => {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [dynamicServices, setDynamicServices] = useState<ServiceLink[]>([]);

  // News Ticker Data State
  const [newsUpdates, setNewsUpdates] = useState<NewsItem[]>([]);

  // Modal Detail States
  const [activeNewsItem, setActiveNewsItem] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);



  useEffect(() => {
    // 1. Fetch Dynamic Services for dropdown navigation
    fetch(API.services)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDynamicServices(data);
      })
      .catch((err) => console.error("Header Nav Error:", err));

    // 2. Fetch Live Dynamic News Announcements
    fetch(API.news)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNewsUpdates(data);
        }
      })
      .catch((err) => console.error("Header Ticker News Fetch Error:", err));
  }, []);

  const handleNewsClick = (item: NewsItem) => {
    setActiveNewsItem(item);
    setModalOpen(true);
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "About us", to: "/about" },
    { label: "Aircraft Models", to: "/aircraft-models" },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? "text-accent" : "hover:text-accent"}`;

  return (
    <header className="absolute top-0 left-0 right-0 z-50">

      {/* ==========================================
          INLINE CSS ENGINE WITH FAST SPEED TRACK
          ========================================== */}
      <style>{`
        @keyframes headerMarqueeRtl {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        /* Speed altered to 15s for significantly faster pacing */
        .header-marquee-track {
          animation: headerMarqueeRtl 15s linear infinite;
          will-change: transform;
        }
        .header-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ========================================================================
        UPPER TICKER ANNOUNCEMENT TRACK 
        ========================================================================
      */}
      {/* ========================================================================
          UPPER TICKER ANNOUNCEMENT TRACK 
          ========================================================================
        */}
      {/* ========================================================================
          UPPER TICKER ANNOUNCEMENT TRACK 
          ========================================================================
        */}
      <div className="bg-[#1A1A3A] border-b border-zinc-800 h-11 flex items-center relative overflow-hidden shadow-sm">

        {newsUpdates.length > 0 ? (
          <div className="w-full h-full flex items-center relative">

            {/* Restored Static Updates Label: Smaller text, non-bold, matching theme */}
            <div className="z-30 bg-[#411B8B] text-white font-medium text-xs px-5 h-full flex items-center shadow-[5px_0_15px_rgba(0,0,0,0.3)] select-none tracking-wide shrink-0 border-r border-zinc-800">
              Updates
            </div>

            {/* Right to Left Continuous Text Canvas Arena */}
            <div className="w-full relative overflow-hidden h-full flex items-center bg-[#1A1A3A]">
              <div className="flex items-center gap-12 whitespace-nowrap header-marquee-track py-1">
                {newsUpdates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNewsClick(item)}
                    className="flex items-center gap-3 cursor-pointer select-none text-white font-normal hover:text-white/80 text-sm tracking-wide transition-colors group"
                  >
                    <span className="leading-none">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}
      </div>

      {/* ========================================================================
        MAIN WHITE NAVIGATION BAR Framework
        ========================================================================
      */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 lg:px-8">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Connection Aviation" className="h-12 lg:h-14 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-brand-navy font-medium">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end className={linkClass}>
                {item.label}
              </NavLink>
            ))}

            {/* Desktop Navigation Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-accent transition-colors py-2">
                Services <ChevronDown className="w-4 h-4" />
              </button>
              {servicesOpen && (
                <div className="absolute right-0 top-full pt-1 w-64">
                  <div className="bg-[#1A1A3A] text-white py-2 shadow-xl rounded-b-md">
                    {dynamicServices.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/services/${s.slug}`}
                        className="block px-5 py-2.5 text-xs tracking-wider uppercase hover:text-accent transition-colors"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <NavLink to="/blog" className={linkClass}>
              Blog
            </NavLink>

            <NavLink to="/contact" className={linkClass}>
              Contact us
            </NavLink>
          </nav>

          {/* Mobile responsive UI trigger toggle button */}
          <button
            className="lg:hidden text-brand-navy p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Flyout Navigation Drawer Panel */}
        {open && (
          <div className="lg:hidden bg-white border-t border-border max-h-[calc(100vh-120px)] overflow-y-auto">
            <nav className="flex flex-col px-6 py-4 gap-3 text-brand-navy font-medium">
              {navItems.map((i) => (
                <NavLink key={i.to} to={i.to} end onClick={() => setOpen(false)} className="py-1">
                  {i.label}
                </NavLink>
              ))}

              <div className="py-1">
                <div className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Services
                </div>
                <div className="pl-3 flex flex-col gap-2 mt-1 border-l-2 border-gray-100">
                  {dynamicServices.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted-foreground hover:text-accent py-0.5"
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              </div>

              <NavLink to="/contact" onClick={() => setOpen(false)} className="py-1 border-t border-gray-50 pt-3">
                Contact us
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* ========================================================================
        INTERACTIVE POPUP MODAL COMPONENT
        ========================================================================
      */}
      {modalOpen && activeNewsItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col my-auto max-h-[85vh]">

            {/* Modal Navigation Control Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                <Calendar size={14} className="text-[#1A1A3A]" />
                <span>
                  {new Date(activeNewsItem.publish_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Main Content Container */}
            <div className="overflow-y-auto flex-grow">

              {/* News Display Image Header Media Graphic */}
              {activeNewsItem.image_path && (
                <div className="w-full h-[220px] overflow-hidden bg-slate-900 relative">
                  <img
                    src={activeNewsItem.image_path.startsWith("http") ? activeNewsItem.image_path : `${API_BASE_URL}/storage/${activeNewsItem.image_path}`}
                    alt={activeNewsItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              )}

              {/* Description Body text layout structure */}
              <div className="p-6 md:p-8 text-left">
                <h3 className="text-xl md:text-2xl text-slate-900 font-black tracking-tight leading-snug mb-4">
                  {activeNewsItem.title}
                </h3>

                <p className="text-zinc-600 text-sm leading-relaxed text-justify whitespace-pre-line font-normal">
                  {activeNewsItem.description && activeNewsItem.description !== "."
                    ? activeNewsItem.description
                    : "No further detailed writeup or descriptive statistics were recorded with this item update entry point."}
                </p>
              </div>
            </div>

            {/* Modal Exit/Close Button Actions Panel */}
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-[#1A1A3A] hover:bg-blue-900 text-white text-xs font-semibold tracking-wide px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Header;