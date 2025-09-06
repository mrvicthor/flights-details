export class Coordinate {
  private readonly x: number;
  private readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Gets the X component of this coordinate (can have values -180 to +180).
   *
   * @return the x.
   */
  public getX(): number {
    return this.x;
  }

  /**
   * Gets the Y component of this coordinate (can have values -90 to +90).
   *
   * @return the y.
   */
  public getY(): number {
    return this.y;
  }
}
