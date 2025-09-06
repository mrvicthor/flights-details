import { Coordinates, FlightLocation, FlightPhase } from "../types";
import { Airspace } from "./airspace";
import { Coordinate } from "./coordinate";

export class Flight {
  private readonly arrivalAerodrome: string;
  private readonly arrivalTime: Date;
  private readonly departureAerodrome: string;
  private readonly departureTime: Date;
  private currentLocation: FlightLocation | null = null;
  private readonly departureCoordinates: Coordinates;
  private readonly arrivalCoordinates: Coordinates;

  constructor(
    arrivalAerodrome: string,
    arrivalTime: Date,
    departureAerodrome: string,
    departureTime: Date,
    departureCoordinates: Coordinates,
    arrivalCoordinates: Coordinates
  ) {
    this.arrivalAerodrome = arrivalAerodrome;
    this.arrivalTime = arrivalTime;
    this.departureAerodrome = departureAerodrome;
    this.departureTime = departureTime;
    this.departureCoordinates = departureCoordinates;
    this.arrivalCoordinates = arrivalCoordinates;
  }

  /**
   * Gets the aerodrome the flight is arriving at.
   *
   * @return the arrival aerodrome.
   */
  public getArrivalAerodrome(): string {
    return this.arrivalAerodrome;
  }

  /**
   * Gets the date/time the flight is arriving.
   *
   * @return the arrival time.
   */

  public getArrivalTime(): Date {
    return this.arrivalTime;
  }

  /**
   * Gets the aerodrome the flight is departing from.
   *
   * @return the departure aerodrome.
   */
  public getDepartureAerodrome(): string {
    return this.departureAerodrome;
  }

  /**
   * Gets the date/time the flight is departing.
   *
   * @return the departure time.
   */
  public getDepartureTime(): Date {
    return this.departureTime;
  }

  /**
   * Updates the current location of the flight.
   *
   * @param location The current flight location information.
   */

  public updateLocation(location: FlightLocation): void {
    this.currentLocation = location;
  }

  /**
   * Gets the current location of the flight.
   *
   * @return the current flight location, or null if not available.
   */
  public getCurrentLocation(): FlightLocation | null {
    return this.currentLocation;
  }

  /**
   * Determines the current location of the flight based on time.
   * This provides an estimated location when real-time data isn't available.
   *
   * @return estimated flight location based on scheduled times.
   */
  public getEstimatedLocation(): FlightLocation {
    const now = new Date();

    if (now < this.departureTime) {
      return {
        coordinates: this.departureCoordinates,
        phase: FlightPhase.PRE_DEPARTURE,
      };
    }
    if (now > this.arrivalTime) {
      return {
        coordinates: this.arrivalCoordinates,
        phase: FlightPhase.ARRIVED,
      };
    }
    const totalFlightTime =
      this.arrivalTime.getTime() - this.departureTime.getTime();
    const elapsedTime = now.getTime() - this.departureTime.getTime();
    const progress = elapsedTime / totalFlightTime;

    const latitude =
      this.departureCoordinates.latitude +
      (this.arrivalCoordinates.latitude - this.departureCoordinates.latitude) *
        progress;
    const longitude =
      this.departureCoordinates.longitude +
      (this.arrivalCoordinates.longitude -
        this.departureCoordinates.longitude) *
        progress;

    let altitude = 0;
    let phase = FlightPhase.CRUISING;

    if (progress < 0.1) {
      altitude = progress * 10 * 35000;
      phase = FlightPhase.CLIMBING;
    } else if (progress > 0.9) {
      altitude = (1 - progress) * 10 * 35000;
      phase = FlightPhase.DESCENDING;
    } else {
      altitude = 35000;
      phase = FlightPhase.CRUISING;
    }

    const remainingTimeInMinutes =
      (this.arrivalTime.getTime() - now.getTime()) / (1000 * 60);
    return {
      coordinates: {
        latitude,
        longitude,
        altitude,
      },
      phase,
      estimatedTimeToDestination: Math.max(0, remainingTimeInMinutes),
    };
  }

  /**
   * Gets the current location or estimated location as a Coordinate object.
   *
   * @return the current position as a Coordinate.
   */
  public getCurrentCoordinate(): Coordinate {
    const location = this.currentLocation || this.getEstimatedLocation();
    return new Coordinate(
      location.coordinates.longitude,
      location.coordinates.latitude
    );
  }

  /**
   * Determines if this flight is currently within the specified airspace.
   *
   * @param airspace the airspace to check against.
   * @return true if the flight is within the airspace boundaries.
   */
  public isInAirspace(airspace: Airspace): boolean {
    return airspace.flightIsInAirspace(this);
  }

  /**
   * Calculates the distance from the current location to the destination.
   *
   * @return distance to destination in nautical miles, or null if location unavailable.
   */
  public getDistanceToDestination(): number | null {
    const location = this.currentLocation || this.getEstimatedLocation();
    if (!location) {
      return null;
    }
    return this.calculateDistance(
      location.coordinates,
      this.arrivalCoordinates
    );
  }

  /**
   * Checks if the flight is currently airborne.
   *
   * @return true if the flight is in the air.
   */
  public isAirborne(): boolean {
    const location = this.currentLocation || this.getEstimatedLocation();

    return [
      FlightPhase.TAKEOFF,
      FlightPhase.CLIMBING,
      FlightPhase.CRUISING,
      FlightPhase.DESCENDING,
      FlightPhase.APPROACH,
    ].includes(location.phase);
  }

  /**
   * Gets a human-readable description of the flight's current status.
   *
   * @return description of current flight status.
   */
  public getLocationDescription(): string {
    const location = this.currentLocation || this.getEstimatedLocation();

    switch (location.phase) {
      case FlightPhase.PRE_DEPARTURE:
        return `At ${this.departureAerodrome}, scheduled to depart`;
      case FlightPhase.TAXIING_OUT:
        return `Taxiing out at ${this.departureAerodrome}`;
      case FlightPhase.TAKEOFF:
        return `Taking off from ${this.departureAerodrome}`;
      case FlightPhase.CLIMBING:
        return `Climbing after departure from ${this.departureAerodrome}`;
      case FlightPhase.CRUISING:
        const distance = this.getDistanceToDestination();
        return (
          `Cruising ${
            location.coordinates.altitude?.toFixed(0) || "unknown"
          } feet` +
          (distance
            ? `, ${distance.toFixed(0)}nm from ${this.arrivalAerodrome}`
            : "")
        );
      case FlightPhase.DESCENDING:
        return `Descending towards ${this.arrivalAerodrome}`;
      case FlightPhase.APPROACH:
        return `On approach to ${this.arrivalAerodrome}`;
      case FlightPhase.LANDING:
        return `Landing at ${this.arrivalAerodrome}`;
      case FlightPhase.TAXIING_IN:
        return `Taxiing in at arrival airport ${this.arrivalAerodrome}`;
      case FlightPhase.ARRIVED:
        return `Arrived at ${this.arrivalAerodrome}`;
      default:
        return "Status unknown";
    }
  }

  /**
   * Calculates the great circle distance between two coordinates.
   * Uses the Haversine formula.
   *
   * @param coord1 First coordinate.
   * @param coord2 Second coordinate.
   * @return distance in nautical miles.
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const R = 3440.065; // Earth radius in nautical miles
    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coord1.latitude)) *
        Math.cos(toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
