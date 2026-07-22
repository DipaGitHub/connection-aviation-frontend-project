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
  latitude: number | null;
  longitude: number | null;
}

type AircraftCategory = "light" | "medium" | "heavy" | "vip" | "helicopter" | "unknown";

interface Aircraft {
  id: number;
  name: string;
  aircraft_profile: number | string | null;
  cruise_speed: number | null;
  category: AircraftCategory;
  manufacturer: string;
  max_passengers: number | null;
}

interface FlightCalculatorLegResult {
  distance_nm: number | null;
  flight_time_minutes: number | null;
  block_time_minutes: number | null;
}

interface FlightCalculatorResponse {
  legs: FlightCalculatorLegResult[];
  total_distance_nm: number | null;
  total_flight_time_minutes: number | null;
  total_block_time_minutes: number | null;
}

interface FlightLeg {
  departure: string;
  departureIcao: string;
  departureLat: number | null;
  departureLng: number | null;
  arrival: string;
  arrivalIcao: string;
  arrivalLat: number | null;
  arrivalLng: number | null;
  passengers: string;
  date: string;
  time: string;
  aircraft: string;
  aircraftId: number | null;
  aircraftProfile: number | string | null;
  aircraftCategory: AircraftCategory;
  flightTimeMinutes: number | null;
  blockTimeMinutes: number | null;
  distanceNm: number | null;
  isCalculating?: boolean;
}

interface LegBreakdown {
  legIndex: number;
  passengers: number;
  aircraft: string;
  aircraftCategory: AircraftCategory;
  flightTimeMinutes: number;
  blockTimeMinutes: number;
  distanceNm: number;
  price: number | null;
  isReturn?: boolean;
  departure: string;
  arrival: string;
}

interface EstimationResult {
  totalFlightTimeMinutes: number;
  totalDistanceNm: number;
  totalPrice: number | null;
  breakdown: LegBreakdown[];
}

