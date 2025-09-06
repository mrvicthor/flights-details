export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface FlightLocation {
  coordinates: Coordinates;
  estimatedTimeToDestination?: number;
}
