import { Entity } from "./entities";
import type { Target } from "./target";
import type { Point } from "./utils";

export class Ant extends Entity {
	position: Point;
	destination: Point;
	target: Target;
	direction: number;
	speed: number;
	state: "appearing" | "walking" | "carrying" | "dead";
	level: number;

	constructor(x: number, y: number, target: Target) {
		super();
		this.state = "appearing";
		this.position = { x, y };
		this.target = target;
		// destination, point towards the center
		const roughDirection = Math.atan2(
			this.target.position.y - this.position.y,
			this.target.position.x - this.position.x,
		);
		const angle = roughDirection + ((Math.random() - 0.5) * Math.PI) / 2;
		this.destination = {
			x: 50 * Math.cos(angle),
			y: 50 * Math.sin(angle),
		};
		this.direction = Math.atan2(
			this.target.position.y - this.destination.y - this.position.y,
			this.target.position.x - this.destination.x - this.position.x,
		);
		this.level = 1;
		if (Math.random() < 0.2) {
			this.level = 2;
		}
		if (Math.random() < 0.05) {
			this.level = 3;
		}

		this.speed = [0, 200, 160, 120][this.level];

		this.addTicker((delta) => this.tick(delta));
	}

	get rotation() {
		const { dx, dy } = this.deltas;
		return Math.atan2(dy, dx);
	}

	tick(delta: number) {
		switch (this.state) {
			case "appearing": {
				this.appear(delta);
				return;
			}
			case "walking": {
				this.walk(delta);
				return;
			}
			case "carrying": {
				this.carry(delta);
				return;
			}
			case "dead": {
				return;
			}
		}
	}

	dieDuration = 10;

	get gone() {
		return this.state == "dead" && this.lt > this.dieDuration;
	}

	get deltas() {
		return {
			dx: this.target.position.x - this.destination.x - this.position.x,
			dy: this.target.position.y - this.destination.y - this.position.y,
		};
	}

	getDistance() {
		const { dx, dy } = this.deltas;
		return Math.sqrt(dx * dx + dy * dy);
	}

	die() {
		this.state = "dead";
		this.lt = 0;
	}

	appearDuration = 0.5;

	appear(_delta: number) {
		if (this.lt > this.appearDuration) {
			this.state = "walking";
		}
	}

	walk(delta: number) {
		const { dx, dy } = this.deltas;
		this.direction = Math.atan2(dy, dx);

		this.position.x += Math.cos(this.direction) * delta * this.speed;
		this.position.y += Math.sin(this.direction) * delta * this.speed;

		// stop at the edge
		if (this.position.x < 0) {
			this.position.x = 0;
		}
		if (this.position.x > 1920) {
			this.position.x = 1920;
		}
		if (this.position.y < 0) {
			this.position.y = 0;
		}
		if (this.position.y > 1080) {
			this.position.y = 1080;
		}

		// carry when getting close to destination
		if (this.getDistance() < 10) {
			this.state = "carrying";
		}
	}

	carry(_delta: number) {
		if (this.getDistance() > 15) {
			this.state = "walking";
		}
	}
}
