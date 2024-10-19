import type { Point } from "./utils";

type ShockwaveType = "shockwave" | "push" | "bomb";

export class Shockwave {
	lt = 0;
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
		this.type = type;
		this.center = center;
		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
		this.speed = speed;
		this.strength = strength;
	}

	tick(delta: number) {
		this.lt += delta;
		this.innerRadius += delta * this.speed;
		this.outerRadius += delta * this.speed;
	}

	minDistance = 50;
	distanceForStrength(point: Point) {
		const dx = point.x - this.center.x;
		const dy = point.y - this.center.y;
		return Math.max(this.minDistance ** 2, dx * dx + dy * dy);
	}
	timeDistance(point: Point, delta: number) {
		const distance2 = this.distanceForStrength(point);
		/// Calculate, for time from -delta/2 to delta/2, how long we are inside the shockwave.
		// Given an epsilon, we are inside if:
		//  (outerRadius - distance) / speed >= epsilon >= (innerRadius - distance) / speed
		const minEpsilon = Math.max(
			-delta / 2,
			(this.innerRadius - Math.sqrt(distance2)) / this.speed,
		);
		const maxEpsilon = Math.min(
			delta / 2,
			(this.outerRadius - Math.sqrt(distance2)) / this.speed,
		);
		return Math.max(0, maxEpsilon - minEpsilon);
	}
	strengthAt(point: Point, delta: number) {
		const distance2 = this.distanceForStrength(point);
		const timeDistance = this.timeDistance(point, delta);
		const bombFactor = this.type == "bomb" ? 7 : 1;
		return (
			((this.strength * this.minDistance) / Math.sqrt(distance2)) *
			bombFactor *
			this.speed *
			timeDistance
		);
	}
	nearStrengthAt(point: Point) {
		const distance2 = this.distanceForStrength(point);
		const bombFactor = this.type == "bomb" ? 7 : 1;
		return (
			((this.strength * this.minDistance ** 2) / distance2) * bombFactor
		);
	}
	speedAt(point: Point, delta: number) {
		const dx = point.x - this.center.x;
		const dy = point.y - this.center.y;
		const distance2 = this.distanceForStrength(point);
		const timeDistance = this.timeDistance(point, delta);
		const bombFactor = this.type == "bomb" ? 7 : 1;
		const totalFactor =
			(this.strength * this.speed * bombFactor * timeDistance) /
			distance2;
		return { dx: dx * totalFactor, dy: dy * totalFactor };
	}
	passedPoint(point: Point) {
		const distance2 = this.distanceForStrength(point);
		return this.outerRadius ** 2 >= distance2;
	}

	get gone() {
		return this.innerRadius > 1920;
	}
}
