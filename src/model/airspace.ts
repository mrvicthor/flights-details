import { Coordinate } from "./coordinate";
import { Flight } from "./flight";

export class Airspace {
  private readonly bottomLeft: Coordinate;
  private readonly topRight: Coordinate;

  constructor(bottomLeft: Coordinate, topRight: Coordinate) {
    this.bottomLeft = bottomLeft;
    this.topRight = topRight;
  }

  /**
   * Gets the bottom left coordinate of this airspace.
   *
   * @return the bottom left.
   */
  public getBottomLeft(): Coordinate {
    return this.bottomLeft;
  }

  /**
   * Gets the top right coordinate of this airspace.
   *
   * @return the top right.
   */
  public getTopRight(): Coordinate {
    return this.topRight;
  }

  /**
   * Determines if a coordinate is within this airspace.
   *
   * @param coordinate the coordinate to check.
   * @return true if the coordinate is within the airspace boundaries.
   */

  public contains(coordinate: Coordinate): boolean {
    const x = coordinate.getX();
    const y = coordinate.getY();
    return (
      x >= this.bottomLeft.getX() &&
      x <= this.topRight.getX() &&
      y >= this.bottomLeft.getY() &&
      y <= this.topRight.getY()
    );
  }

  /**
   * Determines if a flight is currently within this airspace.
   *
   * @param flight the flight to check.
   * @return true if the flight is within the airspace boundaries.
   */

  public flightIsInAirspace(flight: Flight): boolean {
    const location = flight.getCurrentLocation();

    if (!location) {
      return false;
    }
    const coordinate = new Coordinate(
      location.coordinates.longitude,
      location.coordinates.latitude
    );
    return this.contains(coordinate);
  }
}
