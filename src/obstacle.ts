export class Obstacle {
  x: number;
  y: number;
  radius: number;
  r2: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.r2 = radius ** 2;
  }

  contains(x: number, y: number): boolean {
    return (this.x - x) ** 2 + (this.y - y) ** 2 < this.r2;
  }

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}
