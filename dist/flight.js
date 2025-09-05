"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flight = exports.FlightPhase = void 0;
const airspace_1 = require("./airspace");
var FlightPhase;
(function (FlightPhase) {
    FlightPhase["PRE_DEPARTURE"] = "PRE_DEPARTURE";
    FlightPhase["TAXIING_OUT"] = "TAXIING_OUT";
    FlightPhase["TAKEOFF"] = "TAKEOFF";
    FlightPhase["CLIMBING"] = "CLIMBING";
    FlightPhase["CRUISING"] = "CRUISING";
    FlightPhase["DESCENDING"] = "DESCENDING";
    FlightPhase["APPROACH"] = "APPROACH";
    FlightPhase["LANDING"] = "LANDING";
    FlightPhase["TAXIING_IN"] = "TAXIING_IN";
    FlightPhase["ARRIVED"] = "ARRIVED";
})(FlightPhase || (exports.FlightPhase = FlightPhase = {}));
class Flight {
    constructor(arrivalAerodrome, arrivalTime, departureAerodrome, departureTime, departureCoordinates, arrivalCoordinates) {
        this.currentLocation = null;
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
    getArrivalAerodrome() {
        return this.arrivalAerodrome;
    }
    /**
     * Gets the date/time the flight is arriving.
     *
     * @return the arrival time.
     */
    getArrivalTime() {
        return this.arrivalTime;
    }
    /**
     * Gets the aerodrome the flight is departing from.
     *
     * @return the departure aerodrome.
     */
    getDepartureAerodrome() {
        return this.departureAerodrome;
    }
    /**
     * Gets the date/time the flight is departing.
     *
     * @return the departure time.
     */
    getDepartureTime() {
        return this.departureTime;
    }
    /**
     * Updates the current location of the flight.
     *
     * @param location The current flight location information.
     */
    updateLocation(location) {
        this.currentLocation = location;
    }
    /**
     * Gets the current location of the flight.
     *
     * @return the current flight location, or null if not available.
     */
    getCurrentLocation() {
        return this.currentLocation;
    }
    /**
     * Determines the current location of the flight based on time.
     * This provides an estimated location when real-time data isn't available.
     *
     * @return estimated flight location based on scheduled times.
     */
    getEstimatedLocation() {
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
        const totalFlightTime = this.arrivalTime.getTime() - this.departureTime.getTime();
        const elapsedTime = now.getTime() - this.departureTime.getTime();
        const progress = elapsedTime / totalFlightTime;
        const latitude = this.departureCoordinates.latitude +
            (this.arrivalCoordinates.latitude - this.departureCoordinates.latitude) *
                progress;
        const longitude = this.departureCoordinates.longitude +
            (this.arrivalCoordinates.longitude -
                this.departureCoordinates.longitude) *
                progress;
        let altitude = 0;
        let phase = FlightPhase.CRUISING;
        if (progress < 0.1) {
            altitude = progress * 10 * 35000;
            phase = FlightPhase.CLIMBING;
        }
        else if (progress > 0.9) {
            altitude = (1 - progress) * 10 * 35000;
            phase = FlightPhase.DESCENDING;
        }
        else {
            altitude = 35000;
            phase = FlightPhase.CRUISING;
        }
        const remainingTimeInMinutes = (this.arrivalTime.getTime() - now.getTime()) / (1000 * 60);
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
    getCurrentCoordinate() {
        const location = this.currentLocation || this.getEstimatedLocation();
        return new airspace_1.Coordinate(location.coordinates.longitude, location.coordinates.latitude);
    }
    /**
     * Determines if this flight is currently within the specified airspace.
     *
     * @param airspace the airspace to check against.
     * @return true if the flight is within the airspace boundaries.
     */
    isInAirspace(airspace) {
        return airspace.flightIsInAirspace(this);
    }
    /**
     * Calculates the distance from the current location to the destination.
     *
     * @return distance to destination in nautical miles, or null if location unavailable.
     */
    getDistanceToDestination() {
        const location = this.currentLocation || this.getEstimatedLocation();
        if (!location) {
            return null;
        }
        return this.calculateDistance(location.coordinates, this.arrivalCoordinates);
    }
    /**
     * Checks if the flight is currently airborne.
     *
     * @return true if the flight is in the air.
     */
    isAirborne() {
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
    getLocationDescription() {
        var _a;
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
                return (`Cruising ${((_a = location.coordinates.altitude) === null || _a === void 0 ? void 0 : _a.toFixed(0)) || "unknown"} feet` +
                    (distance
                        ? `, ${distance.toFixed(0)}nm from ${this.arrivalAerodrome}`
                        : ""));
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
    calculateDistance(coord1, coord2) {
        const toRadians = (degrees) => (degrees * Math.PI) / 180;
        const R = 3440.065; // Earth radius in nautical miles
        const dLat = toRadians(coord2.latitude - coord1.latitude);
        const dLon = toRadians(coord2.longitude - coord1.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(coord1.latitude)) *
                Math.cos(toRadians(coord2.latitude)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
exports.Flight = Flight;
const arrivalAerodrome = "JFK";
const arrivalTime = new Date("2025-01-01T14:00:00Z");
const departureAerodrome = "LAX";
const departureTime = new Date("2025-01-01T10:00:00Z");
const departureCoordinates = {
    latitude: 33.9425,
    longitude: -118.4081,
};
const arrivalCoordinates = {
    latitude: 40.6413,
    longitude: -73.7781,
};
const flight = new Flight(arrivalAerodrome, arrivalTime, departureAerodrome, departureTime, departureCoordinates, arrivalCoordinates);
// Problem 1
flight.updateLocation({
    coordinates: { latitude: 39.0, longitude: -95.0, altitude: 35000 },
    phase: FlightPhase.CRUISING,
    groundSpeed: 450,
    heading: 75,
    estimatedTimeToDestination: 120,
});
console.log("Problem 1 - Flight Location:");
console.log(`Current location: ${flight.getLocationDescription()}`);
console.log(`Coordinates: Lat ${flight.getCurrentCoordinate().getY()}, Lng ${flight
    .getCurrentCoordinate()
    .getX()}`);
console.log(`Distance to destination: ${flight.getDistanceToDestination()} nm`);
console.log(`Is airborne: ${flight.isAirborne()}`);
// Problem 2: Determine if flight is within airspace
// Define US Central airspace (simplified rectangular boundary)
const centralAirspace = new airspace_1.Airspace(new airspace_1.Coordinate(-105.0, 35.0), // Bottom left (longitude, latitude)
new airspace_1.Coordinate(-90.0, 42.0) // Top right (longitude, latitude)
);
console.log("\nProblem 2 - Airspace Detection:");
console.log(`Flight is in Central US airspace: ${flight.isInAirspace(centralAirspace)}`);
// Alternative methods for airspace checking
console.log(`Airspace contains flight: ${centralAirspace.flightIsInAirspace(flight)}`);
console.log(`Airspace contains coordinate: ${centralAirspace.contains(flight.getCurrentCoordinate())}`);
// Test with different location
flight.updateLocation({
    coordinates: { latitude: 50.0, longitude: -100.0, altitude: 35000 }, // Outside airspace
    phase: FlightPhase.CRUISING,
});
console.log(`\nAfter moving north:`);
console.log(`Flight is in Central US airspace: ${flight.isInAirspace(centralAirspace)}`);
