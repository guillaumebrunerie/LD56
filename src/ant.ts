import {
	AntCrushed1,
	AntCrushed2,
	AntCrushed3,
	AntCrushed4,
	AntDie1,
	AntDie2,
	AntDie3,
	AntDie4,
} from "./assets";
import { Entity } from "./entities";
import type { Freeze } from "./freeze";
import type { Shockwave } from "./shockwave";
import type { Source } from "./source";
import type { Target } from "./target";
import { pick, randomAroundPoint, type Point } from "./utils";

export class Ant extends Entity {
	pos: Point;
	destination: Point | null = null;
	target: Target | Source | null = null;
	direction = 0;
	speed: number;
	state:
		| "appearing"
		| "walking"
		| "carrying"
		| "dead"
		| "winning"
		| "stunned";
	level: number;
	circularEdge = false;
	edgeRadius = 0;

	constructor(source?: Source) {
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
			this.state = "appearing";
			this.pos = { x, y };
		}
	}

	initCircle(radius: number) {
		const { x, y } = randomAroundPoint({ x: 0, y: 0 }, radius);
		this.pos = { x, y };
		this.destination = null;
		this.target = null;
		this.direction = Math.random() * Math.PI * 2;
		this.state = "walking";
		this.circularEdge = true;
		this.edgeRadius = radius;
	}

	pickTarget(targets: Target[], sources: Source[]) {
		const hasSource = sources.some((source) => !source.isDestroyed);
		const toChooseFrom = [
			...targets.filter(() => hasSource),
			...sources.filter(
				(source) =>
					source.isDestroyed ||
					source.healthCurrent < (source.healthMax * 3) / 4,
			),
		];
		if (this.target && toChooseFrom.includes(this.target)) {
			return; // All good
		}
		if (toChooseFrom.length == 0) {
			return;
		}
		this.setTarget(pick(toChooseFrom));
	}

	setTarget(target: Target | Source) {
		this.target = target;
		// destination, point towards the center
		const roughDirection = Math.atan2(
			this.target.pos.y - this.pos.y,
			this.target.pos.x - this.pos.x,
		);
		const angle = roughDirection + ((Math.random() - 0.5) * Math.PI) / 2;
		this.destination = {
			x: 0 * Math.cos(angle),
			y: 0 * Math.sin(angle),
		};
		this.direction = Math.atan2(
			this.target.pos.y - this.destination.y - this.pos.y,
			this.target.pos.x - this.destination.x - this.pos.x,
		);
	}

	get rotation() {
		const { dx, dy } = this.deltas;
		return Math.atan2(dy, dx);
	}

	stunnedCooldown = 0;
	tick(delta: number, freezes: Freeze[]) {
		switch (this.state) {
			case "appearing": {
				this.appear(delta);
				return;
			}
			case "walking": {
				this.walk(delta, freezes);
				return;
			}
			case "carrying": {
				this.carry(delta, freezes);
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
			dx: this.target.pos.x - this.destination.x - this.pos.x,
			dy: this.target.pos.y - this.destination.y - this.pos.y,
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
		const dx = this.target.pos.x - this.destination.x - this.pos.x;
		const dy = this.target.pos.y - this.destination.y - this.pos.y;

		const dxn = dx / this.target.radiusX;
		const dyn = dy / this.target.radiusY;

		return dxn * dxn + dyn * dyn;
	}

	die() {
		this.state = "dead";
		this.lt = 0;
		const AntDyingSounds = [
			AntDie1,
			AntDie2,
			AntDie3,
			AntDie4,
			AntCrushed1,
			AntCrushed2,
			AntCrushed3,
			AntCrushed4,
		];
		void pick(AntDyingSounds).play({ volume: 0.5 });
	}

	appearDuration = 0.5;

	appear(_delta: number) {
		if (this.lt > this.appearDuration) {
			this.state = "walking";
		}
	}

	freezeFactor = 1 / 6;

	walk(delta: number, freezes: Freeze[]) {
		const { dx, dy, ok } = this.deltas;
		if (ok) {
			this.direction = Math.atan2(dy, dx);
		}
		let speed = ok ? this.speed : this.speed / 3;
		for (const freeze of freezes) {
			speed *= this.freezeFactor ** freeze.freezeFactor(this.pos);
		}

		this.pos.x += Math.cos(this.direction) * delta * speed;
		this.pos.y += Math.sin(this.direction) * delta * speed;

		// stop at the edge
		if (this.circularEdge) {
			if (this.pos.x ** 2 + this.pos.y ** 2 > this.edgeRadius ** 2) {
				const normal = Math.atan2(this.pos.y, this.pos.x);
				this.direction = 2 * normal - this.direction + Math.PI;
			}
		} else {
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
			if (shockwave.type == "push") {
				continue;
			}
			const { dx, dy, nearStrength } = shockwave.speedAt(this.pos);

			// Maybe die
			if (
				!this.passedShockwaves.has(shockwave) &&
				(dx !== 0 || dy !== 0)
			) {
				this.passedShockwaves.add(shockwave);
				this.stun(nearStrength);
				const dieProbability = [0, 0.6, 0.55, 0.5];
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
