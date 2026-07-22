"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, Users, Clock, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Subscribe from "@/components/Subscribe";
import PageHero from "@/components/PageHero";

// Character-accurate imports mapping exactly to your image files
import challenger350FloorPlan from "../assets/Challenger 350 floor plan.jpeg";
import challenger350 from "../assets/Challenger 350.jpeg";
import challenger605FloorPlan from "../assets/Challenger 605 Floor Plan.png";
import challenger605Interior from "../assets/Challenger 605 Interior.jpg";
import challenger850FloorPlan from "../assets/Challenger 850 Floor Plan.jpeg";
import citationSovereignInterior from "../assets/Citation sovereign_interior.jpeg";
import citationSovereign from "../assets/Citation Soverign.jpeg"; 
import citationXlsFloorplan from "../assets/Citation XLS_Floorplan.png";
import citationXlsInterior from "../assets/Citation XLS-Interior.jpeg";
import citationLatitudeInterior from "../assets/citation-latitude-interior.jpeg";
import global6000FloorPlan from "../assets/Global 6000 Floor Plan.png";
import global6000Interior from "../assets/Global 6000 Interior.jpeg";
import learjet60FloorPlan from "../assets/Learjet 60 FloorPlan-Day.png";
import learjet60Interior from "../assets/Learjet 60 Interior.jpeg";
import legacy500 from "../assets/Legacy 500.jpeg";
import legacy500Cabin from "../assets/Legacy 500-Cabin-Layout-.png";
import legacy650Config from "../assets/Legacy 650 Configuration .png"; 
import legacy650FloorPlan from "../assets/legacy 650 floor plan.jpeg";
import legacy650Interior from "../assets/Legacy 650-Interior.jpeg";
import phenom300Config from "../assets/Phenom 300 Configuration.png";
import phenom300_1 from "../assets/phenom_300_1.jpg";
import servicePrivateJet from "../assets/service-private-jet.jpg";

interface AircraftData {
  name: string;
  capacity: string;
  images: string[];
  description: string;
}

