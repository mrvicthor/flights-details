export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export enum FlightPhase {
  PRE_DEPARTURE = "PRE_DEPARTURE",
  TAXIING_OUT = "TAXIING_OUT",
  TAKEOFF = "TAKEOFF",
  CLIMBING = "CLIMBING",
  CRUISING = "CRUISING",
  DESCENDING = "DESCENDING",
  APPROACH = "APPROACH",
  LANDING = "LANDING",
  TAXIING_IN = "TAXIING_IN",
  ARRIVED = "ARRIVED",
}

export interface FlightLocation {
  coordinates: Coordinates;
  phase: FlightPhase;
  groundSpeed?: number;
  heading?: number;
  estimatedTimeToDestination?: number;
}
