import { Coordinates, FlightLocation } from "../types";
import { Airspace } from "./airspace";

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
  getArrivalAerodrome(): string {
    return this.arrivalAerodrome;
  }

  /**
   * Gets the date/time the flight is arriving.
   *
   * @return the arrival time.
   */

  getArrivalTime(): Date {
    return this.arrivalTime;
  }

  /**
   * Gets the aerodrome the flight is departing from.
   *
   * @return the departure aerodrome.
   */
  getDepartureAerodrome(): string {
    return this.departureAerodrome;
  }

  /**
   * Gets the date/time the flight is departing.
   *
   * @return the departure time.
   */
  getDepartureTime(): Date {
    return this.departureTime;
  }

  /**
   * Updates the current location of the flight.
   *
   * @param location The current flight location information.
   */

  updateLocation(location: FlightLocation): void {
    this.currentLocation = location;
  }

  /**
   * Gets the current location of the flight.
   *
   * @return the current flight location, or null if not available.
   */
  getCurrentLocation(): FlightLocation | null {
    return this.currentLocation;
  }

  /**
   * Determines the current location of the flight based on time.
   * This provides an estimated location when real-time data isn't available.
   *
   * @return estimated flight location based on scheduled times.
   */
  getEstimatedLocation(): FlightLocation {
    const now = new Date();

    if (now < this.departureTime) {
      return {
        coordinates: this.departureCoordinates,
      };
    }
    if (now > this.arrivalTime) {
      return {
        coordinates: this.arrivalCoordinates,
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

    const remainingTimeInMinutes =
      (this.arrivalTime.getTime() - now.getTime()) / (1000 * 60);
    return {
      coordinates: {
        latitude,
        longitude,
      },

      estimatedTimeToDestination: Math.max(0, remainingTimeInMinutes),
    };
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
}
