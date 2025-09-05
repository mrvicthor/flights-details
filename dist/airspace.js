"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Airspace = exports.Coordinate = void 0;
class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Gets the X component of this coordinate (can have values -180 to +180).
     *
     * @return the x.
     */
    getX() {
        return this.x;
    }
    /**
     * Gets the Y component of this coordinate (can have values -90 to +90).
     *
     * @return the y.
     */
    getY() {
        return this.y;
    }
}
exports.Coordinate = Coordinate;
class Airspace {
    constructor(bottomLeft, topRight) {
        this.bottomLeft = bottomLeft;
        this.topRight = topRight;
    }
    /**
     * Gets the bottom left coordinate of this airspace.
     *
     * @return the bottom left.
     */
    getBottomLeft() {
        return this.bottomLeft;
    }
    /**
     * Gets the top right coordinate of this airspace.
     *
     * @return the top right.
     */
    getTopRight() {
        return this.topRight;
    }
    /**
     * Determines if a coordinate is within this airspace.
     *
     * @param coordinate the coordinate to check.
     * @return true if the coordinate is within the airspace boundaries.
     */
    contains(coordinate) {
        const x = coordinate.getX();
        const y = coordinate.getY();
        return (x >= this.bottomLeft.getX() &&
            x <= this.topRight.getX() &&
            y >= this.bottomLeft.getY() &&
            y <= this.topRight.getY());
    }
    /**
     * Determines if a flight is currently within this airspace.
     *
     * @param flight the flight to check.
     * @return true if the flight is within the airspace boundaries.
     */
    flightIsInAirspace(flight) {
        const location = flight.getCurrentLocation();
        if (!location) {
            return false;
        }
        const coordinate = new Coordinate(location.coordinates.longitude, location.coordinates.latitude);
        return this.contains(coordinate);
    }
}
exports.Airspace = Airspace;