const aircraftData: AircraftData[] = [
  {
    name: "Phenom 300",
    capacity: "Up to 6-7 passengers",
    images: [phenom300Config, phenom300_1],
    description: "The Phenom 300 private jet offers a luxurious and efficient travel experience for elite passengers. With 4 flying hours, seating capacity up to 8, and ample luggage space, it seamlessly blends comfort with performance. Its exquisitely crafted cabin boasts premium materials, advanced entertainment systems, and spacious seating, ensuring passengers enjoy every moment of their journey. With state-of-the-art safety features and superior avionics, the Phenom 300 sets a new standard for luxury air travel, delivering unmatched sophistication and convenience."
  },
  {
    name: "Citation XLS",
    capacity: "Up to 6-7 passengers",
    images: [citationXlsInterior, citationXlsFloorplan],
    description: "The Citation XLS private jet epitomizes luxury and performance, with an impressive range, ample flying hours, generous seating for 8 passengers, and spacious luggage capacity. Its refined cabin offers plush seating, premium amenities, and modern entertainment systems for a comfortable and enjoyable journey. With advanced avionics and safety features, the Citation XLS ensures a smooth and secure flight experience. Ideal for both business and leisure travel, it combines versatility, comfort, and reliability to meet the highest standards of discerning travelers."
  },
  {
    name: "Learjet 60",
    capacity: "Up to 6-7 passengers",
    images: [learjet60Interior, learjet60FloorPlan],
    description: "The Learjet 60 private jet is renowned for its exceptional performance and luxurious comfort. With a seating capacity for up to 7-8 passengers, it offers an intimate yet spacious cabin environment. The Learjet 60 boasts an impressive range, allowing for non-stop travel between distant destinations, while its generous luggage capacity ensures ample storage for passengers' belongings. Whether for business or leisure travel, this aircraft delivers a seamless and stylish flying experience, combining speed, efficiency, and elegance for the discerning traveler."
  },
  {
    name: "Citation Sovereign",
    capacity: "Up to 9 passengers",
    images: [citationSovereignInterior, citationSovereign],
    description: "The Citation Sovereign private jet is a symbol of luxury and performance, offering seating for up to 9 passengers in a spacious and comfortable cabin. With an impressive range, it effortlessly connects distant destinations without the need for refueling, while its ample luggage capacity ensures that passengers can bring all they need for their journey. Combining sleek design with advanced technology, the Citation Sovereign provides a seamless and refined travel experience, ideal for both business and leisure travelers seeking comfort, convenience, and reliability."
  },
  {
    name: "Challenger 350",
    capacity: "Up to 7-10 passengers",
    images: [challenger350, challenger350FloorPlan],
    description: "The Challenger 350 private jet sets the standard for comfort, performance, and versatility in its class. With seating for up to 10 passengers, its spacious cabin offers ample room to relax and work during the flight. Boasting an impressive range, the Challenger 350 can effortlessly traverse long distances with ease, making it ideal for both domestic and international travel. Additionally, its generous luggage capacity ensures that passengers can bring everything they need for their journey, whether it's for business or leisure. With advanced technology and luxurious amenities, the Challenger 350 delivers a superior travel experience, combining style, efficiency, and reliability for discerning travelers."
  },
  {
    name: "Legacy 500",
    capacity: "Up to 7-10 passengers",
    images: [legacy500, legacy500Cabin],
    description: "The Legacy 500 private jet epitomizes luxury and performance, offering a seamless blend of comfort and efficiency. With a seating capacity for up to 10 passengers, its spacious cabin provides ample room to relax or work during the flight. The Legacy 500 boasts an impressive range of 5 hours, allowing for non-stop travel between distant destinations, while its generous luggage capacity ensures that passengers can bring all they need for their journey. Equipped with state-of-the-art technology and luxurious amenities, the Legacy 500 delivers a superior travel experience, ideal for both business and leisure travelers seeking style, convenience, and reliability."
  },
  {
    name: "Citation Latitude",
    capacity: "Up to 7-10 passengers",
    images: [citationLatitudeInterior],
    description: "The Citation Latitude private jet combines comfort, performance, and versatility to offer a superior flying experience. With a spacious cabin accommodating up to 9 passengers, it provides ample room for relaxation or productivity during the journey. Boasting an impressive range of 5 hours, the Citation Latitude enables seamless travel between distant destinations without the need for refueling. Its generous luggage capacity ensures that passengers can bring all their essentials and more, making it an ideal choice for both business and leisure travelers. With advanced avionics and luxurious amenities, the Citation Latitude delivers unparalleled comfort, convenience, and reliability for discerning travelers."
  },
  {
    name: "Legacy 650",
    capacity: "Up to 13 passengers",
    images: [legacy650Interior, legacy650Config, legacy650FloorPlan],
    description: "The Legacy 650 private jet is the epitome of luxury and sophistication, offering a spacious and opulent flying experience. With a seating capacity for up to 13 passengers, its expansive cabin provides unparalleled comfort and style, perfect for long-haul journeys. The Legacy 650 boasts an impressive range of 8 hours, allowing for seamless travel between distant destinations without the need for frequent stops. Additionally, its generous luggage capacity ensures ample storage for passengers' belongings, making it an ideal choice for those who travel with an abundance of luggage or equipment. With advanced technology, luxurious amenities, and impeccable craftsmanship, the Legacy 650 sets the standard for private jet travel, providing discerning passengers with unparalleled comfort, convenience, and reliability."
  },
  {
    name: "Challenger 605",
    capacity: "Up to 9-13 hours",
    images: [challenger605Interior, challenger605FloorPlan],
    description: "The Challenger 605 private jet redefines luxury and performance, offering an unmatched flying experience for discerning travelers. With a seating capacity for up to 12 passengers, its spacious cabin provides ample room to relax, work, or socialize during the journey. Boasting an impressive range of 8 hours, the Challenger 605 ensures seamless travel between distant destinations without the need for refueling, making it perfect for both short hops and transcontinental flights. Additionally, its generous luggage capacity allows passengers to bring all they need for their journey, ensuring convenience and comfort throughout. Equipped with state-of-the-art technology, luxurious amenities, and superior craftsmanship, the Challenger 605 delivers a level of comfort, style, and reliability that is second to none in the world of private jet travel."
  },
  {
    name: "Challenger 850",
    capacity: "Up to 9-13 hours",
    images: [challenger850FloorPlan],
    description: "The Challenger 850 private jet is a pinnacle of luxury and performance, offering an unparalleled flying experience for discerning travelers. With a spacious cabin accommodating up to 15 passengers, it provides ample room for relaxation, work, or socializing during the journey. Boasting an impressive range, the Challenger 850 ensures seamless travel between distant destinations without the need for frequent stops, making it perfect for both short hops and long-range flights. Additionally, its generous luggage capacity allows passengers to bring all they need for their journey, ensuring convenience and comfort throughout. Equipped with state-of-the-art technology, luxurious amenities, and superior craftsmanship, the Challenger 850 sets the standard for private jet travel, delivering unrivaled comfort, style, and reliability."
  },
  {
    name: "Global 6000",
    capacity: "Up to 12-14 passengers",
    images: [global6000Interior, global6000FloorPlan],
    description: "The Global 6000 private jet stands at the pinnacle of luxury and performance, offering an unparalleled flying experience for elite travelers. With a spacious cabin accommodating up to 14 passengers, it provides ample room for relaxation, work, or entertainment during the journey. Boasting an impressive range of 12 hours, the Global 6000 effortlessly connects distant destinations without the need for refueling, making it ideal for transcontinental flights. Additionally, its generous luggage capacity ensures that passengers can bring all they need for their journey, with ample storage space for belongings and equipment. Equipped with state-of-the-art technology, opulent amenities, and impeccable craftsmanship, the Global 6000 sets the standard for private jet travel, delivering unmatched comfort, style, and reliability."
  },
  {
    name: "G 550",
    capacity: "Up to 12-14 passengers",
    images: [servicePrivateJet],
    description: "The Gulfstream 550 private jet is synonymous with luxury, performance, and sophistication. With a seating capacity for up to 14 passengers, its spacious cabin offers unparalleled comfort and elegance, ideal for long-haul journeys or business travel. Boasting an impressive range of 14 hours, the Gulfstream 550 can effortlessly traverse vast distances with ease, making it a preferred choice for international travel without the need for frequent stops. Additionally, its generous luggage capacity ensures that passengers can bring all they need for their journey, with ample storage space for belongings and equipment. Equipped with cutting-edge technology, luxurious amenities, and superior craftsmanship, the Gulfstream 550 provides an unparalleled flying experience, setting the standard for private jet travel in terms of comfort, style, and reliability."
  }
];

