"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import serviceprivatejet from "@/assets/service-private-jet.jpg";
import { API } from "@/services/api";

interface Testimonial {
  id: number;
  client_name: string;
  position?: string;
  company?: string;
  comment: string;
  stars: number;
  display_order?: number;
  is_active: number;
}

const API_URL = `${API.testimonials}`;

export default function ClientTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchActiveTestimonials = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (Array.isArray(data)) {
          const activeCards = data.filter((item: Testimonial) => item.is_active === 1);
          setTestimonials(activeCards);
        }
      } catch (error) {
        console.error("Failed loading frontend client testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // 5s per slide — adjust to taste

    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setIsPaused(true);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    setIsPaused(true);
  };
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      className="w-full py-24 px-4 md:px-8 min-h-[650px] flex items-center justify-center relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${serviceprivatejet})`,
        backgroundAttachment: "fixed"
      }}
    >
      {/* Premium Aviation Dark Overlay for background contrast */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0" />

      {/* Scroll Motion Entry Animation Frame */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-between min-h-[480px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header Block */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold bg-amber-400/10 px-3 py-1 rounded-md inline-block">
            Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight drop-shadow-md">
            Client Testimonials
          </h2>
          <p className="text-sm md:text-base text-slate-300 font-normal max-w-md mx-auto">
            Hear what our clients say about our elite services
          </p>
        </div>

        {/* Dynamic Card Display Frame */}
        <div className="relative w-full overflow-hidden min-h-[260px] flex items-center justify-center px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="w-full bg-transparent backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-2xl border border-white/10 relative flex flex-col justify-between before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
            >
              {/* Giant Serif Quote Mark Accent */}
              <div className="absolute right-8 top-4 text-8xl text-white/5 font-serif font-bold pointer-events-none select-none leading-none">
                ”
              </div>

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-6 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < currentTestimonial.stars ? "fill-current" : "text-white/20"}`}
                    />
                  ))}
                </div>

                {/* Main Client Statement */}
                <p className="text-white text-base md:text-xl italic leading-relaxed text-left font-normal max-w-4xl tracking-wide drop-shadow-sm">
                  &ldquo;{currentTestimonial.comment}&nbsp;&rdquo;
                </p>
              </div>

              {/* Profile Meta Info Row */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center uppercase text-base shadow-lg">
                  {currentTestimonial.client_name.charAt(0)}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-white text-base leading-tight tracking-wide">
                    {currentTestimonial.client_name}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 mt-1 font-medium tracking-wide opacity-80 line-clamp-1">
                    {currentTestimonial.position || currentTestimonial.company
                      ? `${currentTestimonial.position || ""}${currentTestimonial.position && currentTestimonial.company ? " / " : ""}${currentTestimonial.company || ""}`
                      : "Verified Client"}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interface Navigation Controller System */}
        <div className="w-full flex flex-col items-center justify-center gap-5 mt-10">

          {/* Arrow Triggers */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="h-11 w-11 rounded-full border border-white/10 bg-slate-950/40 backdrop-blur-md text-white hover:bg-white hover:text-slate-950 hover:border-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="h-11 w-11 rounded-full border border-white/10 bg-slate-950/40 backdrop-blur-md text-white hover:bg-white hover:text-slate-950 hover:border-white flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Lower Tracking Progress Slider Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsPaused(true); }}
                className={`transition-all duration-300 rounded-full ${currentIndex === idx
                  ? "w-8 h-2 bg-amber-400 shadow-md"
                  : "w-2 h-2 bg-white/20 hover:bg-white/50"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
}