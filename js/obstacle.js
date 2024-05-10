export class Obstacle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.r2 = Math.pow(radius, 2);
    }
    contains(x, y) {
        return Math.pow((this.x - x), 2) + Math.pow((this.y - y), 2) < this.r2;
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
