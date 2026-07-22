import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { X, Loader2, Search, Plus, Minus, ChevronDown } from "lucide-react";
import { API } from "@/services/api";
import { toast } from "sonner";

import privateJetImg from "@/assets/service-private-jet.jpg";
import helicopterImg from "@/assets/service-helicopter.jpg";
import airAmbulanceImg from "@/assets/service-air-ambulance.jpg";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

interface DynamicAircraftModel {
  id: string;
  name: string;
  maxPassengers: number;
  category: "Light Jet" | "Medium Jet" | "Heavy Jet" | "Helicopter";
  cruiseSpeedKmh: number;
  icaoType: string;
}

interface FlightLeg {
  departure: string;
  arrival: string;
  passengers: string;
  date: string;
  time: string;
  aircraft: string;
  estimatedHours?: number;
  estimatedPrice?: number;
  actualMinutes?: number;
  isCalculating?: boolean;
}

interface LegBreakdown {
  legIndex: number;
  hours: number;
  price: number;
  passengers: number;
  aircraft: string;
  actualMinutes: number;
  isReturn?: boolean;
  departure: string;
  arrival: string;
}

interface EstimationResult {
  totalHours: number;
  totalPrice: number;
  oneWayPrice: number;
  returnPrice: number;
  breakdown: LegBreakdown[];
}

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

const RAPIDAPI_KEY = "6eb6a3c3c1mshf2f3f0813c6fe88p17c07ajsn49e1fc4cad33";
const RAPIDAPI_HOST = "aerodatabox.p.rapidapi.com";

const RAPIDAPI_HEADERS = {
  "x-rapidapi-host": RAPIDAPI_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
} as const;

const config: Record<
  string,
  { title: string; image: string; aircraftLabel: string; isHelicopter?: boolean }
> = {
  "private-jet": { title: "PRIVATE JET ESTIMATION", image: privateJetImg, aircraftLabel: "Choose Type Of Aircraft", isHelicopter: false },
  "air-ambulance": { title: "AIR AMBULANCE ESTIMATION", image: airAmbulanceImg, aircraftLabel: "Choose Type Of Aircraft", isHelicopter: false },
  helicopter: { title: "HELICOPTER ESTIMATION", image: helicopterImg, aircraftLabel: "Choose Type Of Helicopter", isHelicopter: true },
};

const emptyLeg: FlightLeg = {
  departure: "", arrival: "", passengers: "", date: "", time: "",
  aircraft: "", estimatedHours: 0, estimatedPrice: 0, actualMinutes: 0, isCalculating: false,
};

// Explicit model configurations synced directly with your localized application fleets
const localJetCollection: DynamicAircraftModel[] = [
  // Light Jets (Up to 6 passengers)
  { id: "phenom-300", name: "Phenom 300", maxPassengers: 6, category: "Light Jet", cruiseSpeedKmh: 830, icaoType: "E55P" },
  { id: "citation-xls", name: "Citation XLS", maxPassengers: 6, category: "Light Jet", cruiseSpeedKmh: 815, icaoType: "C56X" },
  { id: "learjet-60", name: "Learjet 60", maxPassengers: 6, category: "Light Jet", cruiseSpeedKmh: 840, icaoType: "LJ60" },

  // Medium Jets (7 to 10 passengers)
  { id: "citation-sovereign", name: "Citation Sovereign", maxPassengers: 9, category: "Medium Jet", cruiseSpeedKmh: 850, icaoType: "C680" },
  { id: "challenger-350", name: "Challenger 350", maxPassengers: 10, category: "Medium Jet", cruiseSpeedKmh: 870, icaoType: "CL35" },
  { id: "legacy-500", name: "Legacy 500", maxPassengers: 10, category: "Medium Jet", cruiseSpeedKmh: 860, icaoType: "E550" },
  { id: "citation-latitude", name: "Citation Latitude", maxPassengers: 10, category: "Medium Jet", cruiseSpeedKmh: 820, icaoType: "C68A" },

  // Heavy Jets (More than 10 passengers)
  { id: "legacy-650", name: "Legacy 650", maxPassengers: 13, category: "Heavy Jet", cruiseSpeedKmh: 850, icaoType: "E135" },
  { id: "challenger-605", name: "Challenger 605", maxPassengers: 12, category: "Heavy Jet", cruiseSpeedKmh: 870, icaoType: "CL60" },
  { id: "challenger-850", name: "Challenger 850", maxPassengers: 15, category: "Heavy Jet", cruiseSpeedKmh: 850, icaoType: "CRJ2" },
  { id: "global-6000", name: "Global 6000", maxPassengers: 14, category: "Heavy Jet", cruiseSpeedKmh: 930, icaoType: "GLEX" },
  { id: "g550", name: "G 550", maxPassengers: 14, category: "Heavy Jet", cruiseSpeedKmh: 900, icaoType: "GLF5" }
];