interface AviapagesErrorShape {
  detail?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Aviapages API Configuration
// ---------------------------------------------------------------------------

const AVIAPAGES_AIRPORTS_URL = `${API.aviapages}/airports/`;
const AVIAPAGES_AIRCRAFT_URL = `${API.aviapages}/charter_aircraft/`;
const AVIAPAGES_FLIGHT_CALCULATOR_URL = `${API.aviapages}/flight_calculator/`;

const OUR_FLEET: Aircraft[] = [
  { id: 1, name: "Phenom 300", aircraft_profile: "E55P", cruise_speed: 743, category: "light", manufacturer: "Embraer", max_passengers: 7 },
  { id: 2, name: "Learjet 60", aircraft_profile: "LJ60", cruise_speed: 778, category: "light", manufacturer: "Bombardier", max_passengers: 7 },
  { id: 3, name: "Challenger 300", aircraft_profile: "CL30", cruise_speed: 850, category: "medium", manufacturer: "Bombardier", max_passengers: 9 },
  { id: 4, name: "Legacy 500", aircraft_profile: "E550", cruise_speed: 860, category: "medium", manufacturer: "Embraer", max_passengers: 9 },
  { id: 5, name: "Citation Latitude", aircraft_profile: "C680", cruise_speed: 826, category: "medium", manufacturer: "Cessna", max_passengers: 9 },
  { id: 6, name: "Hawker 800XP", aircraft_profile: "H25B", cruise_speed: 793, category: "medium", manufacturer: "Hawker Beechcraft", max_passengers: 9 },
  { id: 7, name: "Legacy 650", aircraft_profile: "E135", cruise_speed: 850, category: "heavy", manufacturer: "Embraer", max_passengers: 14 },
  { id: 8, name: "Challenger 605", aircraft_profile: "CL60", cruise_speed: 850, category: "heavy", manufacturer: "Bombardier", max_passengers: 12 },
  { id: 9, name: "Global 6000", aircraft_profile: "GLEX", cruise_speed: 902, category: "heavy", manufacturer: "Bombardier", max_passengers: 14 },
  { id: 10, name: "Lineage 1000", aircraft_profile: "E190", cruise_speed: 870, category: "vip", manufacturer: "Embraer", max_passengers: 19 },
  { id: 11, name: "Airbus 319", aircraft_profile: "A319", cruise_speed: 828, category: "vip", manufacturer: "Airbus", max_passengers: 19 },
  { id: 12, name: "Boeing 737-500", aircraft_profile: "B735", cruise_speed: 795, category: "vip", manufacturer: "Boeing", max_passengers: 60 },
];


const config: Record<
  string,
  { title: string; image: string; aircraftLabel: string; isHelicopter?: boolean }
> = {
  "private-jet": { title: "PRIVATE JET ESTIMATION", image: privateJetImg, aircraftLabel: "Choose Type Of Aircraft", isHelicopter: false },
  "air-ambulance": { title: "AIR AMBULANCE ESTIMATION", image: airAmbulanceImg, aircraftLabel: "Choose Type Of Aircraft", isHelicopter: false },
  helicopter: { title: "HELICOPTER ESTIMATION", image: helicopterImg, aircraftLabel: "Choose Type Of Helicopter", isHelicopter: true },
};

const emptyLeg: FlightLeg = {
  departure: "", departureIcao: "", departureLat: null, departureLng: null,
  arrival: "", arrivalIcao: "", arrivalLat: null, arrivalLng: null,
  passengers: "", date: "", time: "",
  aircraft: "", aircraftId: null, aircraftProfile: null, aircraftCategory: "unknown",
  flightTimeMinutes: null, blockTimeMinutes: null, distanceNm: null,
  isCalculating: false,
};

// ---------------------------------------------------------------------------
// Utility Formatting Helpers
// ---------------------------------------------------------------------------

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// Hourly charter rates by aircraft category (USD per hour), sourced from
// the published rate card. Helicopters and unclassified aircraft don't have
// a fixed hourly rate here, so price falls back to "Contact for pricing".
const HOURLY_RATE_USD: Partial<Record<AircraftCategory, number>> = {
  light: 9500,
  medium: 12000,
  heavy: 14000,
  vip: 25000,
};

const MAX_SEATS_BY_CATEGORY: Partial<Record<AircraftCategory, number>> = {
  light: 7,
  medium: 9,
  heavy: 14,
  vip: 60,
};

// Picks the smallest jet category that comfortably seats the given number
// of passengers, matching the rate card (Light ≤7, Medium ≤9, Heavy ≤14).
function categoryForPassengers(passengers: number): AircraftCategory {
  if (passengers <= (MAX_SEATS_BY_CATEGORY.light ?? 7)) return "light";
  if (passengers <= (MAX_SEATS_BY_CATEGORY.medium ?? 9)) return "medium";
  if (passengers <= (MAX_SEATS_BY_CATEGORY.heavy ?? 14)) return "heavy";
  return "vip";
}

function getHourlyRate(category: AircraftCategory): number | null {
  return HOURLY_RATE_USD[category] ?? null;
}

function calculateLegPrice(flightTimeMinutes: number, category: AircraftCategory): number | null {
  const rate = getHourlyRate(category);
  if (rate === null) return null;
  const hours = flightTimeMinutes / 60;
  return Math.round(hours * rate);
}

function formatCurrencyUSD(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Great-circle distance between two lat/lng points, in nautical miles.
// Aviapages' flight_calculator endpoint doesn't return distance, so we
// derive it ourselves from the airport coordinates we already have.
function haversineDistanceNm(
  lat1: number | null, lng1: number | null, lat2: number | null, lng2: number | null,
): number | null {
  if (lat1 === null || lng1 === null || lat2 === null || lng2 === null) return null;
  const R_NM = 3440.065; // Earth's radius in nautical miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_NM * c;
}

class AircraftUnavailableError extends Error {
  aircraftProfile: number | string | null;
  constructor(message: string, aircraftProfile: number | string | null) {
    super(message);
    this.name = "AircraftUnavailableError";
    this.aircraftProfile = aircraftProfile;
  }
}

// Shared, module-level set so every open aircraft dropdown stays in sync
// once an aircraft profile is found to be unavailable (under construction /
// not found on Aviapages). Dropdowns filter against this set and listen for
// the "aircraft-unavailable" event to remove it live without a refetch.
const unavailableAircraftIds = new Set<number>();
function markAircraftUnavailable(id: number | string | null) {
  if (id === null) return;
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(numId)) return;
  unavailableAircraftIds.add(numId);
  window.dispatchEvent(new CustomEvent("aircraft-unavailable", { detail: { id: numId } }));
}

async function parseErrorMessage(res: Response): Promise<string> {
  switch (res.status) {
    case 401:
      return "Authentication with the flight data provider failed. Please contact support.";
    case 404:
      return "The requested data could not be found.";
    case 429:
      return "Too many requests right now. Please wait a moment and try again.";
    case 500:
      return "The flight data provider is currently unavailable. Please try again shortly.";
    default:
      break;
  }
  try {
    const body = (await res.json()) as AviapagesErrorShape;
    return body.detail ?? body.message ?? `Request failed (${res.status}).`;
  } catch {
    return `Request failed (${res.status}).`;
  }
}

// ---------------------------------------------------------------------------
// Aviapages API Integration Layer
// ---------------------------------------------------------------------------

interface RawAviapagesAirport {
  icao?: string | null;
  iata?: string | null;
  name?: string | null;
  city?: any;
  country?: any;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

function toNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return Number.isFinite(n) ? n : null;
}

function mapAirport(raw: RawAviapagesAirport): Airport {
  const extractString = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val.name) return String(val.name);
    return String(val);
  };
  return {
    icao: extractString(raw.icao),
    iata: extractString(raw.iata),
    name: extractString(raw.name),
    city: extractString(raw.city),
    country: extractString(raw.country),
    latitude: toNumberOrNull(raw.latitude),
    longitude: toNumberOrNull(raw.longitude),
  };
}

