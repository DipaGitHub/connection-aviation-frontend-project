import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Loader2, ArrowUpRight, Plane, Navigation, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Subscribe from "@/components/Subscribe";
import Features from "@/components/Features";
import PageHero from "@/components/PageHero";

// Import the hardcoded timeline images
import dec004 from "@/assets/dec004.png";
import dec007 from "@/assets/dec007.png";
import dec010 from "@/assets/dec010.png";
import dec012 from "@/assets/may12.png";
import dec015 from "@/assets/dec015.png";
import dec017 from "@/assets/dec17.png";
import servicePrivateJet from "@/assets/service-private-jet.jpg";

import { API, API_BASE_URL } from "@/services/api";

const imageMap: Record<string, string> = {
  dec004,
  dec007,
  dec010,
  dec012,
  dec015,
  dec017,
  servicePrivateJet,
};

const resolveImage = (img: string) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("uploads/")) return `${API_BASE_URL}/${img}`;
  return imageMap[img] || img;
};

interface AboutSettings {
  id?: number;
  title: string;
  subtitle: string;
  who_we_are_title: string;
  content: string;
}

interface TimelineItem {
  year: string;
  month: string;
  image: string;
  alt: string;
  headline: string;
  body: string;
}

const ParallaxTimelineCard = ({ item, index }: { item: TimelineItem; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative py-4 ${isEven ? "" : "md:flex-row-reverse"
      }`}>
      {/* Visual Image Column Frame */}
      <div className="w-full md:w-[46%] overflow-hidden rounded-xl shadow-sm border border-zinc-100 bg-zinc-100 group relative">
        <div className="w-full h-[220px] md:h-[300px] overflow-hidden relative">
          <img
            src={resolveImage(item.image)}
            alt={item.alt || item.headline}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 bg-[#1A1A3A] text-white px-2 py-0.5 rounded text-[10px] font-bold md:hidden tracking-wider uppercase">
            {item.month} {item.year}
          </div>
        </div>
      </div>

      {/* Central Axis Static Center Dot */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center z-20 w-6 h-6 pointer-events-none">
        <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A3A] border-2 border-white shadow-sm" />
      </div>

      {/* Narrative Interactive Context Block Column */}
      <div className="w-full md:w-[46%] text-left bg-white p-5 rounded-xl border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] group">
        <div className="flex items-center gap-2 mb-1">
          <span className="hidden md:inline-block text-[16px] uppercase tracking-widest text-white font-bold bg-[#1A1A3A] px-2 py-0.5 rounded">
            {item.month}
          </span>
          <span className="text-zinc-400 text-[10px] font-mono tracking-wider">MILESTONE</span>
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 style={{ fontSize: 20 }} className="font-display text-xl md:text-4xl text-slate-900 font-black tracking-tight group-hover:text-blue-900 transition-colors">
            {item.year}
          </h3>
          <ArrowUpRight className="opacity-0 group-hover:opacity-30 text-slate-900 transition-all" size={14} />
        </div>

        <h4 className="text-slate-800 text-lg font-bold mb-1 tracking-tight">
          {item.headline}
        </h4>

        <p className="text-zinc-500 text-[17px] leading-relaxed text-justify">
          {item.body}
        </p>
      </div>
    </div>
  );
};

const About = () => {
  const [aboutData, setAboutData] = useState<AboutSettings | null>(null);
  const [historyData, setHistoryData] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Real-time calculated progress tracking value
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineSectionRef = useRef<HTMLDivElement>(null);

  const timelineData: TimelineItem[] = [
    {
      year: "2004", month: "December", image: "dec004", alt: "Connection Aviation 2004",
      headline: "The Foundation of Elite Aviation Brokering",
      body: "Establishing strategic operations with a singular mission: engineering unparalleled luxury aviation broker networks. Connection Aviation was initialized to service custom corporate routing, laying down foundational channels for international high-net-worth operational frameworks."
    },
    {
      year: "2007", month: "December", image: "dec007", alt: "Connection Aviation 2007",
      headline: "Expanding Global Fleet Access Matrices",
      body: "Augmenting direct operational partnerships across top tier multi-engine long range aircraft providers. This phase unlocked streamlined cross-border flight approvals, cutting down execution delays for diplomatic and critical enterprise client configurations globally."
    },
    {
      year: "2010", month: "December", image: "dec010", alt: "Connection Aviation 2010",
      headline: "Inaugurating VIP Private Terminals & Concierge",
      body: "Transitioning past basic charters into customized absolute hospitality modules. We integrated localized white-glove ground dispatch directly connected to runway transfers, offering seamless tracking for elite profiles moving through high-density hubs."
    },
    {
      year: "2012", month: "May", image: "dec012", alt: "Connection Aviation 2012",
      headline: "Deploying Specialized Medevac Cargo Divisions",
      body: "Diversifying technical utility systems to handle emergency intensive critical transports and complex industrial hardware drops. Our crews achieved certified rapid response protocols, securing 24-hour on-call runway clearance guarantees."
    },
    {
      year: "2015", month: "December", image: "dec015", alt: "Connection Aviation 2015",
      headline: "Next-Gen Flight Management Systems Deployment",
      body: "Integrating state-of-the-art predictive logistics platforms into client communication channels. This tech modernization allowed real-time weather dynamic recalculations, providing travelers unmatched planning certainty."
    },
    {
      year: "2017", month: "December", image: "dec017", alt: "Connection Aviation 2017",
      headline: "Transatlantic Dominance & Premium Standards Integration",
      body: "Cementing global leadership across private charter operations. By securing deep compliance certifications, Connection Aviation stands today as the benchmark framework for elite global travel, serving business, government, and emergency vectors."
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, historyRes] = await Promise.all([
          fetch(API.about).catch(() => null),
          fetch(API.history).catch(() => null)
        ]);
        
        if (aboutRes && aboutRes.ok) {
          const aboutJson = await aboutRes.json();
          if (aboutJson) setAboutData(aboutJson);
        }
        
        if (historyRes && historyRes.ok) {
          const historyJson = await historyRes.json();
          if (historyJson && Array.isArray(historyJson) && historyJson.length > 0) {
            setHistoryData(historyJson);
          } else {
            setHistoryData(timelineData);
          }
        } else {
          setHistoryData(timelineData);
        }
      } catch (error) {
        console.error("Failed loading data:", error);
        setHistoryData(timelineData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Direct Window Native Listener to cleanly capture cross-axis positions flawlessly
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineSectionRef.current) return;

      const element = timelineSectionRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress exactly when the timeline enters the center viewport area
      const totalHeight = rect.height;
      const scrolledInto = windowHeight * 0.5 - rect.top;

      let progress = scrolledInto / totalHeight;
      // Clamp values cleanly between absolute limits [0, 1]
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Initial calculation trigger point

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-gray-800 selection:bg-[#1A1A3A] selection:text-white overflow-x-hidden">
      <Header />
      <main>
        <PageHero
          title={aboutData?.title || "About Connection Aviation"}
          subtitle={aboutData?.subtitle || "Redefining the skies with a commitment to personalized air travel experiences since 2004."}
        />

        {/* Corporate Profile Module */}
        <section className="py-16 bg-white relative">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="w-full relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#1A1A3A]/10 to-slate-900/5 rounded-2xl blur-xl opacity-70" />
                <div className="rounded-2xl overflow-hidden shadow-md border border-zinc-100/80 bg-white relative">
                  <img
                    src={servicePrivateJet}
                    alt="Who We Are"
                    className="w-full h-[320px] md:h-[400px] object-cover"
                  />
                </div>
              </div>

              <div className="w-full text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs uppercase tracking-widest text-white font-extrabold bg-[#1A1A3A] px-3 py-1 rounded-md">
                    Corporate Profile
                  </span>
                  <div className="h-px w-12 bg-zinc-200" />
                </div>
                <h2 className="font-display text-2xl md:text-4xl text-slate-900 font-black tracking-tight mb-4">
                  {aboutData?.who_we_are_title || "Who We Are"}
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed text-justify font-normal mb-6">
                  {aboutData?.content || "Connection Aviation stands as a premier luxury jet brokerage provider..."}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-900 text-zinc-300 rounded-lg"><Navigation size={14} className="transform rotate-45" /></div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">Global Flight Paths</h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Borderless operational routing channels.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-900 text-zinc-300 rounded-lg"><ShieldCheck size={14} /></div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">Elite Safety</h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Exceeding international oversight rules.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* History Header Title */}
        <section className="pt-16 pb-4 bg-white relative border-t border-zinc-100">
          <div className="container mx-auto px-4 text-center max-w-3xl z-10">
            <span className="text-xs uppercase tracking-widest text-white font-extrabold bg-[#1A1A3A] px-3 py-1 rounded-md mb-2 inline-block">
              Our Journey Matrix
            </span>
            <h2 className="font-display text-2xl md:text-4xl text-slate-900 font-black tracking-tight">
              Our History
            </h2>
          </div>
        </section>

        {/* Compressed Gaps Timeline Layout Area */}
        <section ref={timelineSectionRef} className="pb-24 pt-2 bg-white overflow-hidden relative">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative">

            {/* Center Axis Guideway Track styled exactly like image_a09b64.png */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-[2px] bg-[#d5cbbe] hidden md:block z-0">
              {/* Structural dark indicator line node elements flanking the track tightly */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
                <div className="w-1.5 h-6 bg-[#1A1A3A] -ml-[2px]" />
                <div className="w-1.5 h-6 bg-[#1A1A3A] -ml-[2px]" />
                <div className="w-1.5 h-6 bg-[#1A1A3A] -ml-[2px]" />
                <div className="w-1.5 h-6 bg-[#1A1A3A] -ml-[2px]" />
                <div className="w-1.5 h-6 bg-[#1A1A3A] -ml-[2px]" />
                <div className="w-1.5 h-6 bg-[#1A1A3A] -ml-[2px]" />
              </div>
            </div>

            {/* SINGLE DYNAMIC FLIGHT INDICATOR NODE: Driven by native window scrolling values */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-10 hidden md:block z-30 pointer-events-none">
              <div
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-md text-[#1A1A3A] absolute left-0 right-0 mx-auto -mt-4 transition-all duration-150 ease-out"
                style={{ top: `${scrollProgress * 100}%` }}
              >
                <Plane size={16} className="transform rotate-90 fill-current" />
              </div>
            </div>

            {/* Output List Modules */}
            <div className="space-y-1 relative z-10">
              {historyData.map((item, index) => (
                <ParallaxTimelineCard key={item.id || item.year + index} item={item} index={index} />
              ))}
            </div>

          </div>
        </section>

        <Features />
        <Subscribe />
      </main>
      <Footer />
    </div>
  );
};

export default About;