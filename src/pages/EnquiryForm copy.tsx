import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { X, Loader2, Search, Plus, Minus, ChevronDown } from "lucide-react";
import { API } from "@/services/api";
import { toast } from "sonner";

// Assets (Ensure these paths exist in your project)
import logo from "@/assets/logo.png";
import privateJetImg from "@/assets/service-private-jet.jpg";
import helicopterImg from "@/assets/service-helicopter.jpg";
import airAmbulanceImg from "@/assets/service-air-ambulance.jpg";

// --- Airport Data (from your provided list) ---
interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
}

// Major airports worldwide for autocomplete
const airports: Airport[] = [
  // India
  { icao: "VECC", iata: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "India" },
  { icao: "VIDP", iata: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India" },
  { icao: "VABB", iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India" },
  { icao: "VOBL", iata: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India" },
  { icao: "VOMM", iata: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India" },
  { icao: "VOHS", iata: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India" },
  { icao: "VAAH", iata: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", country: "India" },
  { icao: "VOCI", iata: "COK", name: "Cochin International Airport", city: "Kochi", country: "India" },
  { icao: "VOGO", iata: "GOI", name: "Goa International Airport", city: "Goa", country: "India" },
  { icao: "VOPB", iata: "IXR", name: "Birsa Munda Airport", city: "Ranchi", country: "India" },
  { icao: "VAAU", iata: "IXU", name: "Aurangabad Airport", city: "Aurangabad", country: "India" },
  { icao: "VEJP", iata: "IXB", name: "Bagdogra Airport", city: "Siliguri", country: "India" },
  { icao: "VILK", iata: "LKO", name: "Chaudhary Charan Singh International Airport", city: "Lucknow", country: "India" },
  { icao: "VOPN", iata: "PNQ", name: "Pune Airport", city: "Pune", country: "India" },
  { icao: "VIJP", iata: "JAI", name: "Jaipur International Airport", city: "Jaipur", country: "India" },
  { icao: "VOTV", iata: "TRV", name: "Trivandrum International Airport", city: "Thiruvananthapuram", country: "India" },
  { icao: "VEBS", iata: "IXG", name: "Biju Patnaik International Airport", city: "Bhubaneswar", country: "India" },
  { icao: "VEGT", iata: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", city: "Guwahati", country: "India" },
  { icao: "VOML", iata: "IXE", name: "Mangalore International Airport", city: "Mangalore", country: "India" },
  { icao: "VICG", iata: "IXC", name: "Chandigarh International Airport", city: "Chandigarh", country: "India" },
  { icao: "VANP", iata: "NAG", name: "Dr. Babasaheb Ambedkar International Airport", city: "Nagpur", country: "India" },
  { icao: "VAID", iata: "IDR", name: "Devi Ahilyabai Holkar Airport", city: "Indore", country: "India" },
  { icao: "VABP", iata: "BHO", name: "Raja Bhoj Airport", city: "Bhopal", country: "India" },
  { icao: "VASU", iata: "STV", name: "Surat Airport", city: "Surat", country: "India" },
  { icao: "VARP", iata: "RPR", name: "Swami Vivekananda Airport", city: "Raipur", country: "India" },
  { icao: "VEPT", iata: "PAT", name: "Jay Prakash Narayan International Airport", city: "Patna", country: "India" },
  { icao: "VABJ", iata: "BDQ", name: "Vadodara Airport", city: "Vadodara", country: "India" },
  { icao: "VOCL", iata: "CCJ", name: "Calicut International Airport", city: "Kozhikode", country: "India" },
  { icao: "VEIM", iata: "IMF", name: "Imphal International Airport", city: "Imphal", country: "India" },
  { icao: "VEAT", iata: "AGR", name: "Agra Airport", city: "Agra", country: "India" },
  { icao: "VIDN", iata: "DED", name: "Jolly Grant Airport", city: "Dehradun", country: "India" },
  { icao: "VIAR", iata: "ATQ", name: "Sri Guru Ram Dass Jee International Airport", city: "Amritsar", country: "India" },
  { icao: "VEVZ", iata: "VNS", name: "Lal Bahadur Shastri International Airport", city: "Varanasi", country: "India" },
  { icao: "VISR", iata: "SXR", name: "Sheikh ul-Alam International Airport", city: "Srinagar", country: "India" },
  { icao: "VILH", iata: "IXL", name: "Kushok Bakula Rimpochee Airport", city: "Leh", country: "India" },
  { icao: "VOCP", iata: "CJB", name: "Coimbatore International Airport", city: "Coimbatore", country: "India" },
  { icao: "VOMG", iata: "MYQ", name: "Mysore Airport", city: "Mysore", country: "India" },
  { icao: "VOTJ", iata: "TRZ", name: "Tiruchirappalli International Airport", city: "Tiruchirappalli", country: "India" },
  { icao: "VOMD", iata: "IXM", name: "Madurai Airport", city: "Madurai", country: "India" },
  { icao: "VORY", iata: "RJA", name: "Rajahmundry Airport", city: "Rajahmundry", country: "India" },
  { icao: "VOVZ", iata: "VGA", name: "Vijayawada Airport", city: "Vijayawada", country: "India" },
  { icao: "VOTK", iata: "TIR", name: "Tirupati Airport", city: "Tirupati", country: "India" },
  { icao: "VAUD", iata: "UDR", name: "Maharana Pratap Airport", city: "Udaipur", country: "India" },
  { icao: "VAJJ", iata: "JGA", name: "Jamnagar Airport", city: "Jamnagar", country: "India" },
  { icao: "VARK", iata: "RJK", name: "Rajkot Airport", city: "Rajkot", country: "India" },
  { icao: "VABV", iata: "BHJ", name: "Bhuj Airport", city: "Bhuj", country: "India" },
  { icao: "VAKE", iata: "HBX", name: "Hubli Airport", city: "Hubli", country: "India" },
  { icao: "VOBG", iata: "IXJ", name: "Jammu Airport", city: "Jammu", country: "India" },
  { icao: "VIPT", iata: "PGH", name: "Pantnagar Airport", city: "Pantnagar", country: "India" },
  { icao: "VEGY", iata: "GAY", name: "Gaya Airport", city: "Gaya", country: "India" },
  { icao: "VEJS", iata: "IXW", name: "Sonari Airport", city: "Jamshedpur", country: "India" },
  // United States
  { icao: "KJFK", iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States" },
  { icao: "KLAX", iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
  { icao: "KORD", iata: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States" },
  { icao: "KDFW", iata: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States" },
  { icao: "KDEN", iata: "DEN", name: "Denver International Airport", city: "Denver", country: "United States" },
  { icao: "KATL", iata: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States" },
  { icao: "KSFO", iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States" },
  { icao: "KLAS", iata: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States" },
  { icao: "KSEA", iata: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States" },
  { icao: "KMIA", iata: "MIA", name: "Miami International Airport", city: "Miami", country: "United States" },
  { icao: "KBOS", iata: "BOS", name: "Logan International Airport", city: "Boston", country: "United States" },
  { icao: "KEWR", iata: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "United States" },
  { icao: "KMSP", iata: "MSP", name: "Minneapolis–Saint Paul International Airport", city: "Minneapolis", country: "United States" },
  { icao: "KPHL", iata: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States" },
  { icao: "KPHX", iata: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States" },
  { icao: "KIAH", iata: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States" },
  { icao: "KDCA", iata: "DCA", name: "Ronald Reagan Washington National Airport", city: "Washington D.C.", country: "United States" },
  { icao: "KIAD", iata: "IAD", name: "Washington Dulles International Airport", city: "Washington D.C.", country: "United States" },
  { icao: "KSAN", iata: "SAN", name: "San Diego International Airport", city: "San Diego", country: "United States" },
  { icao: "KTPA", iata: "TPA", name: "Tampa International Airport", city: "Tampa", country: "United States" },
  { icao: "KMCO", iata: "MCO", name: "Orlando International Airport", city: "Orlando", country: "United States" },
  { icao: "KBWI", iata: "BWI", name: "Baltimore/Washington International Airport", city: "Baltimore", country: "United States" },
  { icao: "KCLT", iata: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States" },
  { icao: "KSLC", iata: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States" },
  { icao: "KPDX", iata: "PDX", name: "Portland International Airport", city: "Portland", country: "United States" },
  { icao: "KSTL", iata: "STL", name: "St. Louis Lambert International Airport", city: "St. Louis", country: "United States" },
  { icao: "KAUS", iata: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States" },
  { icao: "KHNL", iata: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "United States" },
  // United Kingdom
  { icao: "EGLL", iata: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { icao: "EGKK", iata: "LGW", name: "Gatwick Airport", city: "London", country: "United Kingdom" },
  { icao: "EGSS", iata: "STN", name: "Stansted Airport", city: "London", country: "United Kingdom" },
  { icao: "EGLC", iata: "LCY", name: "London City Airport", city: "London", country: "United Kingdom" },
  { icao: "EGCC", iata: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom" },
  { icao: "EGBB", iata: "BHX", name: "Birmingham Airport", city: "Birmingham", country: "United Kingdom" },
  { icao: "EGGD", iata: "BRS", name: "Bristol Airport", city: "Bristol", country: "United Kingdom" },
  { icao: "EGPH", iata: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom" },
  { icao: "EGPF", iata: "GLA", name: "Glasgow Airport", city: "Glasgow", country: "United Kingdom" },
  // Europe
  { icao: "LFPG", iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { icao: "LFPO", iata: "ORY", name: "Orly Airport", city: "Paris", country: "France" },
  { icao: "EDDF", iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { icao: "EDDM", iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { icao: "EDDB", iata: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany" },
  { icao: "EHAM", iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
  { icao: "LEMD", iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain" },
  { icao: "LEBL", iata: "BCN", name: "Barcelona–El Prat Airport", city: "Barcelona", country: "Spain" },
  { icao: "LIRF", iata: "FCO", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy" },
  { icao: "LIMC", iata: "MXP", name: "Milan Malpensa Airport", city: "Milan", country: "Italy" },
  { icao: "LSZH", iata: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { icao: "LOWW", iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria" },
  { icao: "EBBR", iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { icao: "EKCH", iata: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { icao: "ESSA", iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden" },
  { icao: "ENGM", iata: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", country: "Norway" },
  { icao: "EFHK", iata: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland" },
  { icao: "EIDW", iata: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { icao: "LPPT", iata: "LIS", name: "Lisbon Airport", city: "Lisbon", country: "Portugal" },
  { icao: "LGAV", iata: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece" },
  { icao: "LTFM", iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { icao: "UUEE", iata: "SVO", name: "Sheremetyevo International Airport", city: "Moscow", country: "Russia" },
  { icao: "EPWA", iata: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland" },
  { icao: "LKPR", iata: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic" },
  { icao: "LHBP", iata: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary" },
  // Middle East
  { icao: "OMDB", iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates" },
  { icao: "OMDW", iata: "DWC", name: "Al Maktoum International Airport", city: "Dubai", country: "United Arab Emirates" },
  { icao: "OMAA", iata: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "United Arab Emirates" },
  { icao: "OTHH", iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
  { icao: "OEJN", iata: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia" },
  { icao: "OERK", iata: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia" },
  { icao: "OBBI", iata: "BAH", name: "Bahrain International Airport", city: "Manama", country: "Bahrain" },
  { icao: "OOMS", iata: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman" },
  { icao: "OKBK", iata: "KWI", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait" },
  { icao: "OIIE", iata: "IKA", name: "Imam Khomeini International Airport", city: "Tehran", country: "Iran" },
  { icao: "LLBG", iata: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel" },
  // Asia
  { icao: "VHHH", iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
  { icao: "WSSS", iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { icao: "ZBAA", iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China" },
  { icao: "ZSPD", iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China" },
  { icao: "ZGGG", iata: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", country: "China" },
  { icao: "VGZR", iata: "DAC", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh" },
  { icao: "OPKC", iata: "KHI", name: "Jinnah International Airport", city: "Karachi", country: "Pakistan" },
  { icao: "OPLA", iata: "LHE", name: "Allama Iqbal International Airport", city: "Lahore", country: "Pakistan" },
  { icao: "OPRN", iata: "ISB", name: "Islamabad International Airport", city: "Islamabad", country: "Pakistan" },
  { icao: "VCBI", iata: "CMB", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka" },
  { icao: "VNKT", iata: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal" },
  { icao: "VTBS", iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { icao: "WMKK", iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia" },
  { icao: "WIII", iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia" },
  { icao: "WADD", iata: "DPS", name: "Ngurah Rai International Airport", city: "Bali", country: "Indonesia" },
  { icao: "RPLL", iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines" },
  { icao: "VVNB", iata: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam" },
  { icao: "VVTS", iata: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam" },
  { icao: "RJAA", iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { icao: "RJTT", iata: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan" },
  { icao: "RJBB", iata: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan" },
  { icao: "RKSI", iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
  { icao: "RCTP", iata: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan" },
  // Australia and New Zealand
  { icao: "YSSY", iata: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia" },
  { icao: "YMML", iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { icao: "YBBN", iata: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia" },
  { icao: "YPPH", iata: "PER", name: "Perth Airport", city: "Perth", country: "Australia" },
  { icao: "YPAD", iata: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia" },
  { icao: "NZAA", iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
  { icao: "NZWN", iata: "WLG", name: "Wellington International Airport", city: "Wellington", country: "New Zealand" },
  { icao: "NZCH", iata: "CHC", name: "Christchurch International Airport", city: "Christchurch", country: "New Zealand" },
  // Africa
  { icao: "FAOR", iata: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa" },
  { icao: "FACT", iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa" },
  { icao: "HECA", iata: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt" },
  { icao: "GMMN", iata: "CMN", name: "Mohammed V International Airport", city: "Casablanca", country: "Morocco" },
  { icao: "DNMM", iata: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", country: "Nigeria" },
  { icao: "HKJK", iata: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya" },
  { icao: "HAAB", iata: "ADD", name: "Bole International Airport", city: "Addis Ababa", country: "Ethiopia" },
  // South America
  { icao: "SBGR", iata: "GRU", name: "São Paulo–Guarulhos International Airport", city: "São Paulo", country: "Brazil" },
  { icao: "SBGL", iata: "GIG", name: "Rio de Janeiro–Galeão International Airport", city: "Rio de Janeiro", country: "Brazil" },
  { icao: "SAEZ", iata: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina" },
  { icao: "SCEL", iata: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile" },
  { icao: "SKBO", iata: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia" },
  { icao: "SPJC", iata: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru" },
  { icao: "MMMX", iata: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico" },
  { icao: "MMUN", iata: "CUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico" },
  // Canada
  { icao: "CYYZ", iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada" },
  { icao: "CYVR", iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada" },
  { icao: "CYUL", iata: "YUL", name: "Montréal–Trudeau International Airport", city: "Montreal", country: "Canada" },
  { icao: "CYYC", iata: "YYC", name: "Calgary International Airport", city: "Calgary", country: "Canada" },
  { icao: "CYEG", iata: "YEG", name: "Edmonton International Airport", city: "Edmonton", country: "Canada" },
  { icao: "CYOW", iata: "YOW", name: "Ottawa Macdonald–Cartier International Airport", city: "Ottawa", country: "Canada" },
  // Caribbean
  { icao: "TNCM", iata: "SXM", name: "Princess Juliana International Airport", city: "Sint Maarten", country: "Sint Maarten" },
  { icao: "MKJP", iata: "KIN", name: "Norman Manley International Airport", city: "Kingston", country: "Jamaica" },
  { icao: "MUHA", iata: "HAV", name: "José Martí International Airport", city: "Havana", country: "Cuba" },
  { icao: "MDSD", iata: "SDQ", name: "Las Américas International Airport", city: "Santo Domingo", country: "Dominican Republic" },
  { icao: "MDPP", iata: "PUJ", name: "Punta Cana International Airport", city: "Punta Cana", country: "Dominican Republic" },
  { icao: "TBPB", iata: "BGI", name: "Grantley Adams International Airport", city: "Bridgetown", country: "Barbados" },
  { icao: "TTPP", iata: "POS", name: "Piarco International Airport", city: "Port of Spain", country: "Trinidad and Tobago" },
  { icao: "TAPA", iata: "ANU", name: "V.C. Bird International Airport", city: "St. John's", country: "Antigua and Barbuda" },
  // Maldives
  { icao: "VRMM", iata: "MLE", name: "Velana International Airport", city: "Malé", country: "Maldives" },
  // Mauritius
  { icao: "FIMP", iata: "MRU", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Port Louis", country: "Mauritius" },
  // Seychelles  
  { icao: "FSIA", iata: "SEZ", name: "Seychelles International Airport", city: "Mahé", country: "Seychelles" },
];

// Helper function to extract ICAO code from airport string
const extractICAO = (airportString: string): string | null => {
  const match = airportString.match(/\(([A-Z]{3})\)/);
  if (match && match[1]) {
    const iataCode = match[1];
    const airport = airports.find(a => a.iata === iataCode);
    return airport ? airport.icao : null;
  }
  return null;
};

function searchAirports(query: string): Airport[] {
  const searchTerm = query.toLowerCase().trim();

  if (searchTerm.length < 2) {
    return [];
  }

  const results = airports.filter(airport => {
    const searchableText = `${airport.city} ${airport.name} ${airport.iata} ${airport.icao} ${airport.country}`.toLowerCase();
    return searchableText.includes(searchTerm);
  });

  return results.sort((a, b) => {
    const aCity = a.city.toLowerCase();
    const bCity = b.city.toLowerCase();
    const aIata = a.iata.toLowerCase();
    const bIata = b.iata.toLowerCase();

    if (aIata === searchTerm) return -1;
    if (bIata === searchTerm) return 1;
    if (aCity.startsWith(searchTerm) && !bCity.startsWith(searchTerm)) return -1;
    if (bCity.startsWith(searchTerm) && !aCity.startsWith(searchTerm)) return 1;
    return aCity.localeCompare(bCity);
  }).slice(0, 10);
}

// --- Aircraft Types with correct pricing and seating ---
interface AircraftType {
  id: string;
  name: string;
  maxPassengers: number;
  pricePerHour: number;
  apiAircraftName: string;
}

const aircraftTypes: AircraftType[] = [
  // Helicopter options
  {
    id: "light-helicopter",
    name: "Light Helicopter (4 Seater)",
    maxPassengers: 4,
    pricePerHour: 3600,
    apiAircraftName: "Robinson R44"
  },
  {
    id: "medium-helicopter",
    name: "Medium Helicopter (6 Seater)",
    maxPassengers: 6,
    pricePerHour: 5400,
    apiAircraftName: "Bell 429"
  },
  {
    id: "heavy-helicopter",
    name: "Heavy Helicopter (12 Seater)",
    maxPassengers: 12,
    pricePerHour: 8400,
    apiAircraftName: "Sikorsky S-76"
  }
];

// --- Flight Leg Interface ---
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

interface EstimationResult {
  totalHours: number;
  totalPrice: number;
  oneWayPrice: number;
  returnPrice: number;
  breakdown: {
    legIndex: number;
    hours: number;
    price: number;
    passengers: number;
    aircraft: string;
    actualMinutes: number;
    isReturn?: boolean;
    departure: string;
    arrival: string;
  }[];
}

const config: Record<string, { title: string; image: string; aircraftLabel: string; isHelicopter?: boolean }> = {
  "private-jet": { title: "PRIVATE JET ESTIMATION", image: privateJetImg, aircraftLabel: "Choose Type Of Aircraft", isHelicopter: false },
  "air-ambulance": { title: "AIR AMBULANCE ESTIMATION", image: airAmbulanceImg, aircraftLabel: "Choose Type Of Aircraft", isHelicopter: false },
  helicopter: { title: "HELICOPTER ESTIMATION", image: helicopterImg, aircraftLabel: "Choose Type Of Helicopter", isHelicopter: true },
};

const emptyLeg: FlightLeg = {
  departure: "",
  arrival: "",
  passengers: "",
  date: "",
  time: "",
  aircraft: "",
  estimatedHours: 0,
  estimatedPrice: 0,
  actualMinutes: 0,
  isCalculating: false
};

// API Configuration
const RAPIDAPI_KEY = "8cecfb7bb0mshd373401514fabe3p1ee6d6jsn6a70017007ef";
const RAPIDAPI_HOST = "aviapages-flight-time-calculator.p.rapidapi.com";

// Function to round up to next full hour
const roundUpToNextHour = (minutes: number): number => {
  if (minutes <= 0) return 1;
  const hours = Math.ceil(minutes / 60);
  return hours;
};

// Get airport coordinates for distance calculation
const getAirportCoordinates = (icao: string): { lat: number; lng: number } | null => {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    "VECC": { lat: 22.6547, lng: 88.4467 },
    "VIDP": { lat: 28.5562, lng: 77.1000 },
    "VABB": { lat: 19.0896, lng: 72.8656 },
    "VOBL": { lat: 13.1986, lng: 77.7066 },
    "VOMM": { lat: 12.9822, lng: 80.1636 },
    "VOHS": { lat: 17.2403, lng: 78.4294 },
    "KJFK": { lat: 40.6413, lng: -73.7781 },
    "KLAX": { lat: 33.9416, lng: -118.4085 },
    "EGLL": { lat: 51.4700, lng: -0.4543 },
    "OMDB": { lat: 25.2532, lng: 55.3657 },
    "WSSS": { lat: 1.3644, lng: 103.9915 },
  };
  return coordinates[icao] || null;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Function to calculate flight time using API
const calculateFlightTimeAPI = async (
  departureICAO: string,
  arrivalICAO: string,
  aircraftName: string,
  passengers: number
): Promise<{ success: boolean; minutes: number; error?: string }> => {
  try {
    const response = await fetch("https://aviapages-flight-time-calculator.p.rapidapi.com/flight_calculator/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: JSON.stringify({
        departure_airport: departureICAO,
        arrival_airport: arrivalICAO,
        aircraft: aircraftName,
        pax: passengers,
        airway_time: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (data.errors && data.errors.length > 0) {
      return { success: false, minutes: 0, error: data.errors[0].message };
    }

    const minutes = data.time?.airway;
    if (!minutes || minutes === null) {
      return { success: false, minutes: 0, error: "Could not calculate flight time" };
    }

    return { success: true, minutes: minutes };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, minutes: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// --- Search Component ---
const AirportSearchField = ({
  label,
  value,
  onSelect,
  placeholder,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  placeholder: string;
}) => {
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchAirports = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = searchAirports(query);
      setSuggestions(results);
      setShowDropdown(true);
    } catch (error) {
      console.error("Airport search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onSelect(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAirports(newValue), 300);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <label className="block text-xs font-medium text-brand-navy mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-purple))]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-brand-purple" />
          ) : (
            <Search className="h-3 w-3 text-slate-400" />
          )}
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button
              key={`${airport.icao || airport.iata}-${index}`}
              type="button"
              onClick={() => {
                onSelect(`${airport.city} (${airport.iata})`);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <p className="text-xs font-bold text-brand-navy">
                {airport.city} ({airport.iata})
              </p>
              <p className="text-[10px] text-slate-500 truncate">{airport.name}, {airport.country}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Aircraft Select Component ---
const AircraftSelectField = ({
  label,
  value,
  onSelect,
  passengers,
  placeholder,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  passengers: number;
  placeholder: string;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableAircraft = aircraftTypes.filter(aircraft =>
    passengers === 0 || passengers <= aircraft.maxPassengers
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            {value || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-xl">
          {availableAircraft.length === 0 ? (
            <div className="px-3 py-2 text-sm text-red-600">
              No aircraft available for {passengers} passengers. Maximum capacity is 14 passengers.
            </div>
          ) : (
            availableAircraft.map((aircraft) => (
              <button
                key={aircraft.id}
                type="button"
                onClick={() => {
                  onSelect(aircraft.name);
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <p className="text-sm font-medium text-brand-navy">{aircraft.name}</p>
                <p className="text-xs text-gray-500">
                  Max: {aircraft.maxPassengers} passengers
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- Contact Form Component ---
const ContactForm = ({ totalPrice, onSubmit }: { totalPrice: number; onSubmit: (data: any, e?: React.FormEvent) => Promise<void> }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-xl border-2 border-brand-purple shadow-lg">
      <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">REQUEST A QUOTE</h2>
      <p className="text-center text-gray-600 mb-6">
        Total Estimated Price: <span className="font-bold text-brand-purple text-xl">${totalPrice.toLocaleString()}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-navy mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-navy mb-1">Additional Message</label>
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
            placeholder="Tell us about your specific requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-navy text-white py-3 rounded-full font-bold text-sm tracking-widest disabled:opacity-50 hover:bg-brand-purple transition-colors"
        >
          {isSubmitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
        </button>
      </form>
    </div>
  );
};

// --- Main Form ---
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

  const updateLeg = (idx: number, field: keyof FlightLeg, value: string, isReturn: boolean = false) => {
    if (isReturn) {
      setReturnLegs((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
    } else {
      setLegs((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
    }
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const addLeg = () => {
    setLegs((prev) => [...prev, { ...emptyLeg }]);
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const addReturnLeg = () => {
    setReturnLegs((prev) => [...prev, { ...emptyLeg }]);
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const removeLeg = (isReturn: boolean = false, idx?: number) => {
    if (isReturn && idx !== undefined) {
      setReturnLegs((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setLegs((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const initializeReturnLegs = () => {
    const newReturnLegs = legs.map(leg => ({
      ...emptyLeg,
      departure: leg.arrival,
      arrival: ""
    }));
    setReturnLegs(newReturnLegs);
  };

  const handleRoundTripChange = (checked: boolean) => {
    setIsRoundTrip(checked);
    if (checked) {
      initializeReturnLegs();
    } else {
      setReturnLegs([]);
    }
    setEstimationResult(null);
    setShowContactForm(false);
  };

  const calculateFlightTimeForLeg = async (leg: FlightLeg, legIndex: number, isReturn: boolean = false) => {
    if (!leg.departure || !leg.arrival || !leg.aircraft || !leg.passengers) {
      return null;
    }

    const departureICAO = extractICAO(leg.departure);
    const arrivalICAO = extractICAO(leg.arrival);
    const passengersNum = parseInt(leg.passengers);

    if (!departureICAO || !arrivalICAO) {
      toast.error(`Could not extract airport codes for leg ${legIndex + 1}. Please select airports from the suggestions.`);
      return null;
    }

    if (isNaN(passengersNum) || passengersNum <= 0) {
      toast.error(`Please enter valid number of passengers for leg ${legIndex + 1}`);
      return null;
    }

    const aircraft = aircraftTypes.find(a => a.name === leg.aircraft);
    if (!aircraft) {
      toast.error(`Invalid aircraft selected for leg ${legIndex + 1}`);
      return null;
    }

    if (passengersNum > aircraft.maxPassengers) {
      toast.error(`${aircraft.name} can only carry up to ${aircraft.maxPassengers} passengers. Please select a larger aircraft or reduce passenger count.`);
      return null;
    }

    try {
      let totalMinutes: number;

      const apiResult = await calculateFlightTimeAPI(
        departureICAO,
        arrivalICAO,
        aircraft.apiAircraftName,
        passengersNum
      );

      if (apiResult.success) {
        totalMinutes = apiResult.minutes;
        console.log(`API returned ${totalMinutes} minutes for leg ${legIndex + 1}`);
      } else {
        console.log(`API failed: ${apiResult.error}, using distance calculation`);

        const coords1 = getAirportCoordinates(departureICAO);
        const coords2 = getAirportCoordinates(arrivalICAO);

        if (coords1 && coords2) {
          const distance = calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
          totalMinutes = Math.round((distance / 800) * 60);
          toast.info(`Using distance-based estimate for leg ${legIndex + 1} (${Math.round(distance)} km, ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m)`);
        } else {
          const hash = (departureICAO + arrivalICAO).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          totalMinutes = (hash % 240) + 60;
          toast.info(`Using estimated flight time for leg ${legIndex + 1}`);
        }
      }

      const billableHours = roundUpToNextHour(totalMinutes);
      const price = billableHours * aircraft.pricePerHour;

      return { hours: billableHours, price, minutes: totalMinutes };
    } catch (error) {
      toast.error(`Failed to calculate flight time for leg ${legIndex + 1}. Please try again.`);
      return null;
    }
  };

  const calculateEstimation = async () => {
    setIsCalculating(true);

    const isValid = legs.every(leg => {
      const passengersNum = parseInt(leg.passengers);
      return leg.departure && leg.arrival && leg.date && leg.aircraft && !isNaN(passengersNum) && passengersNum > 0;
    });

    if (!isValid) {
      toast.error("Please fill in all flight details, including passengers and aircraft selection.");
      setIsCalculating(false);
      return;
    }

    if (isRoundTrip) {
      const isReturnValid = returnLegs.every(leg => {
        const passengersNum = parseInt(leg.passengers);
        return leg.departure && leg.arrival && leg.date && leg.aircraft && !isNaN(passengersNum) && passengersNum > 0;
      });

      if (!isReturnValid) {
        toast.error("Please fill in all return flight details.");
        setIsCalculating(false);
        return;
      }
    }

    const breakdown: EstimationResult["breakdown"] = [];
    let oneWayTotalPrice = 0;
    let returnTotalPrice = 0;
    let totalHours = 0;

    // Calculate forward legs
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const result = await calculateFlightTimeForLeg(leg, i, false);

      if (!result) {
        toast.error(`Failed to calculate leg ${i + 1}. Please check the details and try again.`);
        setIsCalculating(false);
        return;
      }

      breakdown.push({
        legIndex: i,
        hours: result.hours,
        price: result.price,
        passengers: parseInt(leg.passengers),
        aircraft: leg.aircraft,
        actualMinutes: result.minutes,
        isReturn: false,
        departure: leg.departure,
        arrival: leg.arrival
      });

      oneWayTotalPrice += result.price;
      totalHours += result.hours;
    }

    // Calculate return legs if round trip is selected
    if (isRoundTrip) {
      for (let i = 0; i < returnLegs.length; i++) {
        const leg = returnLegs[i];
        const result = await calculateFlightTimeForLeg(leg, i, true);

        if (!result) {
          toast.error(`Failed to calculate return leg ${i + 1}. Please check the details and try again.`);
          setIsCalculating(false);
          return;
        }

        breakdown.push({
          legIndex: i,
          hours: result.hours,
          price: result.price,
          passengers: parseInt(leg.passengers),
          aircraft: leg.aircraft,
          actualMinutes: result.minutes,
          isReturn: true,
          departure: leg.departure,
          arrival: leg.arrival
        });

        returnTotalPrice += result.price;
        totalHours += result.hours;
      }
    }

    const totalPrice = isRoundTrip ? oneWayTotalPrice + returnTotalPrice : oneWayTotalPrice;

    setEstimationResult({
      totalHours,
      totalPrice,
      oneWayPrice: oneWayTotalPrice,
      returnPrice: returnTotalPrice,
      breakdown
    });
    setIsCalculating(false);
    setShowContactForm(true);
    toast.success("Estimation calculated successfully! Please fill out the form below to request a quote.");
  };

  // FIXED: Save enquiry to backend with correct API URL
  const saveEnquiryToBackend = async (formData: any) => {
    try {
      const oneWayLegsData = legs.map((leg: any, idx: number) => ({
        leg_number: idx + 1,
        departure: leg.departure,
        arrival: leg.arrival,
        passengers: parseInt(leg.passengers),
        date: leg.date,
        time: leg.time,
        aircraft: leg.aircraft
      }));

      let returnLegsData = null;
      if (isRoundTrip && returnLegs.length > 0) {
        returnLegsData = returnLegs.map((leg: any, idx: number) => ({
          leg_number: idx + 1,
          departure: leg.departure,
          arrival: leg.arrival,
          passengers: parseInt(leg.passengers),
          date: leg.date,
          time: leg.time,
          aircraft: leg.aircraft
        }));
      }

      const payload = {
        tripType: isRoundTrip ? 'roundtrip' : 'oneway',
        oneWayLegs: oneWayLegsData,
        returnLegs: returnLegsData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      };

      console.log('Sending payload to backend:', payload);

      // FIXED: Use the correct API URL
      const API_BASE_URL = API.enquiries;
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Backend response:', data);
      return { success: true, enquiryId: data.enquiryId };
    } catch (error) {
      console.error('Error saving enquiry:', error);
      throw error;
    }
  };

  // FIXED: Handle contact form submission and completely stop browser events from bubbling up
  const handleContactSubmit = async (formData: any, e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const result = await saveEnquiryToBackend(formData);
      if (result.success) {
        toast.success(`Enquiry submitted successfully! Enquiry ID: ${result.enquiryId}`);

        // Reset form after successful submission
        setLegs([{ ...emptyLeg }]);
        setReturnLegs([]);
        setIsRoundTrip(false);
        setEstimationResult(null);
        setShowContactForm(false);

        // Scroll to top safely
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit enquiry. Please try again.');
    }
  };

  // FIXED: Main estimation calculation setup with preventDefault guarantees
  const handleMainFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    calculateEstimation();
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div
        className="hidden lg:block w-1/3 bg-cover bg-center sticky top-0 h-screen"
        style={{ backgroundImage: `url(${cfg.image})` }}
      />

      <div className="flex-1 relative overflow-y-auto">
        <Link
          to="/aircraft-models"
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center hover:bg-brand-purple transition-colors z-30"
        >
          <X className="w-5 h-5" />
        </Link>

        <div className="px-6 md:px-16 py-12 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            {/* <img src={logo} alt="Logo" className="h-10 mx-auto mb-6" /> */}
            <h1 className="font-display text-3xl md:text-4xl text-brand-navy uppercase tracking-tight">
              {cfg.title}
            </h1>
          </div>

          {/* FIXED: Keeps layout structured without native HTML form behaviors */}
          {!isHelicopterMode ? (
            <div className="space-y-6">
              {/* One Way Section */}
              <div className="mb-4">
                <div className="flex items-center justify-start gap-6 mb-4">
                  <h2 className="text-lg font-bold text-brand-navy">One Way Journey</h2>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRoundTrip}
                      onChange={(e) => handleRoundTripChange(e.target.checked)}
                      className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                    />
                    <span className="text-sm font-bold text-brand-navy uppercase tracking-widest">
                      Round Trip
                    </span>
                  </label>
                </div>
                {legs.map((leg: any, idx: number) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl p-6 border border-slate-200 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 rounded-full bg-brand-navy text-white text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">Flight Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <AirportSearchField
                        label="Departure Airport"
                        value={leg.departure}
                        placeholder="Search Airport (e.g., Kolkata (CCU))"
                        onSelect={(val: string) => updateLeg(idx, "departure", val, false)}
                      />
                      <AirportSearchField
                        label="Arrival Airport"
                        value={leg.arrival}
                        placeholder="Search Airport (e.g., Delhi (DEL))"
                        onSelect={(val: string) => updateLeg(idx, "arrival", val, false)}
                      />
                      <div>
                        <label className="block text-xs font-medium text-brand-navy mb-1">No of Passengers</label>
                        <input
                          type="number"
                          value={leg.passengers}
                          placeholder="0"
                          min="1"
                          max="14"
                          onChange={(e) => {
                            updateLeg(idx, "passengers", e.target.value, false);
                            const passengersNum = parseInt(e.target.value);
                            if (leg.aircraft) {
                              const currentAircraft = aircraftTypes.find((a: any) => a.name === leg.aircraft);
                              if (currentAircraft && passengersNum > currentAircraft.maxPassengers) {
                                updateLeg(idx, "aircraft", "", false);
                                toast.warning(`Please select a larger aircraft for ${passengersNum} passengers`);
                              }
                            }
                          }}
                          className="w-full px-3 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brand-navy mb-1">Date Of Journey</label>
                        <input
                          type="date"
                          value={leg.date}
                          onChange={(e) => updateLeg(idx, "date", e.target.value, false)}
                          className="w-full px-3 py-2 rounded-md border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brand-navy mb-1">Time Of Journey</label>
                        <input
                          type="time"
                          value={leg.time}
                          onChange={(e) => updateLeg(idx, "time", e.target.value, false)}
                          className="w-full px-3 py-2 rounded-md border border-border text-sm"
                        />
                      </div>
                      <AircraftSelectField
                        label={cfg.aircraftLabel}
                        value={leg.aircraft}
                        placeholder="Select Aircraft"
                        passengers={parseInt(leg.passengers) || 0}
                        onSelect={(val: string) => updateLeg(idx, "aircraft", val, false)}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLeg}
                  className="text-[10px] font-bold text-brand-navy uppercase tracking-widest flex items-center gap-1 hover:text-brand-purple mt-2"
                >
                  <Plus size={12} /> Add Flight
                </button>
                {legs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLeg(false)}
                    className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 mt-2 ml-4"
                  >
                    <Minus size={12} /> Remove Last Flight
                  </button>
                )}
              </div>

              {/* Round Trip Section */}
              <div className="mt-6">
                {/* <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={isRoundTrip}
                  onChange={(e) => handleRoundTripChange(e.target.checked)}
                  className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                />
                <span className="text-sm font-bold text-brand-navy uppercase tracking-widest">Round Trip</span>
              </label> */}

                {isRoundTrip && (
                  <div>
                    <h2 className="text-lg font-bold text-brand-navy mb-3">Return Journey</h2>
                    {returnLegs.map((leg: any, idx: number) => (
                      <div key={idx} className="bg-slate-50/50 rounded-xl p-6 border border-slate-200 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-6 w-6 rounded-full bg-brand-purple text-white text-[10px] flex items-center justify-center font-bold">
                            R{idx + 1}
                          </div>
                          <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">Return Flight Details</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          <AirportSearchField
                            label="Departure Airport"
                            value={leg.departure}
                            placeholder="Search Airport"
                            onSelect={(val: string) => updateLeg(idx, "departure", val, true)}
                          />
                          <AirportSearchField
                            label="Arrival Airport"
                            value={leg.arrival}
                            placeholder="Search Airport"
                            onSelect={(val: string) => updateLeg(idx, "arrival", val, true)}
                          />
                          <div>
                            <label className="block text-xs font-medium text-brand-navy mb-1">No of Passengers</label>
                            <input
                              type="number"
                              value={leg.passengers}
                              placeholder="0"
                              min="1"
                              max="14"
                              onChange={(e) => {
                                updateLeg(idx, "passengers", e.target.value, true);
                                const passengersNum = parseInt(e.target.value);
                                if (leg.aircraft) {
                                  const currentAircraft = aircraftTypes.find((a: any) => a.name === leg.aircraft);
                                  if (currentAircraft && passengersNum > currentAircraft.maxPassengers) {
                                    updateLeg(idx, "aircraft", "", true);
                                    toast.warning(`Please select a larger aircraft for ${passengersNum} passengers`);
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-brand-navy mb-1">Date Of Journey</label>
                            <input
                              type="date"
                              value={leg.date}
                              onChange={(e) => updateLeg(idx, "date", e.target.value, true)}
                              className="w-full px-3 py-2 rounded-md border border-border text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-brand-navy mb-1">Time Of Journey</label>
                            <input
                              type="time"
                              value={leg.time}
                              onChange={(e) => updateLeg(idx, "time", e.target.value, true)}
                              className="w-full px-3 py-2 rounded-md border border-border text-sm"
                            />
                          </div>
                          <AircraftSelectField
                            label={cfg.aircraftLabel}
                            value={leg.aircraft}
                            placeholder="Select Aircraft"
                            passengers={parseInt(leg.passengers) || 0}
                            onSelect={(val: string) => updateLeg(idx, "aircraft", val, true)}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addReturnLeg}
                      className="text-[10px] font-bold text-brand-navy uppercase tracking-widest flex items-center gap-1 hover:text-brand-purple mt-2"
                    >
                      <Plus size={12} /> Add Return Flight
                    </button>
                    {returnLegs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLeg(true, returnLegs.length - 1)}
                        className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 mt-2 ml-4"
                      >
                        <Minus size={12} /> Remove Last Return Flight
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* View Estimate Action */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => calculateEstimation()}
                  disabled={isCalculating}
                  className="bg-brand-navy text-white px-8 py-3 rounded-full font-bold text-[10px] tracking-widest hover:bg-brand-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? "CALCULATING..." : "VIEW ESTIMATE"}
                </button>
              </div>

              {/* Estimation Results Panel */}
              {estimationResult && (
                <div className="mt-8 p-6 bg-gradient-to-r from-brand-purple/20 to-brand-navy/20 rounded-xl border-2 border-brand-purple">
                  <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">TOTAL ESTIMATION</h2>

                  {/* One Way Total Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-3 border-b border-brand-purple pb-2">One Way Journey</h3>
                    {estimationResult.breakdown
                      .filter((leg: any) => !leg.isReturn)
                      .map((leg: any, idx: number) => (
                        <div key={idx} className="mb-3 pb-2">
                          <p className="text-sm font-semibold text-brand-navy">Flight {idx + 1}: {leg.aircraft}</p>
                          <div className="text-xs text-gray-600 ml-4 mb-1">
                            {leg.departure} → {leg.arrival}
                          </div>
                          <div className="flex justify-between text-sm ml-4">
                            <span>Duration: {Math.floor(leg.actualMinutes / 60)}h {leg.actualMinutes % 60}m</span>
                            <span>Passengers: {leg.passengers}</span>
                            <span className="font-bold">${leg.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-purple">
                      <span className="font-bold text-brand-navy">One Way Total:</span>
                      <span className="font-bold text-brand-purple text-xl">${estimationResult.oneWayPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Return Total Section */}
                  {isRoundTrip && estimationResult.returnPrice > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-brand-navy mb-3 border-b border-brand-purple pb-2">Return Journey</h3>
                      {estimationResult.breakdown
                        .filter((leg: any) => leg.isReturn)
                        .map((leg: any, idx: number) => (
                          <div key={idx} className="mb-3 pb-2">
                            <p className="text-sm font-semibold text-brand-navy">Return Flight {idx + 1}: {leg.aircraft}</p>
                            <div className="text-xs text-gray-600 ml-4 mb-1">
                              {leg.departure} → {leg.arrival}
                            </div>
                            <div className="flex justify-between text-sm ml-4">
                              <span>Duration: {Math.floor(leg.actualMinutes / 60)}h {leg.actualMinutes % 60}m</span>
                              <span>Passengers: {leg.passengers}</span>
                              <span className="font-bold">${leg.price.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-purple">
                        <span className="font-bold text-brand-navy">Return Total:</span>
                        <span className="font-bold text-brand-purple text-xl">${estimationResult.returnPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Combined Grand Total */}
                  <div className="pt-4 mt-2 border-t-2 border-brand-purple bg-white/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-brand-navy">Grand Total:</span>
                      <span className="text-2xl font-bold text-brand-purple">${estimationResult.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FIXED: Passes the explicit click/submit event parameter back up into handleContactSubmit */}
              {showContactForm && estimationResult && (
                <ContactForm
                  totalPrice={estimationResult.totalPrice}
                  onSubmit={(formData, e) => handleContactSubmit(formData, e)}
                />
              )}
            </div>
          ) : (


            // SIMPLE HELICOPTER FORM (matches screenshot design)
            ////
            // SIMPLE HELICOPTER FORM (matches screenshot design)
            ////
            <>
              <div className="mx-auto max-w-4xl border border-[#3b5998]/30 bg-white p-6 md:p-8 font-sans">
                {/* Header Title */}
                <h2 className="mb-6 text-center text-3xl font-bold tracking-wide text-[#0f3080] md:text-4xl lg:text-5xl uppercase">
                  Helicopter Estimation
                </h2>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // 1. Extract Form Data safely using field names
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData.entries());

                    try {
                      // 2. Submit data using native fetch API
                      const response = await fetch(API.helicopterEnquiries, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                      });

                      const result = await response.json();

                      if (response.ok && result.success) {
                        alert(`Enquiry submitted successfully! ID: ${result.enquiryId}`);
                        e.currentTarget.reset(); // Clear form on success
                      } else {
                        alert(`Failed to submit enquiry: ${result.error || 'Unknown error occurred'}`);
                      }
                    } catch (error) {
                      console.error('Submission network error:', error);
                      alert('A network error occurred. Please try again later.');
                    }
                  }}
                  className="space-y-5"
                >
                  {/* Row 1: From & To */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">From</label>
                      <input
                        type="text"
                        name="from"
                        placeholder="Departure Destination"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">To</label>
                      <input
                        type="text"
                        name="to"
                        placeholder="Arrival Airport"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Date & Time */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Date Of Journey</label>
                      <input
                        type="date"
                        name="dateOfJourney"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Time Of Journey</label>
                      <input
                        type="time"
                        name="timeOfJourney"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: No. Of Passengers */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#4a5568]">No. Of Passengers</label>
                    <select
                      name="passengers"
                      defaultValue=""
                      className="w-full appearance-none border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px'
                      }}
                      required
                    >
                      <option value="" disabled hidden></option>
                      <option value="1">1 Passenger</option>
                      <option value="2">2 Passengers</option>
                      <option value="3">3 Passengers</option>
                      <option value="4">4 Passengers</option>
                      <option value="5">5+ Passengers</option>
                    </select>
                  </div>

                  {/* Row 4: First & Last Name */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Your First Name"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Your Last Name"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 5: Email & Phone */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Email</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email Address"
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#4a5568]">Phone</label>
                      <div className="flex border border-gray-300 focus-within:border-[#0f3080] focus-within:ring-1 focus-within:ring-[#0f3080]">
                        <div className="flex items-center gap-1.5 bg-white pl-3 pr-2 border-r border-gray-200 text-sm text-gray-700">
                          <span className="inline-block w-5 h-3.5 bg-cover bg-center" style={{ backgroundImage: `url('https://flagcdn.com/in.svg')` }}></span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 6: Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#4a5568]">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Enter Your Requirements Here"
                      className="w-full resize-y border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#0f3080] focus:ring-1 focus:ring-[#0f3080]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#0b246a] py-3 text-center text-sm font-bold tracking-wider text-white uppercase transition-colors duration-200 hover:bg-[#081b4f]"
                    >
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