const localHelicopterCollection: DynamicAircraftModel[] = [
  { id: "light-helicopter", name: "Light Helicopter (4 Seater) - Robinson R44", maxPassengers: 4, category: "Helicopter", cruiseSpeedKmh: 180, icaoType: "R44" },
  { id: "medium-helicopter", name: "Medium Helicopter (6 Seater) - Bell 429", maxPassengers: 6, category: "Helicopter", cruiseSpeedKmh: 270, icaoType: "B429" },
  { id: "heavy-helicopter", name: "Heavy Helicopter (12 Seater) - Sikorsky S-76", maxPassengers: 12, category: "Helicopter", cruiseSpeedKmh: 285, icaoType: "S76" }
];

// ---------------------------------------------------------------------------
// Utility Mathematical and Formatting Helpers
// ---------------------------------------------------------------------------

const airportCache: Record<string, Airport> = {};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function extractIATA(airportString: string): string | null {
  const match = airportString.match(/\(([A-Z]{2,4})\)/);
  return match ? match[1].toUpperCase() : null;
}

function resolveCoords(airportString: string): { lat: number; lng: number } | null {
  const iata = extractIATA(airportString);
  if (!iata) return null;
  const ap = airportCache[iata];
  if (ap?.lat !== undefined && ap?.lng !== undefined) return { lat: ap.lat, lng: ap.lng };
  return null;
}

// ---------------------------------------------------------------------------
// AeroDataBox APIs Integration Layer
// ---------------------------------------------------------------------------

