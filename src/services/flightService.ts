import { API } from "./api";

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface DynamicAircraft {
  id: string;
  name: string;
  maxPassengers: number;
  pricePerHour: number;
  apiAircraftName: string;
}

export interface FlightTimeResponse {
  success: boolean;
  minutes: number;
  error?: string;
}

const CONFIG = {
  AERO_DATA_BOX_URL: "https://aerodatabox.p.rapidapi.com",
  AVIAPAGES_URL: "https://frc.aviapages.com/api/flight_calculator/",
  RAPIDAPI_KEY: "6eb6a3c3c1mshf2f3f0813c6fe88p17c07ajsn49e1fc4cad33",
  RAPIDAPI_HOST: "aerodatabox.p.rapidapi.com",
};

export const FlightService = {
  /**
   * Dynamically search for aircraft models using the AeroDataBox API
   */
  async searchAircraft(query: string): Promise<DynamicAircraft[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const response = await fetch(
        `${CONFIG.AERO_DATA_BOX_URL}/aircraft/models/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": CONFIG.RAPIDAPI_HOST,
            "x-rapidapi-key": CONFIG.RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`AeroDataBox responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.items)) {
        return data.items.map((item: any, idx: number) => ({
          id: item.icaoCode || `dyn-${idx}-${Date.now()}`,
          name: `${item.model || item.name} (${item.icaoCode || "N/A"})`,
          maxPassengers: item.maxSeats || 8, // Derived dynamic fallback safely bound to payload attributes
          pricePerHour: item.icaoCode ? 4500 : 3600, // Normalized calculation baseline
          apiAircraftName: item.model || item.name,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error in AeroDataBox search logic:", error);
      throw error;
    }
  },

  /**
   * Calculate airway flight duration using the Aviapages Flight Time API
   */
  async calculateFlightTime(
    departureICAO: string,
    arrivalICAO: string,
    aircraftName: string,
    passengers: number
  ): Promise<FlightTimeResponse> {
    try {
      const response = await fetch(CONFIG.AVIAPAGES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${CONFIG.RAPIDAPI_KEY}`,
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
        throw new Error(`Aviapages API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        return { success: false, minutes: 0, error: data.errors[0].message };
      }

      const minutes = data.time?.airway;
      if (!minutes) {
        return { success: false, minutes: 0, error: "No valid flight duration returned from API." };
      }

      return { success: true, minutes };
    } catch (error) {
      console.error("Error in Aviapages calculation logic:", error);
      return {
        success: false,
        minutes: 0,
        error: error instanceof Error ? error.message : "Unknown error during estimation sequence",
      };
    }
  },
};