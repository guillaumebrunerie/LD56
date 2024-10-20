import { Ant } from "./ant";
import { levels } from "./levels";
import {
	clearStorageLastUnlockedLevel,
	retrieveLastUnlockedLevel,
	storeLastUnlockedLevel,
} from "./storage";
import { distanceToNearestIncrement, type Point } from "./utils";

const snapshotDelay = 0.1;
export const levelAngle = 2 * Math.PI * 0.21;

export class LevelSelector {
	lt = 0;
	lastLevel = retrieveLastUnlockedLevel(levels.length);
	rotation = -levelAngle * (this.lastLevel - 1);
	speed = 0;
	center = { x: 1920 / 2, y: 1300 };
	touchPoint: Point | null = null;
	ants: Ant[] = [];

	lastSnapshot: { lt: number; rotation: number } = { lt: 0, rotation: 0 };
	nextSnapshot: { lt: number; rotation: number } = { lt: 0, rotation: 0 };

	constructor() {
		for (let i = 0; i < 100; i++) {
			const ant = new Ant();
			ant.initCircle(915);
			this.ants.push(ant);
		}
	}

	resetLastLevel() {
		clearStorageLastUnlockedLevel();
		this.lastLevel = 1;
	}

	unlockNextLevel(level: number) {
		this.lastLevel = Math.max(
			this.lastLevel,
			Math.min(levels.length, level + 1),
		);
		storeLastUnlockedLevel(this.lastLevel);
		this.rotation -= levelAngle;
	}

	tick(delta: number) {
		this.lt += delta;
		for (const ant of this.ants) {
			ant.tick(delta, []);
		}
		if (this.touchPoint) {
			if (this.lastSnapshot.lt + snapshotDelay < this.lt) {
				this.lastSnapshot = this.nextSnapshot;
				this.nextSnapshot = { lt: this.lt, rotation: this.rotation };
			}
			return;
		}
		const dangle = distanceToNearestIncrement(
			this.rotation,
			levelAngle,
			-levelAngle * (this.lastLevel - 1),
			0,
			this.speed,
		);
		this.speed = dangle * 10;
		const nextSpeed = (dangle - delta * this.speed) * 10;
		this.rotation += (delta * (this.speed + nextSpeed)) / 2;
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
		if (!this.touchPoint) {
			return;
		}
		this.touchPoint = null;
		this.speed =
			(this.rotation - this.lastSnapshot.rotation) /
			(this.lt - this.lastSnapshot.lt);
		this.nextSnapshot = { lt: this.lt, rotation: this.rotation };
	}
}
