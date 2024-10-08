import { Entity } from "./entities";
import type { Point } from "./utils";

type ShockwaveType = "shockwave" | "push" | "bomb";

export class Shockwave extends Entity {
	center: Point;
	innerRadius: number;
	outerRadius: number;
	speed: number;
	strength: number;
	type: ShockwaveType;

	constructor(
		center: Point,
		innerRadius: number,
		outerRadius: number,
		speed: number,
		strength: number,
		type: ShockwaveType = "shockwave",
	) {
		super();
		this.type = type;
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

	minDistance = 50;
	speedAt(point: Point) {
		const dx = point.x - this.center.x;
		const dy = point.y - this.center.y;
		const distance2 = Math.max(this.minDistance ** 2, dx * dx + dy * dy);
		if (
			(this.innerRadius > 0 &&
				distance2 < this.innerRadius * this.innerRadius) ||
			this.outerRadius < 0 ||
			distance2 > this.outerRadius * this.outerRadius
		) {
			return { dx: 0, dy: 0, strength: 0, nearStrength: 0 };
		} else {
			const bombFactor = this.type == "bomb" ? 7 : 1;
			return {
				dx: (dx / distance2) * this.strength * this.speed * bombFactor,
				dy: (dy / distance2) * this.strength * this.speed * bombFactor,
				strength:
					((this.strength * this.minDistance) /
						Math.sqrt(distance2)) *
					bombFactor,
				nearStrength:
					((this.strength * this.minDistance ** 2) / distance2) *
					bombFactor,
			};
		}
	}

	get gone() {
		return this.innerRadius > 1920;
	}
}
