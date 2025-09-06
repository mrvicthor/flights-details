"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const airspace_1 = require("../model/airspace");
const coordinate_1 = require("../model/coordinate");
const bottomLeft = new coordinate_1.Coordinate(0, 0);
const topRight = new coordinate_1.Coordinate(10, 10);
describe("Airspace", () => {
    let airspace;
    beforeEach(() => {
        airspace = new airspace_1.Airspace(bottomLeft, topRight);
    });
    test("should return the bottom left coordinate", () => {
        const result = airspace.getBottomLeft();
        expect(result).toBe(bottomLeft);
    });
    test("should return the top right", () => {
        const result = airspace.getTopRight();
        expect(result).toBe(topRight);
    });
    describe("Flight within airspace", () => {
        test("should return true if a flight is within the airspace", () => {
            const coordinate = new coordinate_1.Coordinate(5, 5);
            expect(airspace.contains(coordinate)).toBe(true);
        });
        test("should return false if a flight is outside the airspace", () => {
            const coordinate = new coordinate_1.Coordinate(15, 5);
            expect(airspace.contains(coordinate)).toBe(false);
        });
        test("should return true if a flight is on the edge of the airspace", () => {
            const coordinate = new coordinate_1.Coordinate(0, 10);
            expect(airspace.contains(coordinate)).toBe(true);
        });
        test("should return false for a point below the bottom left", () => {
            const coordinate = new coordinate_1.Coordinate(-1, -1);
            expect(airspace.contains(coordinate)).toBe(false);
        });
    });
});