async function fetchAirportsFromAPI(query: string): Promise<Airport[]> {
  const res = await fetch(
    `https://aerodatabox.p.rapidapi.com/airports/search/term?q=${encodeURIComponent(query)}&limit=10`,
    { method: "GET", headers: RAPIDAPI_HEADERS },
  );
  if (!res.ok) throw new Error(`Airport search failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.items)) return [];

  return data.items.map((item: any): Airport => {
    const airport: Airport = {
      icao: item.icao ?? "",
      iata: item.iata ?? "",
      name: item.name ?? "",
      city: item.municipalityName ?? "",
      country: item.country?.name ?? "",
      lat: item.location?.lat ?? item.location?.latitude,
      lng: item.location?.lon ?? item.location?.longitude,
    };
    if (airport.iata) airportCache[airport.iata.toUpperCase()] = airport;
    if (airport.icao) airportCache[airport.icao.toUpperCase()] = airport;
    return airport;
  });
}

// ---------------------------------------------------------------------------
// AirportSearchField Component
// ---------------------------------------------------------------------------

const AirportSearchField = ({
  label, value, onSelect, placeholder,
}: {
  label: string; value: string; onSelect: (val: string) => void; placeholder: string;
}) => {
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setIsLoading(true);
    try {
      const results = await fetchAirportsFromAPI(query);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
      setShowDropdown(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 300);
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative w-full">
      <label className="block text-xs font-medium text-brand-navy mb-1">{label}</label>
      <div className="relative">
        <input
          type="text" value={value} onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-purple))]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading
            ? <Loader2 className="h-3 w-3 animate-spin text-brand-purple" />
            : <Search className="h-3 w-3 text-slate-400" />}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button key={`${airport.icao || airport.iata}-${index}`} type="button"
              onClick={() => {
                if (airport.iata) airportCache[airport.iata.toUpperCase()] = airport;
                if (airport.icao) airportCache[airport.icao.toUpperCase()] = airport;
                onSelect(`${airport.city} (${airport.iata})`);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
              <p className="text-xs font-bold text-brand-navy">{airport.city} ({airport.iata})</p>
              <p className="text-[10px] text-slate-500 truncate">{airport.name}, {airport.country}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// AircraftSelectField Component (Sourcing from static model tier configurations)
// ---------------------------------------------------------------------------

const AircraftSelectField = ({
  label, value, onSelect, passengers, placeholder, isHelicopterMode
}: {
  label: string; value: string; onSelect: (val: string) => void;
  passengers: number; placeholder: string; isHelicopterMode: boolean;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Classify active tier range depending on user input changes
  let activeCategory: "Light Jet" | "Medium Jet" | "Heavy Jet" | "Helicopter" = "Light Jet";
  if (isHelicopterMode) {
    activeCategory = "Helicopter";
  } else {
    if (passengers <= 6) activeCategory = "Light Jet";
    else if (passengers > 6 && passengers <= 10) activeCategory = "Medium Jet";
    else activeCategory = "Heavy Jet";
  }

  const poolSource = isHelicopterMode ? localHelicopterCollection : localJetCollection;
  const filteredAircrafts = poolSource.filter((ac) => ac.category === activeCategory);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative w-full">
      <label className="block text-xs font-medium text-brand-navy mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-purple))]"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || `${placeholder} (${activeCategory})`}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-xl max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
            {activeCategory} Class Fleet Options
          </div>
          {filteredAircrafts.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No matching aircraft found for this layout.
            </div>
          ) : (
            filteredAircrafts.map((ac) => (
              <button
                key={ac.id}
                type="button"
                onClick={() => { onSelect(ac.name); setShowDropdown(false); }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <p className="text-sm font-medium text-brand-navy">{ac.name}</p>
                <p className="text-xs text-gray-500">
                  Max Passengers: {ac.maxPassengers} pax · Cruise: {ac.cruiseSpeedKmh} km/h
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ContactForm Component
// ---------------------------------------------------------------------------

const ContactForm = ({
  totalPrice, onSubmit,
}: {
  totalPrice: number;
  onSubmit: (data: any, e?: React.FormEvent) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-xl border-2 border-brand-purple shadow-lg">
      <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">REQUEST A QUOTE</h2>
      <p className="text-center text-gray-600 mb-6">
        Total Estimated Price:{" "}
        <span className="font-bold text-brand-purple text-xl">${totalPrice.toLocaleString()}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">First Name *</label>
            <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="John" />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">Last Name *</label>
            <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="Doe" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">Email Address *</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">Phone Number *</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="+1 234 567 8900" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-navy mb-1">Additional Message</label>
          <textarea name="message" rows={4} value={formData.message} onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
            placeholder="Tell us about your specific requirements…" />
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-brand-navy text-white py-3 rounded-full font-bold text-sm tracking-widest disabled:opacity-50 hover:bg-brand-purple transition-colors">
          {isSubmitting ? "SUBMITTING…" : "SUBMIT REQUEST"}
        </button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main EnquiryForm View Component
// ---------------------------------------------------------------------------

const EnquiryForm = () => {
  const { type } = useParams();
  const cfg = config[type ?? "private-jet"] ?? config["private-jet"];
  const isHelicopterMode = cfg.isHelicopter === true;

  const [legs, setLegs] = useState<FlightLeg[]>([{ ...emptyLeg }]);
  const [returnLegs, setReturnLegs] = useState<FlightLeg[]>([]);
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const updateLeg = (idx: number, field: keyof FlightLeg, value: string, isReturn = false) => {
    (isReturn ? setReturnLegs : setLegs)((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    );
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const addLeg = () => { setLegs((p) => [...p, { ...emptyLeg }]); setEstimationResult(null); setShowContactForm(false); };
  const addReturnLeg = () => { setReturnLegs((p) => [...p, { ...emptyLeg }]); setEstimationResult(null); setShowContactForm(false); };

  const removeLeg = (isReturn = false, idx?: number) => {
    if (isReturn && idx !== undefined) setReturnLegs((p) => p.filter((_, i) => i !== idx));
    else setLegs((p) => (p.length > 1 ? p.slice(0, -1) : p));
    setEstimationResult(null); setShowContactForm(false);
  };

  const handleRoundTripChange = (checked: boolean) => {
    setIsRoundTrip(checked);
    if (checked) setReturnLegs(legs.map((leg) => ({ ...emptyLeg, departure: leg.arrival, arrival: "" })));
    else setReturnLegs([]);
    setEstimationResult(null); setShowContactForm(false);
  };

  const handlePassengerChange = (idx: number, value: string, isReturn: boolean, currentAircraft: string) => {
    updateLeg(idx, "passengers", value, isReturn);

    const n = parseInt(value);
    const combinedFleet = [...localJetCollection, ...localHelicopterCollection];
    const ac = combinedFleet.find((a) => a.name === currentAircraft);

    if (ac && !isNaN(n) && n > ac.maxPassengers) {
      updateLeg(idx, "aircraft", "", isReturn);
      toast.warning(`Please select a larger aircraft configuration suitable for ${n} passengers.`);
    }
  };

  const computeLeg = (
    leg: FlightLeg, legIdx: number, isReturn: boolean,
  ): { hours: number; price: number; actualMinutes: number } | null => {
    const n = parseInt(leg.passengers);
    const combinedFleet = [...localJetCollection, ...localHelicopterCollection];
    const ac = combinedFleet.find((a) => a.name === leg.aircraft);

    if (!ac) {
      toast.error(`Selected aircraft "${leg.aircraft || 'None'}" is missing or unselected. Please pick it again.`);
      return null;
    }

    if (!leg.departure || !leg.arrival || !leg.aircraft || isNaN(n) || n <= 0) {
      toast.error(`Please fill in all fields for ${isReturn ? "return " : ""}leg ${legIdx + 1}.`);
      return null;
    }
    if (n > ac.maxPassengers) {
      toast.error(`${ac.name} carries up to ${ac.maxPassengers} passengers.`);
      return null;
    }

    const depCoords = resolveCoords(leg.departure);
    const arrCoords = resolveCoords(leg.arrival);

    if (!depCoords || !arrCoords) {
      toast.error(
        `Could not resolve coordinates for ${isReturn ? "return " : ""}leg ${legIdx + 1}. ` +
        `Please select airports from the lookup lists.`
      );
      return null;
    }

    const distanceKm = haversineKm(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng);
    const durationHours = distanceKm / ac.cruiseSpeedKmh;
    const actualMinutes = Math.round(durationHours * 60);

    return { hours: durationHours, actualMinutes, price: 0 };
  };

  const calculateEstimation = () => {
    setIsCalculating(true);

    const breakdown: LegBreakdown[] = [];
    let oneWayTotalPrice = 0;
    let returnTotalPrice = 0;
    let totalHours = 0;

    for (let i = 0; i < legs.length; i++) {
      const result = computeLeg(legs[i], i, false);
      if (!result) { setIsCalculating(false); return; }
      breakdown.push({
        legIndex: i, hours: result.hours, price: result.price,
        passengers: parseInt(legs[i].passengers), aircraft: legs[i].aircraft,
        actualMinutes: result.actualMinutes, isReturn: false,
        departure: legs[i].departure, arrival: legs[i].arrival,
      });
      oneWayTotalPrice += result.price;
      totalHours += result.hours;
    }

    if (isRoundTrip) {
      for (let i = 0; i < returnLegs.length; i++) {
        const result = computeLeg(returnLegs[i], i, true);
        if (!result) { setIsCalculating(false); return; }
        breakdown.push({
          legIndex: i, hours: result.hours, price: result.price,
          passengers: parseInt(returnLegs[i].passengers), aircraft: returnLegs[i].aircraft,
          actualMinutes: result.actualMinutes, isReturn: true,
          departure: returnLegs[i].departure, arrival: returnLegs[i].arrival,
        });
        returnTotalPrice += result.price;
        totalHours += result.hours;
      }
    }

    setEstimationResult({
      totalHours, totalPrice: oneWayTotalPrice + returnTotalPrice,
      oneWayPrice: oneWayTotalPrice, returnPrice: returnTotalPrice, breakdown,
    });
    setIsCalculating(false);
    setShowContactForm(true);
    toast.success("Estimation calculated! Please fill out the form below to request your custom quote.");
  };

  const saveEnquiryToBackend = async (formData: any) => {
    const mapLeg = (leg: FlightLeg, idx: number) => {
      const combinedFleet = [...localJetCollection, ...localHelicopterCollection];
      const ac = combinedFleet.find((a) => a.name === leg.aircraft);
      return {
        leg_number: idx + 1,
        departure: leg.departure,
        arrival: leg.arrival,
        passengers: parseInt(leg.passengers),
        date: leg.date,
        time: leg.time,
        aircraft: leg.aircraft,
        aircraftIcao: ac?.icaoType ?? "JETS",
      };
    };

    const payload = {
      tripType: isRoundTrip ? "roundtrip" : "oneway",
      oneWayLegs: legs.map(mapLeg),
      returnLegs: isRoundTrip && returnLegs.length > 0 ? returnLegs.map(mapLeg) : null,
      firstName: formData.firstName, lastName: formData.lastName,
      email: formData.email, phone: formData.phone,
      message: formData.message,
    };

    const res = await fetch(`${API.enquiries}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return { success: true, enquiryId: data.enquiryId };
  };

  const handleContactSubmit = async (formData: any, e?: React.FormEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    try {
      const result = await saveEnquiryToBackend(formData);
      if (result.success) {
        toast.success(`Enquiry submitted! ID: ${result.enquiryId}`);
        setLegs([{ ...emptyLeg }]); setReturnLegs([]);
        setIsRoundTrip(false); setEstimationResult(null); setShowContactForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit request. Please try again.");
    }
  };

  const renderLegCard = (leg: FlightLeg, idx: number, isReturn: boolean) => (
    <div key={idx} className="bg-slate-50/50 rounded-xl p-6 border border-slate-200 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="h-6 w-6 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
          style={{ backgroundColor: isReturn ? "hsl(var(--brand-purple))" : "hsl(var(--brand-navy))" }}
        >
          {isReturn ? `R${idx + 1}` : idx + 1}
        </div>
        <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">
          {isReturn ? "Return Flight Details" : "Flight Details"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AirportSearchField
          label="Departure Airport"
          value={leg.departure}
          placeholder={isReturn ? "Search Airport" : "Search Airport (e.g., Kolkata (CCU))"}
          onSelect={(val) => updateLeg(idx, "departure", val, isReturn)}
        />
        <AirportSearchField
          label="Arrival Airport"
          value={leg.arrival}
          placeholder={isReturn ? "Search Airport" : "Search Airport (e.g., Delhi (DEL))"}
          onSelect={(val) => updateLeg(idx, "arrival", val, isReturn)}
        />
        <div>
          <label className="block text-xs font-medium text-brand-navy mb-1">No of Passengers</label>
          <input type="number" value={leg.passengers} placeholder="0" min="1" max="500"
            onChange={(e) => handlePassengerChange(idx, e.target.value, isReturn, leg.aircraft)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple" />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-navy mb-1">Date Of Journey</label>
          <input type="date" value={leg.date}
            onChange={(e) => updateLeg(idx, "date", e.target.value, isReturn)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-navy mb-1">Time Of Journey</label>
          <input type="time" value={leg.time}
            onChange={(e) => updateLeg(idx, "time", e.target.value, isReturn)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm" />
        </div>
        <AircraftSelectField
          label={cfg.aircraftLabel}
          value={leg.aircraft}
          placeholder="Select Aircraft"
          passengers={parseInt(leg.passengers) || 0}
          isHelicopterMode={isHelicopterMode}
          onSelect={(val) => updateLeg(idx, "aircraft", val, isReturn)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:block w-1/3 bg-cover bg-center sticky top-0 h-screen"
        style={{ backgroundImage: `url(${cfg.image})` }} />

      <div className="flex-1 relative overflow-y-auto">
        <Link to="/aircraft-models"
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center hover:bg-brand-purple transition-colors z-30">
          <X className="w-5 h-5" />
        </Link>

        <div className="px-6 md:px-16 py-12 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl text-brand-navy uppercase tracking-tight">
              {cfg.title}
            </h1>
          </div>

          {!isHelicopterMode ? (
            <div className="space-y-6">
              {/* One Way */}
              <div className="mb-4">
                <div className="flex items-center justify-start gap-6 mb-4">
                  <h2 className="text-lg font-bold text-brand-navy">One Way Journey</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isRoundTrip}
                      onChange={(e) => handleRoundTripChange(e.target.checked)}
                      className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple" />
                    <span className="text-sm font-bold text-brand-navy uppercase tracking-widest">Round Trip</span>
                  </label>
                </div>
                {legs.map((leg, idx) => renderLegCard(leg, idx, false))}
                <button type="button" onClick={addLeg}
                  className="text-[10px] font-bold text-brand-navy uppercase tracking-widest flex items-center gap-1 hover:text-brand-purple mt-2">
                  <Plus size={12} /> Add Flight
                </button>
                {legs.length > 1 && (
                  <button type="button" onClick={() => removeLeg(false)}
                    className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 mt-2 ml-4">
                    <Minus size={12} /> Remove Last Flight
                  </button>
                )}
              </div>

              {/* Return */}
              {isRoundTrip && (
                <div className="mt-6">
                  <h2 className="text-lg font-bold text-brand-navy mb-3">Return Journey</h2>
                  {returnLegs.map((leg, idx) => renderLegCard(leg, idx, true))}
                  <button type="button" onClick={addReturnLeg}
                    className="text-[10px] font-bold text-brand-navy uppercase tracking-widest flex items-center gap-1 hover:text-brand-purple mt-2">
                    <Plus size={12} /> Add Return Flight
                  </button>
                  {returnLegs.length > 1 && (
                    <button type="button" onClick={() => removeLeg(true, returnLegs.length - 1)}
                      className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 mt-2 ml-4">
                      <Minus size={12} /> Remove Last Return Flight
                    </button>
                  )}
                </div>
              )}

              {/* Calculate */}
              <div className="flex justify-end mt-6">
                <button type="button" onClick={calculateEstimation} disabled={isCalculating}
                  className="bg-brand-navy text-white px-8 py-3 rounded-full font-bold text-[10px] tracking-widest hover:bg-brand-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isCalculating ? "CALCULATING…" : "VIEW ESTIMATE"}
                </button>
              </div>

              {/* Results */}
              {estimationResult && (
                <div className="mt-8 p-6 bg-gradient-to-r from-brand-purple/20 to-brand-navy/20 rounded-xl border-2 border-brand-purple">
                  <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">TOTAL ESTIMATION</h2>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-3 border-b border-brand-purple pb-2">One Way Journey</h3>
                    {estimationResult.breakdown.filter((b) => !b.isReturn).map((b, idx) => (
                      <div key={idx} className="mb-3 pb-2">
                        <p className="text-sm font-semibold text-brand-navy">Flight {idx + 1}: {b.aircraft}</p>
                        <div className="text-xs text-gray-600 ml-4 mb-1">{b.departure} → {b.arrival}</div>
                        <div className="flex justify-between text-sm ml-4">
                          <span>Duration: {formatDuration(b.actualMinutes)}</span>
                          <span>Passengers: {b.passengers}</span>
                          <span className="font-bold">{b.price > 0 ? `$${b.price.toLocaleString()}` : "—"}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-purple">
                      <span className="font-bold text-brand-navy">One Way Total:</span>
                      <span className="font-bold text-brand-purple text-xl">Quote on request</span>
                    </div>
                  </div>

                  {isRoundTrip && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-brand-navy mb-3 border-b border-brand-purple pb-2">Return Journey</h3>
                      {estimationResult.breakdown.filter((b) => b.isReturn).map((b, idx) => (
                        <div key={idx} className="mb-3 pb-2">
                          <p className="text-sm font-semibold text-brand-navy">Return Flight {idx + 1}: {b.aircraft}</p>
                          <div className="text-xs text-gray-600 ml-4 mb-1">{b.departure} → {b.arrival}</div>
                          <div className="flex justify-between text-sm ml-4">
                            <span>Duration: {formatDuration(b.actualMinutes)}</span>
                            <span>Passengers: {b.passengers}</span>
                            <span className="font-bold">—</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-purple">
                        <span className="font-bold text-brand-navy">Return Total:</span>
                        <span className="font-bold text-brand-purple text-xl">Quote on request</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-2 border-t-2 border-brand-purple bg-white/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-brand-navy">Grand Total:</span>
                      <span className="text-2xl font-bold text-brand-purple">Quote on request</span>
                    </div>
                  </div>
                </div>
              )}

              {showContactForm && estimationResult && (
                <ContactForm
                  totalPrice={estimationResult.totalPrice}
                  onSubmit={(fd, e) => handleContactSubmit(fd, e)}
                />
              )}
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-4xl border border-[#3b5998]/30 bg-white p-6 md:p-8 font-sans">
                <h2 className="mb-6 text-center text-3xl font-bold tracking-wide text-[#0f3080] md:text-4xl lg:text-5xl uppercase">
                  Helicopter Estimation
                </h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
                    try {
                      const res = await fetch(API.helicopterEnquiries, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      });
                      const result = await res.json();
                      if (res.ok && result.success) {
                        alert(`Enquiry submitted successfully! ID: ${result.enquiryId}`);
                        e.currentTarget.reset();
                      } else {
                        alert(`Failed to submit: ${result.error ?? "Unknown error"}`);
                      }
                    } catch (err) {
                      console.error("Helicopter form network error:", err);
                      alert("A network error occurred. Please try again later.");
                    }
                  }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">From</label>
                      <input type="text" name="from" placeholder="Departure Destination" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">To</label>
                      <input type="text" name="to" placeholder="Arrival Airport" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Date Of Journey</label>
                      <input type="date" name="dateOfJourney" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Time Of Journey</label>
                      <input type="time" name="timeOfJourney" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#4a5568]">No. Of Passengers</label>
                    <select name="passengers" defaultValue="" required
                      className="w-full appearance-none border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px",
                      }}>
                      <option value="" disabled hidden></option>
                      <option value="1">1 Passenger</option>
                      <option value="2">2 Passengers</option>
                      <option value="3">3 Passengers</option>
                      <option value="4">4 Passengers</option>
                      <option value="5">5+ Passengers</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">First Name</label>
                      <input type="text" name="firstName" placeholder="Your First Name" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Last Name</label>
                      <input type="text" name="lastName" placeholder="Your Last Name" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Email</label>
                      <input type="email" name="email" placeholder="Your Email Address" required
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Phone</label>
                      <div className="flex border border-gray-300 focus-within:border-[#0f3080] focus-within:ring-1 focus-within:ring-[#0f3080]">
                        <div className="flex items-center gap-1.5 bg-white pl-3 pr-2 border-r border-gray-200 text-sm text-gray-700">
                          <span className="inline-block w-5 h-3.5 bg-cover bg-center"
                            style={{ backgroundImage: `url('https://flagcdn.com/in.svg')` }} />
                          <span>+91</span>
                        </div>
                        <input type="tel" name="phone" required
                          className="w-full px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#4a5568]">Message</label>
                    <textarea name="message" rows={4} placeholder="Enter Your Requirements Here"
                      className="w-full resize-y border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]" />
                  </div>
                  <div className="pt-2">
                    <button type="submit"
                      className="w-full bg-[#0b246a] py-3 text-center text-sm font-bold tracking-wider text-white uppercase transition-colors duration-200 hover:bg-[#081b4f]">
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;