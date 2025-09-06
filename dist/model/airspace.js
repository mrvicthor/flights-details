"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Airspace = void 0;
const coordinate_1 = require("./coordinate");
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
        const coordinate = new coordinate_1.Coordinate(location.coordinates.longitude, location.coordinates.latitude);
        return this.contains(coordinate);
    }
}
exports.Airspace = Airspace;