async function fetchAirportsFromAPI(query: string, signal?: AbortSignal): Promise<Airport[]> {
  const url = `${AVIAPAGES_AIRPORTS_URL}?search=${encodeURIComponent(query)}`;
  const res = await fetch(url, { method: "GET", signal });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = await res.json();
  const results: RawAviapagesAirport[] = Array.isArray(data) ? data : data?.results ?? [];
  return results.map(mapAirport);
}

interface RawAviapagesAircraft {
  id: number;
  name?: string | null;
  type?: string | null;
  aircraft_type?: { id?: number; name?: string } | null;
  registration_number?: string | null;
  aircraft_profile?: number | null;
  aircraft_profile_id?: number | null;
  cruise_speed?: number | string | null;
  category?: string | null;
  manufacturer?: string | null;
  seats?: number | string | null;
  max_passengers?: number | string | null;
  passengers_max?: number | string | null;
}

function classifyCategory(raw: RawAviapagesAircraft): AircraftCategory {
  const c = (raw.category ?? "").toString().toLowerCase();
  if (c.includes("light")) return "light";
  if (c.includes("medium") || c.includes("midsize") || c.includes("mid-size")) return "medium";
  if (c.includes("heavy")) return "heavy";
  if (c.includes("helicopter") || c.includes("heli")) return "helicopter";
  return "unknown";
}

function mapAircraft(raw: RawAviapagesAircraft): Aircraft {
  const name = raw.name ?? raw.type ?? raw.aircraft_type?.name ?? raw.registration_number ?? "Unknown Aircraft";
  return {
    id: raw.id,
    name,
    aircraft_profile: raw.aircraft_profile ?? raw.aircraft_profile_id ?? raw.aircraft_type?.id ?? null,
    cruise_speed: toNumberOrNull(raw.cruise_speed),
    category: classifyCategory(raw),
    manufacturer: raw.manufacturer ?? "",
    max_passengers: toNumberOrNull(raw.max_passengers ?? raw.passengers_max ?? raw.seats),
  };
}

