import { Airspace } from "../model/airspace";
import { Coordinate } from "../model/coordinate";
import { Flight } from "../model/flight";
import { Coordinates, FlightLocation } from "../types";

const arrivalAerodrome = "JFK";
const arrivalTime = new Date("2025-01-01T14:00:00Z");
const departureAerodrome = "LAX";
const departureTime = new Date("2025-01-01T10:00:00Z");
const departureCoordinates: Coordinates = {
  latitude: 33.9425,
  longitude: -118.4081,
};
const arrivalCoordinates: Coordinates = {
  latitude: 40.6413,
  longitude: -73.7781,
};

describe("Flight Details Service", () => {
  let flight: Flight;
  let airspace: Airspace;
  beforeEach(() => {
    flight = new Flight(
      arrivalAerodrome,
      arrivalTime,
      departureAerodrome,
      departureTime,
      departureCoordinates,
      arrivalCoordinates
    );

    airspace = new Airspace(
      new Coordinate(-105.0, 35.0),
      new Coordinate(-90.0, 42.0)
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should return the arrival aerodrome", () => {
    const flightArrivalAerodrome = flight.getArrivalAerodrome();
    expect(flightArrivalAerodrome).toBe(arrivalAerodrome);
  });

  test("should return the arrival time", () => {
    const flightArrivalTime = flight.getArrivalTime();
    expect(flightArrivalTime).toBe(arrivalTime);
  });

  test("should return the departure aerodrome", () => {
    const result = flight.getDepartureAerodrome();
    expect(result).toBe(departureAerodrome);
  });

  test("should return the departure time", () => {
    const result = flight.getDepartureTime();
    expect(result).toBe(departureTime);
  });

  describe("Flight.getEstimatedLocation", () => {
    test("should return departureCoordinate if before departuer time", () => {
      jest.setSystemTime(new Date("2025-01-01T09:59:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.coordinates).toEqual(departureCoordinates);
    });

    test("should return arrivalCoordinate after arrival", () => {
      jest.setSystemTime(new Date("2025-01-01T15:00:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.coordinates).toEqual(arrivalCoordinates);
    });
  });

  describe("Flight.getCurrentLocation", () => {
    test("should return location equal to departure coordinates if flight is yet to depart", () => {
      jest.setSystemTime(new Date("2025-01-01T09:59:00Z"));
      const result = flight.getEstimatedLocation();
      flight.updateLocation(result);
      const currentLocation = flight.getCurrentLocation();
      expect(currentLocation).toBeDefined();
      expect(currentLocation).toEqual(result);
      expect(currentLocation?.coordinates).toEqual(departureCoordinates);
    });

    test("should return location equal to arrival coordinates if flight has arrived", () => {
      jest.setSystemTime(new Date("2025-01-01T15:00:00Z"));
      const result = flight.getEstimatedLocation();
      flight.updateLocation(result);
      const currentLocation = flight.getCurrentLocation();
      expect(currentLocation).toBeDefined();
      expect(currentLocation).toEqual(result);
      expect(currentLocation?.coordinates).toEqual(arrivalCoordinates);
    });
  });

  describe("Flight.isInAirspace", () => {
    test("should return true if the flight is within the airspace boundaries", () => {
      const locationInAirspace: FlightLocation = {
        coordinates: { latitude: 39.0, longitude: -95.0, altitude: 35000 },
      };
      flight.updateLocation(locationInAirspace);
      expect(flight.isInAirspace(airspace)).toBe(true);
    });

    test("should return false when flight is outside the airspace boundaries - too far west", () => {
      const locationOutsideAirspace: FlightLocation = {
        coordinates: { latitude: 39.0, longitude: -110.0, altitude: 35000 },
      };
      flight.updateLocation(locationOutsideAirspace);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return false when flight is outside airspace boundaries - too far east", () => {
      const locationOutside: FlightLocation = {
        coordinates: { latitude: 39.0, longitude: -85.0, altitude: 35000 },
      };

      flight.updateLocation(locationOutside);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return false when flight is outside airspace boundaries - too far north", () => {
      const locationOutside: FlightLocation = {
        coordinates: { latitude: 45.0, longitude: -95.0, altitude: 35000 },
      };
      flight.updateLocation(locationOutside);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return false when flight is outside airspace boundaries - too far south", () => {
      const locationOutside: FlightLocation = {
        coordinates: { latitude: 30.0, longitude: -95.0, altitude: 35000 },
      };
      flight.updateLocation(locationOutside);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return true when flight is exactly on the edge of the airspace", () => {
      const locationOnEdge: FlightLocation = {
        coordinates: { latitude: 35.0, longitude: -105.0, altitude: 35000 },
      };
      flight.updateLocation(locationOnEdge);
      expect(flight.isInAirspace(airspace)).toBe(true);
    });
  });
});
