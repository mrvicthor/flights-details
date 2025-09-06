"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coordinate = void 0;
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