// 1. ORIGINAL MANUAL-ONLY SLIDESHOW (Used for the main card list)
const ImageSlideshow = ({ images, alt }: { images: string[]; alt: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-64 bg-zinc-100 overflow-hidden group">
      <img
        src={images[currentIndex] || servicePrivateJet}
        alt={`${alt} view ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-y-1/2 flex gap-1.5 transform -translate-x-1/2">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 2. HYBRID SLIDESHOW (With Auto-Play + Manual controls used ONLY inside the popup modal)
const PopupDynamicSlideshow = ({ images, alt }: { images: string[]; alt: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images, isHovered]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="relative w-full h-full bg-zinc-900 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={images[currentIndex] || servicePrivateJet}
        alt={`${alt} popup view ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 text-white p-2.5 rounded-full shadow-xl transition-all active:scale-95 z-20"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 text-white p-2.5 rounded-full shadow-xl transition-all active:scale-95 z-20"
          >
            <ChevronRight size={22} />
          </button>
          
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-amber-400 scale-110 w-5" : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AircraftModels = () => {
  const [selectedJet, setSelectedJet] = useState<AircraftData | null>(null);

  useEffect(() => {
    if (selectedJet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedJet]);

  return (
    <div className="min-h-screen bg-background text-zinc-800">
      <Header />
      <main>
        <PageHero
          title="Our Private Jets Collection"
          subtitle="Our flights have supported business, politics, entertainment, military movements, medical evacuations, marine searches, fire fighting, tourism, commerce, and hundreds of team supporters."
          ctaLabel="ENQUIRE NOW"
        />

        <section className="py-20 bg-zinc-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {aircraftData.map((jet) => (
                <div
                  key={jet.name}
                  className="rounded-xl overflow-hidden shadow-lg bg-white border border-zinc-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300"
                >
                  <div>
                    {/* RESTORED: Main listing cards safely use original manual-only slider */}
                    <ImageSlideshow images={jet.images.filter(Boolean)} alt={jet.name} />
                    
                    <div className="p-6">
                      <h3 className="font-display text-2xl text-brand-navy font-bold mb-3 tracking-tight">
                        {jet.name}
                      </h3>
                      <p className="text-zinc-600 line-clamp-3 text-sm leading-relaxed mb-4 text-justify text-justify-inter-word">
                        {jet.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-zinc-50 flex items-center justify-between">
                    <div className="flex flex-col gap-1 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-zinc-400" /> {jet.capacity}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedJet(jet)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-colors tracking-wide"
                    >
                      VIEW MORE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link
                to="/enquire"
                className="inline-block bg-brand-gradient text-white px-12 py-4 rounded-full font-semibold tracking-widest text-xs hover:opacity-90 transition-opacity shadow-md"
              >
                ENQUIRE NOW
              </Link>
            </div>
          </div>
        </section>

        <Subscribe />
      </main>
      <Footer />

      <AnimatePresence>
        {selectedJet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSelectedJet(null)}
                className="absolute right-4 top-4 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              {/* LATEST UPDATE: Popup container safely keeps automated auto + manual carousel combo */}
              <div className="w-full h-80 bg-zinc-900 relative">
                <PopupDynamicSlideshow images={selectedJet.images.filter(Boolean)} alt={selectedJet.name} />
              </div>

              <div className="p-8">
                <h2 className="text-4xl font-display font-bold text-zinc-900 mb-6 border-b pb-4 border-zinc-100">
                  {selectedJet.name}
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="bg-zinc-900 text-white p-2.5 rounded-lg">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Capacity</p>
                      <p className="text-sm font-semibold text-zinc-800">{selectedJet.capacity}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="bg-zinc-900 text-white p-2.5 rounded-lg">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Performance / Range</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Briefcase size={16} /> Complete Specifications & Experience
                  </h4>
                  <p className="text-zinc-600 text-base leading-relaxed whitespace-pre-line text-justify text-justify-inter-word">
                    {selectedJet.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AircraftModels;