async function fetchAircraftFromAPI(
  category: AircraftCategory,
  signal?: AbortSignal,
): Promise<Aircraft[]> {
  const url = new URL(AVIAPAGES_AIRCRAFT_URL);
  if (category !== "unknown") url.searchParams.set("category", category);
  const res = await fetch(url.toString(), { method: "GET", signal });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = await res.json();
  const results: RawAviapagesAircraft[] = Array.isArray(data) ? data : data?.results ?? [];
  const mapped = results.map(mapAircraft);
  // Some Aviapages deployments do not support server-side category filtering;
  // apply a client-side safety filter so the dropdown always matches the requested tier.
  return category === "unknown" ? mapped : mapped.filter((a) => a.category === category || a.category === "unknown");
}

interface FlightCalculatorRequestLeg {
  departure_icao: string;
  arrival_icao: string;
  aircraft_profile: number | string;
  aircraft_name: string;
  passengers: number;
}

interface FlightCalculatorRequestBody {
  legs: FlightCalculatorRequestLeg[];
}

interface RawFlightCalculatorLeg {
  distance_nm?: number | string | null;
  flight_time_minutes?: number | string | null;
  block_time_minutes?: number | string | null;
}

interface RawFlightCalculatorResponse {
  legs?: RawFlightCalculatorLeg[];
  total_distance_nm?: number | string | null;
  total_flight_time_minutes?: number | string | null;
  total_block_time_minutes?: number | string | null;
}

async function calculateFlight(
  legs: FlightCalculatorRequestLeg[],
  signal?: AbortSignal,
): Promise<FlightCalculatorResponse> {
  const body: FlightCalculatorRequestBody = { legs };
  const res = await fetch(AVIAPAGES_FLIGHT_CALCULATOR_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    if (res.status === 422) {
      try {
        const errBody = await res.clone().json();
        if (errBody?.error === "AIRCRAFT_UNAVAILABLE") {
          throw new AircraftUnavailableError(
            errBody.message ?? "This aircraft is unavailable for the selected route. Please choose another aircraft.",
            errBody.aircraft_profile ?? null,
          );
        }
      } catch (e) {
        if (e instanceof AircraftUnavailableError) throw e;
      }
    }
    throw new Error(await parseErrorMessage(res));
  }
  const data: RawFlightCalculatorResponse = await res.json();
  const mappedLegs: FlightCalculatorLegResult[] = (data.legs ?? []).map((leg) => ({
    distance_nm: toNumberOrNull(leg.distance_nm),
    flight_time_minutes: toNumberOrNull(leg.flight_time_minutes),
    block_time_minutes: toNumberOrNull(leg.block_time_minutes),
  }));

  return {
    legs: mappedLegs,
    total_distance_nm: toNumberOrNull(data.total_distance_nm) ??
      mappedLegs.reduce((sum, l) => sum + (l.distance_nm ?? 0), 0),
    total_flight_time_minutes: toNumberOrNull(data.total_flight_time_minutes) ??
      mappedLegs.reduce((sum, l) => sum + (l.flight_time_minutes ?? 0), 0),
    total_block_time_minutes: toNumberOrNull(data.total_block_time_minutes) ??
      mappedLegs.reduce((sum, l) => sum + (l.block_time_minutes ?? 0), 0),
  };
}

// ---------------------------------------------------------------------------
// AirportSearchField Component
// ---------------------------------------------------------------------------

