import { Entity } from "./entities";
import type { Shockwave } from "./shockwave";
import type { Source } from "./source";
import type { Target } from "./target";
import { distanceBetween, randomAroundPoint, type Point } from "./utils";

export class Ant extends Entity {
	pos: Point;
	destination: Point | null;
	target: Target | null;
	direction: number;
	speed: number;
	state:
		| "appearing"
		| "walking"
		| "carrying"
		| "dead"
		| "winning"
		| "stunned";
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

		this.speed =
			[0, 200, 160, 120][this.level] + (Math.random() - 0.5) * 100;

		if (!source) {
			const x = Math.random() * 1920;
			const y = Math.random() * 1080;
			this.pos = { x, y };
			this.destination = null;
			this.target = null;
			this.direction = Math.random() * Math.PI * 2;
			this.state = "walking";
		} else {
			const { x, y } = randomAroundPoint(source.pos, 20);
			const target = targets[0];

			this.state = "appearing";
			this.pos = { x, y };
			this.target = target;
			// destination, point towards the center
			const roughDirection = Math.atan2(
				this.target.position.y - this.pos.y,
				this.target.position.x - this.pos.x,
			);
			const angle =
				roughDirection + ((Math.random() - 0.5) * Math.PI) / 2;
			this.destination = {
				x: 0 * Math.cos(angle),
				y: 0 * Math.sin(angle),
			};
			this.direction = Math.atan2(
				this.target.position.y - this.destination.y - this.pos.y,
				this.target.position.x - this.destination.x - this.pos.x,
			);
		}
		this.addTicker((delta) => this.tick(delta));
	}

	setTarget(target: Target) {
		this.target = target;
		// destination, point towards the center
		const roughDirection = Math.atan2(
			this.target.position.y - this.pos.y,
			this.target.position.x - this.pos.x,
		);
		const angle = roughDirection + ((Math.random() - 0.5) * Math.PI) / 2;
		this.destination = {
			x: 0 * Math.cos(angle),
			y: 0 * Math.sin(angle),
		};
		this.direction = Math.atan2(
			this.target.position.y - this.destination.y - this.pos.y,
			this.target.position.x - this.destination.x - this.pos.x,
		);
		if (this.distanceToTarget() < 1) {
			this.die();
		}
	}

	get rotation() {
		const { dx, dy } = this.deltas;
		return Math.atan2(dy, dx);
	}

	stunnedCooldown = 0;
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
			case "stunned": {
				this.stunnedCooldown -= delta;
				if (this.stunnedCooldown < 0) {
					this.stunnedCooldown = 0;
					this.state = "walking";
				}
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
			dx: this.target.position.x - this.destination.x - this.pos.x,
			dy: this.target.position.y - this.destination.y - this.pos.y,
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

	distanceToTarget() {
		if (!this.target || !this.destination) {
			return Infinity;
		}
		const dx = this.target.position.x - this.destination.x - this.pos.x;
		const dy = this.target.position.y - this.destination.y - this.pos.y;

		const dxn = dx / this.target.radiusX;
		const dyn = dy / this.target.radiusY;

		return dxn * dxn + dyn * dyn;
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

		this.pos.x += Math.cos(this.direction) * delta * speed;
		this.pos.y += Math.sin(this.direction) * delta * speed;

		// stop at the edge
		if (this.pos.x < 0) {
			this.pos.x = 0;
			this.direction = Math.PI - this.direction;
		}
		if (this.pos.x > 1920) {
			this.pos.x = 1920;
			this.direction = Math.PI - this.direction;
		}
		if (this.pos.y < 0) {
			this.pos.y = 0;
			this.direction = -this.direction;
		}
		if (this.pos.y > 1080) {
			this.pos.y = 1080;
			this.direction = -this.direction;
		}

		// carry when getting close to destination
		if (this.distanceToTarget() < 1) {
			this.state = "carrying";
		}
	}

	carry(_delta: number) {
		const { dx, dy, ok } = this.deltas;
		if (ok) {
			this.direction = Math.atan2(dy, dx);
		}
		if (this.distanceToTarget() > 1.05) {
			this.state = "walking";
		}
	}

	win() {
		if (this.state !== "dead") {
			this.state = "winning";
		}
	}

	passedShockwaves = new WeakSet<Shockwave>();
	minDistanceShockwave = 50;
	shockwave(delta: number, shockwaves: Shockwave[]) {
		if (this.state == "dead" || this.state == "appearing") {
			return;
		}
		for (const shockwave of shockwaves) {
			const { dx, dy, nearStrength } = shockwave.speedAt(this.pos);

			// Maybe die
			if (
				!this.passedShockwaves.has(shockwave) &&
				(dx !== 0 || dy !== 0)
			) {
				this.passedShockwaves.add(shockwave);
				this.stun(nearStrength);
				const dieProbability = [0, 0.5, 0.3, 0.2];
				if (Math.random() < dieProbability[this.level] * nearStrength) {
					this.die();
					return;
				}
			}

			const factor = [0, 100, 50, 25][this.level] * Math.random();
			this.pos.x += dx * delta * factor;
			this.pos.y += dy * delta * factor;
		}
	}

	stunDuration = [0, 0.5, 0.4, 0.3];
	stun(strength: number) {
		console.log(strength);
		this.state = "stunned";
		this.stunnedCooldown = this.stunDuration[this.level] * strength;
	}

	moveAwayIfTooClose() {
		if (this.state == "dead") {
			return;
		}
		if (this.distanceToTarget() < 0.95) {
			this.pos.x -= Math.cos(this.direction) * this.speed * 0.01;
			this.pos.y -= Math.sin(this.direction) * this.speed * 0.01;
		}
	}
}
