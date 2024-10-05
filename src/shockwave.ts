import { Entity } from "./entities";
import type { Point } from "./utils";

export class Shockwave extends Entity {
	center: Point;
	innerRadius: number;
	outerRadius: number;
	speed: number;
	strength: number;

	constructor(
		center: Point,
		innerRadius: number,
		outerRadius: number,
		speed: number,
		strength: number,
	) {
		super();
		this.center = center;
		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
		this.speed = speed;
		this.strength = strength;
		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		this.innerRadius += delta * this.speed;
		this.outerRadius += delta * this.speed;
	}

	speedAt(point: Point) {
		const dx = point.x - this.center.x;
		const dy = point.y - this.center.y;
		const distance2 = dx * dx + dy * dy;
		if (
			(this.innerRadius > 0 &&
				distance2 < this.innerRadius * this.innerRadius) ||
			this.outerRadius < 0 ||
			distance2 > this.outerRadius * this.outerRadius
		) {
			return { dx: 0, dy: 0 };
		} else {
			return {
				dx: (dx / distance2) * this.strength * this.speed,
				dy: (dy / distance2) * this.strength * this.speed,
			};
		}
	}

	get gone() {
		return this.innerRadius > 1920;
	}
}
