import { Airspace } from "../model/airspace";
import { Coordinate } from "../model/coordinate";

const bottomLeft = new Coordinate(0, 0);
const topRight = new Coordinate(10, 10);

describe("Airspace", () => {
  let airspace: Airspace;
  beforeEach(() => {
    airspace = new Airspace(bottomLeft, topRight);
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
      const coordinate = new Coordinate(5, 5);
      expect(airspace.contains(coordinate)).toBe(true);
    });

    test("should return false if a flight is outside the airspace", () => {
      const coordinate = new Coordinate(15, 5);
      expect(airspace.contains(coordinate)).toBe(false);
    });

    test("should return true if a flight is on the edge of the airspace", () => {
      const coordinate = new Coordinate(0, 10);
      expect(airspace.contains(coordinate)).toBe(true);
    });

    test("should return false for a point below the bottom left", () => {
      const coordinate = new Coordinate(-1, -1);
      expect(airspace.contains(coordinate)).toBe(false);
    });
  });
});