const AirportSearchField = ({
  label, value, onSelect, placeholder,
}: {
  label: string;
  value: string;
  onSelect: (display: string, airport: Airport | null) => void;
  placeholder: string;
}) => {
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const results = await fetchAirportsFromAPI(query, controller.signal);
      setSuggestions(results);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSuggestions([]);
      setErrorMsg(err instanceof Error ? err.message : "Unable to search airports right now.");
    } finally {
      setIsLoading(false);
      setShowDropdown(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.value, null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 400);
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

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

      {isLoading && (
        <p className="mt-1 text-[10px] text-slate-400">Searching airports…</p>
      )}
      {errorMsg && !isLoading && (
        <p className="mt-1 text-[10px] text-red-500">{errorMsg}</p>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button key={`${airport.icao || airport.iata}-${index}`} type="button"
              onClick={() => {
                onSelect(`${airport.city || airport.name} (${airport.iata || airport.icao})`, airport);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
              <p className="text-xs font-bold text-brand-navy">
                {airport.name} {airport.iata ? `(${airport.iata})` : ""} {airport.icao ? `· ${airport.icao}` : ""}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{airport.city}, {airport.country}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// AircraftSelectField Component (Sourced live from Aviapages charter_aircraft API)
// ---------------------------------------------------------------------------

const AircraftSelectField = ({
  label, value, onSelect, passengers, placeholder, isHelicopterMode,
}: {
  label: string;
  value: string;
  onSelect: (aircraft: Aircraft | null) => void;
  passengers: number;
  placeholder: string;
  isHelicopterMode: boolean;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let activeCategory: AircraftCategory | "all" = "light";
  if (isHelicopterMode) {
    activeCategory = "helicopter";
  } else {
    if (passengers <= 7) activeCategory = "light";
    else if (passengers > 7 && passengers <= 9) activeCategory = "medium";
    else if (passengers > 9 && passengers <= 14) activeCategory = "heavy";
    else if (passengers > 14) activeCategory = "vip";
  }

  // Filter OUR_FLEET directly
  const aircraftList = OUR_FLEET.filter((a) => a.category === activeCategory || (activeCategory as string) === "all");

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const categoryLabel =
    activeCategory === "light" ? "Light"
      : activeCategory === "medium" ? "Medium"
        : activeCategory === "heavy" ? "Heavy"
          : activeCategory === "vip" ? "VIP Airliner"
            : activeCategory === "helicopter" ? "Helicopter"
              : "All";

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
            {value || `${placeholder} (${categoryLabel})`}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-xl max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
            {categoryLabel} Class Fleet Options
          </div>
          {aircraftList.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No matching aircraft found for this layout.
            </div>
          ) : (
            aircraftList.map((ac) => (
              <button
                key={ac.id}
                type="button"
                onClick={() => { onSelect(ac); setShowDropdown(false); }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <p className="text-sm font-medium text-brand-navy">{ac.name}</p>
                <p className="text-xs text-gray-500">
                  {ac.manufacturer ? `${ac.manufacturer} · ` : ""}
                  {ac.max_passengers ? `Max Passengers: ${ac.max_passengers} pax · ` : ""}
                  {ac.cruise_speed ? `Cruise: ${ac.cruise_speed} km/h` : ""}
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

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const ContactForm = ({
  onSubmit,
}: {
  onSubmit: (data: ContactFormData, e?: React.FormEvent) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
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

  const updateLeg = (idx: number, field: keyof FlightLeg, value: FlightLeg[keyof FlightLeg], isReturn = false) => {
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
    if (checked) {
      setReturnLegs(legs.map((leg) => ({
        ...emptyLeg, departure: leg.arrival, departureIcao: leg.arrivalIcao, arrival: "",
      })));
    } else {
      setReturnLegs([]);
    }
    setEstimationResult(null); setShowContactForm(false);
  };

  const handleAirportSelect = (
    idx: number, field: "departure" | "arrival", display: string, airport: Airport | null, isReturn: boolean,
  ) => {
    (isReturn ? setReturnLegs : setLegs)((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        if (field === "departure") {
          return {
            ...l, departure: display, departureIcao: airport?.icao || airport?.iata || "",
            departureLat: airport?.latitude ?? null, departureLng: airport?.longitude ?? null,
          };
        }
        return {
          ...l, arrival: display, arrivalIcao: airport?.icao || airport?.iata || "",
          arrivalLat: airport?.latitude ?? null, arrivalLng: airport?.longitude ?? null,
        };
      }),
    );
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const handleAircraftSelect = (idx: number, aircraft: Aircraft | null, isReturn: boolean) => {
    (isReturn ? setReturnLegs : setLegs)((prev) =>
      prev.map((l, i) =>
        i === idx
          ? {
            ...l,
            aircraft: aircraft?.name ?? "",
            aircraftId: aircraft?.id ?? null,
            aircraftProfile: aircraft?.aircraft_profile ?? null,
            aircraftCategory: aircraft?.category ?? "unknown",
          }
          : l,
      ),
    );

    const leg = (isReturn ? returnLegs : legs)[idx];
    const n = parseInt(leg.passengers);
    if (aircraft?.max_passengers && !isNaN(n) && n > aircraft.max_passengers) {
      toast.warning(`Please select a larger aircraft configuration suitable for ${n} passengers.`);
    }

    setEstimationResult(null);
    setShowContactForm(false);
  };

  const handlePassengerChange = (idx: number, value: string, isReturn: boolean) => {
    updateLeg(idx, "passengers", value, isReturn);
  };

  const validateLeg = (leg: FlightLeg, legIdx: number, isReturn: boolean): boolean => {
    const n = parseInt(leg.passengers);
    if (!leg.departureIcao || !leg.arrivalIcao || !leg.aircraftProfile || isNaN(n) || n <= 0) {
      toast.error(
        `Please complete all fields (select airports and aircraft from the lists) for ${isReturn ? "return " : ""}leg ${legIdx + 1}.`,
      );
      return false;
    }
    return true;
  };

  const calculateEstimation = async () => {
    for (let i = 0; i < legs.length; i++) {
      if (!validateLeg(legs[i], i, false)) return;
    }
    if (isRoundTrip) {
      for (let i = 0; i < returnLegs.length; i++) {
        if (!validateLeg(returnLegs[i], i, true)) return;
      }
    }

    setIsCalculating(true);
    try {
      const allLegs = [
        ...legs.map((l) => ({ leg: l, isReturn: false })),
        ...(isRoundTrip ? returnLegs.map((l) => ({ leg: l, isReturn: true })) : []),
      ];

      const requestLegs: FlightCalculatorRequestLeg[] = allLegs.map(({ leg }) => ({
        departure_icao: leg.departureIcao,
        arrival_icao: leg.arrivalIcao,
        aircraft_profile: leg.aircraftProfile as number,
        aircraft_name: leg.aircraft,
        passengers: parseInt(leg.passengers) || 1,
      }));

      const result = await calculateFlight(requestLegs);

      const breakdown: LegBreakdown[] = allLegs.map(({ leg, isReturn }, i) => {
        const calcLeg = result.legs[i] ?? { distance_nm: 0, flight_time_minutes: 0, block_time_minutes: 0 };
        const passengers = parseInt(leg.passengers);
        const blockTimeMinutes = calcLeg.block_time_minutes ?? calcLeg.flight_time_minutes ?? 0;

        // Aviapages doesn't return distance, so derive it from the airports'
        // own coordinates; fall back to the API value if it ever provides one.
        const computedDistance = haversineDistanceNm(
          leg.departureLat, leg.departureLng, leg.arrivalLat, leg.arrivalLng,
        );
        const distanceNm = (calcLeg.distance_nm && calcLeg.distance_nm > 0)
          ? calcLeg.distance_nm
          : (computedDistance ?? 0);

        // Use the selected aircraft's own category when known; otherwise
        // fall back to the rate-card tier implied by the passenger count.
        const category = leg.aircraftCategory !== "unknown" ? leg.aircraftCategory : categoryForPassengers(passengers || 1);
        const price = calculateLegPrice(calcLeg.flight_time_minutes ?? 0, category);

        return {
          legIndex: i,
          passengers,
          aircraft: leg.aircraft,
          aircraftCategory: category,
          flightTimeMinutes: calcLeg.flight_time_minutes ?? 0,
          blockTimeMinutes,
          distanceNm,
          price,
          isReturn,
          departure: leg.departure,
          arrival: leg.arrival,
        };
      });

      const totalPrice = breakdown.some((b) => b.price === null)
        ? null
        : breakdown.reduce((sum, b) => sum + (b.price ?? 0), 0);

      setEstimationResult({
        totalFlightTimeMinutes: result.total_flight_time_minutes ?? 0,
        totalDistanceNm: breakdown.reduce((sum, b) => sum + b.distanceNm, 0),
        totalPrice,
        breakdown,
      });
      setShowContactForm(true);
      toast.success("Flight calculation complete! Please fill out the form below to request your custom quote.");
    } catch (err) {
      if (err instanceof AircraftUnavailableError) {
        markAircraftUnavailable(err.aircraftProfile);
        toast.error(`${err.message} Please select a different aircraft and try again.`);
      } else {
        toast.error(err instanceof Error ? err.message : "Unable to calculate the flight right now.");
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const saveEnquiryToBackend = async (formData: ContactFormData) => {
    const mapLeg = (leg: FlightLeg, idx: number) => ({
      leg_number: idx + 1,
      departure: leg.departure,
      departureIcao: leg.departureIcao,
      arrival: leg.arrival,
      arrivalIcao: leg.arrivalIcao,
      passengers: parseInt(leg.passengers),
      date: leg.date,
      time: leg.time,
      aircraft: leg.aircraft,
      flightTimeMinutes: leg.flightTimeMinutes,
      blockTimeMinutes: leg.blockTimeMinutes,
      distanceNm: leg.distanceNm,
    });

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

  const handleContactSubmit = async (formData: ContactFormData, e?: React.FormEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    try {
      const result = await saveEnquiryToBackend(formData);
      if (result.success) {
        toast.success(`Enquiry submitted! ID: ${result.enquiryId}`);
        setLegs([{ ...emptyLeg }]); setReturnLegs([]);
        setIsRoundTrip(false); setEstimationResult(null); setShowContactForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request. Please try again.");
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
          onSelect={(display, airport) => handleAirportSelect(idx, "departure", display, airport, isReturn)}
        />
        <AirportSearchField
          label="Arrival Airport"
          value={leg.arrival}
          placeholder={isReturn ? "Search Airport" : "Search Airport (e.g., Delhi (DEL))"}
          onSelect={(display, airport) => handleAirportSelect(idx, "arrival", display, airport, isReturn)}
        />
        <div>
          <label className="block text-xs font-medium text-brand-navy mb-1">No of Passengers</label>
          <input type="number" value={leg.passengers} placeholder="0" min="1" max="500"
            onChange={(e) => handlePassengerChange(idx, e.target.value, isReturn)}
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
          onSelect={(aircraft) => handleAircraftSelect(idx, aircraft, isReturn)}
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
                  <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">FLIGHT ESTIMATION</h2>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-3 border-b border-brand-purple pb-2">One Way Journey</h3>
                    {estimationResult.breakdown.filter((b) => !b.isReturn).map((b, idx) => (
                      <div key={idx} className="mb-3 pb-2">
                        <p className="text-sm font-semibold text-brand-navy">Flight {idx + 1}: {b.aircraft}</p>
                        <div className="text-xs text-gray-600 ml-4 mb-1">{b.departure} → {b.arrival}</div>
                        <div className="flex justify-between text-sm ml-4">
                          {/* Time estimation hidden from frontend per request
                          <span>Flight Time: {formatDuration(b.flightTimeMinutes)}</span>
                          <span>Block Time: {formatDuration(b.blockTimeMinutes)}</span>
                          */}
                          <span>Distance: {Math.round(b.distanceNm)} nm</span>
                          <span>Passengers: {b.passengers}</span>
                        </div>
                        <div className="flex justify-between text-sm ml-4 mt-1">
                          <span className="capitalize text-gray-500">{b.aircraftCategory} Jet</span>
                          <span className="font-semibold text-brand-navy">
                            {b.price !== null ? formatCurrencyUSD(b.price) : "Contact for pricing"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Time estimation hidden from frontend per request
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-purple">
                      <span className="font-bold text-brand-navy">One Way Total Flight Time:</span>
                      <span className="font-bold text-brand-purple text-xl">
                        {formatDuration(
                          estimationResult.breakdown
                            .filter((b) => !b.isReturn)
                            .reduce((sum, b) => sum + b.flightTimeMinutes, 0),
                        )}
                      </span>
                    </div>
                    */}
                  </div>

                  {isRoundTrip && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-brand-navy mb-3 border-b border-brand-purple pb-2">Return Journey</h3>
                      {estimationResult.breakdown.filter((b) => b.isReturn).map((b, idx) => (
                        <div key={idx} className="mb-3 pb-2">
                          <p className="text-sm font-semibold text-brand-navy">Return Flight {idx + 1}: {b.aircraft}</p>
                          <div className="text-xs text-gray-600 ml-4 mb-1">{b.departure} → {b.arrival}</div>
                          <div className="flex justify-between text-sm ml-4">
                            {/* Time estimation hidden from frontend per request
                            <span>Flight Time: {formatDuration(b.flightTimeMinutes)}</span>
                            <span>Block Time: {formatDuration(b.blockTimeMinutes)}</span>
                            */}
                            <span>Distance: {Math.round(b.distanceNm)} nm</span>
                            <span>Passengers: {b.passengers}</span>
                          </div>
                          <div className="flex justify-between text-sm ml-4 mt-1">
                            <span className="capitalize text-gray-500">{b.aircraftCategory} Jet</span>
                            <span className="font-semibold text-brand-navy">
                              {b.price !== null ? formatCurrencyUSD(b.price) : "Contact for pricing"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {/* Time estimation hidden from frontend per request
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-purple">
                        <span className="font-bold text-brand-navy">Return Total Flight Time:</span>
                        <span className="font-bold text-brand-purple text-xl">
                          {formatDuration(
                            estimationResult.breakdown
                              .filter((b) => b.isReturn)
                              .reduce((sum, b) => sum + b.flightTimeMinutes, 0),
                          )}
                        </span>
                      </div>
                      */}
                    </div>
                  )}

                  <div className="pt-4 mt-2 border-t-2 border-brand-purple bg-white/30 rounded-lg p-4">
                    {/* Time estimation hidden from frontend per request
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-brand-navy">Total Flight Time:</span>
                      <span className="text-2xl font-bold text-brand-purple">
                        {formatDuration(estimationResult.totalFlightTimeMinutes)}
                      </span>
                    </div>
                    */}
                    {/* <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-bold text-brand-navy">Total Distance:</span>
                      <span className="text-sm font-bold text-brand-purple">
                        {Math.round(estimationResult.totalDistanceNm)} nm
                      </span>
                    </div> */}
                    <div className="flex justify-between items-center  border-brand-purple/40">
                      <span className="text-xl font-bold text-brand-navy">Total Estimated Price:</span>
                      <span className="text-2xl font-bold text-brand-purple">
                        {estimationResult.totalPrice !== null ? formatCurrencyUSD(estimationResult.totalPrice) : "Contact for pricing"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showContactForm && estimationResult && (
                <ContactForm onSubmit={(fd, e) => handleContactSubmit(fd, e)} />
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