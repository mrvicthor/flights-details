import { Airspace } from "../model/airspace";
import { Coordinate } from "../model/coordinate";
import { Flight } from "../model/flight";
import { Coordinates, FlightLocation, FlightPhase } from "../types";

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
    test("should return PRE_DEPARTURE if before departuer time", () => {
      jest.setSystemTime(new Date("2025-01-01T09:59:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.phase).toBe(FlightPhase.PRE_DEPARTURE);
      expect(result.coordinates).toEqual(departureCoordinates);
    });

    test("should return ARRIVED after arrival", () => {
      jest.setSystemTime(new Date("2025-01-01T15:00:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.phase).toBe(FlightPhase.ARRIVED);
      expect(result.coordinates).toEqual(arrivalCoordinates);
    });

    test("should return CLIMBING early in the flight", () => {
      jest.setSystemTime(new Date("2025-01-01T10:15:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.phase).toBe(FlightPhase.CLIMBING);
      expect(result.coordinates.altitude).toBeGreaterThan(0);
      expect(result.coordinates.altitude).toBeLessThan(35000);
      expect(result.estimatedTimeToDestination).toBeCloseTo(225, 0);
    });

    test("should return CRUISING mid-flight", () => {
      jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.phase).toBe(FlightPhase.CRUISING);
      expect(result.coordinates.altitude).toBe(35000);
    });

    test("should return DESCENDING late in the flight", () => {
      jest.setSystemTime(new Date("2025-01-01T13:50:00Z"));

      const result = flight.getEstimatedLocation();
      expect(result.phase).toBe(FlightPhase.DESCENDING);
      expect(result.coordinates.altitude).toBeLessThan(35000);
      expect(result.estimatedTimeToDestination).toBeCloseTo(10, 0);
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
      expect(currentLocation?.phase).toBe(FlightPhase.PRE_DEPARTURE);
      expect(currentLocation?.coordinates).toEqual(departureCoordinates);
    });

    test("should return location equal to arrival coordinates if flight has arrived", () => {
      jest.setSystemTime(new Date("2025-01-01T15:00:00Z"));
      const result = flight.getEstimatedLocation();
      flight.updateLocation(result);
      const currentLocation = flight.getCurrentLocation();
      expect(currentLocation).toBeDefined();
      expect(currentLocation).toEqual(result);
      expect(currentLocation?.phase).toBe(FlightPhase.ARRIVED);
      expect(currentLocation?.coordinates).toEqual(arrivalCoordinates);
    });
  });

  describe("Flight.getCurrentCoordinate", () => {
    test("should return current coordinates using getEstimatedLocation if no real-time data", () => {
      jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));
      flight.getEstimatedLocation();
      const currentCoordinate = flight.getCurrentCoordinate();

      expect(currentCoordinate.getX()).toBeCloseTo(-96.0931, 4);
      expect(currentCoordinate.getY()).toBeCloseTo(37.2919, 4);
    });
  });

  describe("Flight.isAirborne", () => {
    test("should return false if flight is on ground", () => {
      jest.setSystemTime(new Date("2025-01-01T09:59:00Z"));
      flight.getEstimatedLocation();
      const result = flight.isAirborne();
      expect(result).toBe(false);
    });

    test("should return true if flight is airborne", () => {
      jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));
      flight.getEstimatedLocation();
      const result = flight.isAirborne();
      expect(result).toBe(true);
    });

    test("should return false if flight has landed", () => {
      jest.setSystemTime(new Date("2025-01-01T15:00:00Z"));
      flight.getEstimatedLocation();
      const result = flight.isAirborne();
      expect(result).toBe(false);
    });

    test("should work regardless of flight phase", () => {
      const locationInAirspace = {
        latitude: 39.0,
        longitude: -95.0,
        altitude: 35000,
      };

      const phases = [
        FlightPhase.TAKEOFF,
        FlightPhase.CLIMBING,
        FlightPhase.CRUISING,
        FlightPhase.DESCENDING,
        FlightPhase.APPROACH,
      ];

      phases.forEach((phase) => {
        flight.updateLocation({
          coordinates: locationInAirspace,
          phase: phase,
        });
        expect(flight.isAirborne()).toBe(true);
      });
    });
  });

  describe("Flight.isInAirspace", () => {
    test("should return true if the flight is within the airspace boundaries", () => {
      const locationInAirspace: FlightLocation = {
        coordinates: { latitude: 39.0, longitude: -95.0, altitude: 35000 },
        phase: FlightPhase.CRUISING,
        groundSpeed: 450,
      };
      flight.updateLocation(locationInAirspace);
      expect(flight.isInAirspace(airspace)).toBe(true);
    });

    test("should return false when flight is outside the airspace boundaries - too far west", () => {
      const locationOutsideAirspace: FlightLocation = {
        coordinates: { latitude: 39.0, longitude: -110.0, altitude: 35000 },
        phase: FlightPhase.CRUISING,
      };
      flight.updateLocation(locationOutsideAirspace);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return false when flight is outside airspace boundaries - too far east", () => {
      const locationOutside: FlightLocation = {
        coordinates: { latitude: 39.0, longitude: -85.0, altitude: 35000 },
        phase: FlightPhase.CRUISING,
      };

      flight.updateLocation(locationOutside);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return false when flight is outside airspace boundaries - too far north", () => {
      const locationOutside: FlightLocation = {
        coordinates: { latitude: 45.0, longitude: -95.0, altitude: 35000 },
        phase: FlightPhase.CRUISING,
      };
      flight.updateLocation(locationOutside);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return false when flight is outside airspace boundaries - too far south", () => {
      const locationOutside: FlightLocation = {
        coordinates: { latitude: 30.0, longitude: -95.0, altitude: 35000 },
        phase: FlightPhase.CRUISING,
      };
      flight.updateLocation(locationOutside);
      expect(flight.isInAirspace(airspace)).toBe(false);
    });

    test("should return true when flight is exactly on the edge of the airspace", () => {
      const locationOnEdge: FlightLocation = {
        coordinates: { latitude: 35.0, longitude: -105.0, altitude: 35000 },
        phase: FlightPhase.CRUISING,
      };
      flight.updateLocation(locationOnEdge);
      expect(flight.isInAirspace(airspace)).toBe(true);
    });
  });

  describe("Flight.getDistanceToDestination", () => {
    test("should return null if currentLocation is not set", () => {
      const currentLocation = flight.getCurrentLocation();
      expect(currentLocation).toBeNull();
    });
    test("should return distance to destination in nautical miles", () => {
      jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));
      flight.getEstimatedLocation();
      const distance = flight.getDistanceToDestination();
      expect(distance).toBeCloseTo(1058, 0);
    });

    test("should return 0 if at the destination", () => {
      const arrivalLocation: FlightLocation = {
        coordinates: arrivalCoordinates,
        phase: FlightPhase.ARRIVED,
      };
      flight.updateLocation(arrivalLocation);
      const distance = flight.getDistanceToDestination();
      expect(distance).toBe(0);
    });
  });

  describe("Flight.getLocationDescription", () => {
    test("should return 'At LAX, scheduled to depart at 2025-01-01T10:00:00.000Z'", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-01T09:59:00Z"));
      const description = flight.getLocationDescription();
      expect(description).toBe("At LAX, scheduled to depart");

      jest.useRealTimers();
    });

    test("should return 'Climbing after departure from LAX'", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-01T10:05:00Z"));
      const description = flight.getLocationDescription();
      expect(description).toBe("Climbing after departure from LAX");

      jest.useRealTimers();
    });

    test("should return 'Cruising 35000 feet, 1058nm from JFK'", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-01T12:00:00Z"));
      const description = flight.getLocationDescription();
      expect(description).toBe("Cruising 35000 feet, 1058nm from JFK");

      jest.useRealTimers();
    });

    test("should return 'Descending towards JFK'", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-01T13:50:00Z"));
      const description = flight.getLocationDescription();
      expect(description).toBe("Descending towards JFK");

      jest.useRealTimers();
    });

    test("should use real-time location if available", () => {
      flight.updateLocation({
        coordinates: { latitude: 39.0, longitude: -95.0, altitude: 30000 },
        phase: FlightPhase.CRUISING,
        groundSpeed: 450,
        estimatedTimeToDestination: 90,
      });
      const currentLocation = flight.getCurrentLocation();
      expect(currentLocation).not.toBeNull();
      const description = flight.getLocationDescription();
      expect(description).toBe("Cruising 30000 feet, 981nm from JFK");
    });

    test("should handle different flight phases with real-time data", () => {
      const phases = [
        {
          phase: FlightPhase.PRE_DEPARTURE,
          expected: "At LAX, scheduled to depart",
        },
        {
          phase: FlightPhase.TAXIING_OUT,
          expected: "Taxiing out at LAX",
        },
        { phase: FlightPhase.TAKEOFF, expected: "Taking off from LAX" },
        {
          phase: FlightPhase.CLIMBING,
          expected: "Climbing after departure from LAX",
        },
        {
          phase: FlightPhase.CRUISING,
          expected: "Cruising 35000 feet, 981nm from JFK",
        },
        {
          phase: FlightPhase.DESCENDING,
          expected: "Descending towards JFK",
        },
        { phase: FlightPhase.APPROACH, expected: "On approach to JFK" },
        { phase: FlightPhase.LANDING, expected: "Landing at JFK" },
        {
          phase: FlightPhase.TAXIING_IN,
          expected: "Taxiing in at arrival airport JFK",
        },
        { phase: FlightPhase.ARRIVED, expected: "Arrived at JFK" },
      ];

      phases.forEach(({ phase, expected }) => {
        flight.updateLocation({
          coordinates: { latitude: 39.0, longitude: -95.0, altitude: 35000 },
          phase,
        });
        const description = flight.getLocationDescription();

        expect(description).toBe(expected);
      });
    });
  });
});
