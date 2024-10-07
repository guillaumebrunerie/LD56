import { Entity } from "./entities";
import { distanceBetween, type Point } from "./utils";

export class Freeze extends Entity {
	pos: Point;

	appearDuration = 0.5;
	activeDuration = 5;
	disappearDuration = 1;
	radius = 300;

	timeout = this.appearDuration;

	state: "appearing" | "active" | "disappearing" | "gone";

	constructor(pos: Point) {
		super();
		this.pos = pos;
		this.state = "appearing";
	}

	tick(delta: number) {
		this.timeout -= delta;
		if (this.timeout < 0) {
			switch (this.state) {
				case "appearing":
					this.state = "active";
					this.timeout = this.activeDuration;
					break;
				case "active":
					this.state = "disappearing";
					this.timeout = this.disappearDuration;
					break;
				case "disappearing":
					this.state = "gone";
					break;
			}
		}
	}

	containsPoint(pos: Point) {
		if (this.state !== "active") {
			return false;
		}
		return distanceBetween(pos, this.pos) < this.radius;
	}
}
