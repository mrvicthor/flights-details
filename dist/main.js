"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const airspace_1 = require("./model/airspace");
const coordinate_1 = require("./model/coordinate");
const flight_1 = require("./model/flight");
const types_1 = require("./types");
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
const flight = new flight_1.Flight(arrivalAerodrome, arrivalTime, departureAerodrome, departureTime, departureCoordinates, arrivalCoordinates);
// Problem 1
flight.updateLocation({
    coordinates: { latitude: 39.0, longitude: -95.0, altitude: 35000 },
    phase: types_1.FlightPhase.CRUISING,
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
const centralAirspace = new airspace_1.Airspace(new coordinate_1.Coordinate(-105.0, 35.0), // Bottom left (longitude, latitude)
new coordinate_1.Coordinate(-90.0, 42.0) // Top right (longitude, latitude)
);
console.log("\nProblem 2 - Airspace Detection:");
console.log(`Flight is in Central US airspace: ${flight.isInAirspace(centralAirspace)}`);
// Alternative methods for airspace checking
console.log(`Airspace contains flight: ${centralAirspace.flightIsInAirspace(flight)}`);
console.log(`Airspace contains coordinate: ${centralAirspace.contains(flight.getCurrentCoordinate())}`);
// Test with different location
flight.updateLocation({
    coordinates: { latitude: 50.0, longitude: -100.0, altitude: 35000 }, // Outside airspace
    phase: types_1.FlightPhase.CRUISING,
});
console.log(`\nAfter moving north:`);
console.log(`Flight is in Central US airspace: ${flight.isInAirspace(centralAirspace)}`);
