import { Entity } from "./entities";
import type { Source } from "./source";
import type { Target } from "./target";
import { randomAroundPoint, type Point } from "./utils";

export class Ant extends Entity {
	position: Point;
	destination: Point | null;
	target: Target | null;
	direction: number;
	speed: number;
	state: "appearing" | "walking" | "carrying" | "dead" | "winning";
	level: number;

	constructor(source: Source | null, targets: Target[]) {
		super();

		this.level = 1;
		if (Math.random() < 0.2) {
			this.level = 2;
		}
		if (Math.random() < 0.05) {
			this.level = 3;
		}

		this.speed = [0, 200, 160, 120][this.level];

		if (!source) {
			const x = Math.random() * 1920;
			const y = Math.random() * 1080;
			this.position = { x, y };
			this.destination = null;
			this.target = null;
			this.direction = Math.random() * Math.PI * 2;
			this.state = "walking";
		} else {
			const { x, y } = randomAroundPoint(source.pos, 20);
			const target = targets[0];

			this.state = "appearing";
			this.position = { x, y };
			this.target = target;
			// destination, point towards the center
			const roughDirection = Math.atan2(
				this.target.position.y - this.position.y,
				this.target.position.x - this.position.x,
			);
			const angle =
				roughDirection + ((Math.random() - 0.5) * Math.PI) / 2;
			this.destination = {
				x: 0 * Math.cos(angle),
				y: 0 * Math.sin(angle),
			};
			this.direction = Math.atan2(
				this.target.position.y - this.destination.y - this.position.y,
				this.target.position.x - this.destination.x - this.position.x,
			);
		}
		this.addTicker((delta) => this.tick(delta));
	}

	setTarget(target: Target) {
		this.target = target;
		// destination, point towards the center
		const roughDirection = Math.atan2(
			this.target.position.y - this.position.y,
			this.target.position.x - this.position.x,
		);
		const angle = roughDirection + ((Math.random() - 0.5) * Math.PI) / 2;
		this.destination = {
			x: 0 * Math.cos(angle),
			y: 0 * Math.sin(angle),
		};
		this.direction = Math.atan2(
			this.target.position.y - this.destination.y - this.position.y,
			this.target.position.x - this.destination.x - this.position.x,
		);
		if (this.isCloseToTarget()) {
			this.die();
		}
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
			case "dead":
			case "winning":
				return;
		}
	}

	dieDuration = 10;

	get gone() {
		return this.state == "dead" && this.lt > this.dieDuration;
	}

	get deltas() {
		if (!this.target || !this.destination) {
			return { dx: 0, dy: 0, ok: false };
		}
		return {
			dx: this.target.position.x - this.destination.x - this.position.x,
			dy: this.target.position.y - this.destination.y - this.position.y,
			ok: true,
		};
	}

	get distance2() {
		const { dx, dy, ok } = this.deltas;
		if (!ok) {
			return Infinity;
		}
		return dx * dx + dy * dy;
	}

	isCloseToTarget() {
		if (!this.target || !this.destination) {
			return false;
		}
		const dx =
			this.target.position.x - this.destination.x - this.position.x;
		const dy =
			this.target.position.y - this.destination.y - this.position.y;

		const dxn = dx / this.target.radiusX;
		const dyn = dy / this.target.radiusY;

		return dxn * dxn + dyn * dyn < 1;
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
		const { dx, dy, ok } = this.deltas;
		if (ok) {
			this.direction = Math.atan2(dy, dx);
		}
		const speed = ok ? this.speed : this.speed / 3;

		this.position.x += Math.cos(this.direction) * delta * speed;
		this.position.y += Math.sin(this.direction) * delta * speed;

		// stop at the edge
		if (this.position.x < 0) {
			this.position.x = 0;
			this.direction = Math.PI - this.direction;
		}
		if (this.position.x > 1920) {
			this.position.x = 1920;
			this.direction = Math.PI - this.direction;
		}
		if (this.position.y < 0) {
			this.position.y = 0;
			this.direction = -this.direction;
		}
		if (this.position.y > 1080) {
			this.position.y = 1080;
			this.direction = -this.direction;
		}

		// carry when getting close to destination
		if (this.isCloseToTarget()) {
			this.state = "carrying";
		}
	}

	carry(_delta: number) {
		if (!this.isCloseToTarget()) {
			this.state = "walking";
		}
	}

	win() {
		this.state = "winning";
	}
}
