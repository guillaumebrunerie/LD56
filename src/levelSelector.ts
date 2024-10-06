import { Entity } from "./entities";
import type { Point } from "./utils";

const snapshotDelay = 0.1;

export class LevelSelector extends Entity {
	rotation = 0;
	speed = 0;
	damping = 2;
	maxDamping = 100;
	maxSpeed = 2;
	center = { x: 1920 / 2, y: 1080 };
	touchPoint: Point | null = null;

	lastSnapshot: { lt: number; rotation: number } = { lt: 0, rotation: 0 };
	nextSnapshot: { lt: number; rotation: number } = { lt: 0, rotation: 0 };

	constructor() {
		super();
		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		if (this.touchPoint) {
			if (this.lastSnapshot.lt + snapshotDelay < this.lt) {
				this.lastSnapshot = this.nextSnapshot;
				this.nextSnapshot = { lt: this.lt, rotation: this.rotation };
			}
			return;
		}
		this.rotation += delta * this.speed;
		const damping =
			Math.abs(this.speed) > this.maxSpeed ?
				this.maxDamping
			:	this.damping;
		if (this.speed > 0) {
			this.speed = Math.max(0, this.speed - delta * damping);
		} else if (this.speed < 0) {
			this.speed = Math.min(0, this.speed + delta * damping);
		}
	}

	getTouchAngle() {
		if (!this.touchPoint) {
			throw new Error("Invalid call to getTouchAngle");
		}
		const dx = this.touchPoint.x - this.center.x;
		const dy = this.touchPoint.y - this.center.y;
		return Math.atan2(dy, dx);
	}

	touchStart(pos: Point) {
		this.nextSnapshot = { lt: this.lt, rotation: this.rotation };
		this.touchPoint = pos;
		this.speed = 0;
	}

	touchDrag(pos: Point) {
		if (!this.touchPoint) {
			return;
		}
		const previousAngle = this.getTouchAngle();
		this.touchPoint = pos;
		const newAngle = this.getTouchAngle();
		const deltaAngle = newAngle - previousAngle;
		this.rotation += deltaAngle;
	}

	touchEnd() {
		this.touchPoint = null;
		this.speed = // Math.max(
			// -this.maxSpeed,
			// Math.min(
			// 	this.maxSpeed,
			(this.rotation - this.lastSnapshot.rotation) /
			(this.lt - this.lastSnapshot.lt);
		// 	),
		// );
		this.nextSnapshot = { lt: this.lt, rotation: this.rotation };
	}
}
