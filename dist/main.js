"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const airspace_1 = require("./model/airspace");
const coordinate_1 = require("./model/coordinate");
const flight_1 = require("./model/flight");
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
    estimatedTimeToDestination: 120,
});
console.log("Problem 1 - Flight Location:");
console.log(`Current location:}`);
console.log(`Coordinates: Lat ${(_a = flight.getCurrentLocation()) === null || _a === void 0 ? void 0 : _a.coordinates.latitude}, Lng ${(_b = flight.getCurrentLocation()) === null || _b === void 0 ? void 0 : _b.coordinates.longitude}`);
// Problem 2: Determine if flight is within airspace
// Define US Central airspace (simplified rectangular boundary)
const centralAirspace = new airspace_1.Airspace(new coordinate_1.Coordinate(-105.0, 35.0), // Bottom left (longitude, latitude)
new coordinate_1.Coordinate(-90.0, 42.0) // Top right (longitude, latitude)
);
console.log("\nProblem 2 - Airspace Detection:");
console.log(`Flight is in Central US airspace: ${flight.isInAirspace(centralAirspace)}`);
// Alternative methods for airspace checking
console.log(`Airspace contains flight: ${centralAirspace.flightIsInAirspace(flight)}`);
// Test with different location
flight.updateLocation({
    coordinates: { latitude: 50.0, longitude: -100.0, altitude: 35000 }, // Outside airspace
});
console.log(`\nAfter moving north:`);
console.log(`Flight is in Central US airspace: ${flight.isInAirspace(centralAirspace)}`);
