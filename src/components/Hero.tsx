import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plane, Cross, Wind } from "lucide-react";
import { API_BASE_URL } from "../services/api.ts";

const Hero = () => {
  const [heroData, setHeroData] = useState({
    title: "Fly Beyond Limits",
    description: "Bespoke private aviation since 2004. Private jets, air ambulance and helicopter charter — anywhere, anytime.",
    video_url: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hero`)
      .then((response) => response.json())
      .then((data) => {
        if (data) setHeroData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const getVideoSrc = () => {
    if (!heroData.video_url) return "";
    return heroData.video_url.startsWith("http")
      ? heroData.video_url
      : `${API_BASE_URL}${heroData.video_url}`;
  };

  if (loading) return <div className="w-full bg-black" style={{ paddingTop: "56.25%" }} />;

  return (
    /* 
      The video is 16:9 (848x480). We use a padding-top trick to make the section
      exactly the right height for the video to show in full without any cropping.
      56.25% = 9/16 * 100 — perfect 16:9 ratio.
      The charter bar sits half-overlapping the bottom edge.
    */
    <section
      className="relative w-full"
      style={{ paddingTop: "56.25%"  /* 16:9 ratio — shows full video */ }}
    >
      {/* VIDEO — fills the exact 16:9 box, no cropping ever */}
      <div className="absolute inset-0 bg-black">
        <video
          key={heroData.video_url}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "fill",   /* fills box exactly — no black bars, no cropping */
            filter: "brightness(1.1)",
          }}
        >
          <source src={getVideoSrc()} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Very subtle overlay — keeps video bright & clear */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.08)" }} />
      </div>

      {/* CHARTER ENQUIRY BAR — sits half over the bottom edge of the video */}
      <div
        className="absolute left-0 right-0 z-20 px-4"
        style={{ bottom: 0, transform: "translateY(50%)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="bg-[#1a1a3a] rounded-xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] grid grid-cols-1 md:grid-cols-3 overflow-hidden border border-white/10">

            <div className="hidden md:flex items-center justify-center px-6 py-6 bg-gradient-to-r from-[#2e1a8b] via-[#3a1a8b] to-[#4b1d8a] text-white font-bold tracking-widest text-[10px] border-r border-white/10 uppercase">
              Charter Enquiry
            </div>

            <Link
              to="/enquiry/private-jet"
              className="flex items-center justify-center gap-3 px-6 py-6 text-white text-xs font-bold tracking-widest border-r border-white/10 hover:bg-white/10 transition-all group"
            >
              <Plane className="w-4 h-4 group-hover:scale-110 transition-transform" /> PRIVATE JET
            </Link>

            <Link
              to="/enquiry/air-ambulance"
              className="flex items-center justify-center gap-3 px-6 py-6 text-white text-xs font-bold tracking-widest hover:bg-white/10 transition-all group"
            >
              <Cross className="w-4 h-4 group-hover:scale-110 transition-transform" /> AIR AMBULANCE
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
