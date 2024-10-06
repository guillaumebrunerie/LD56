import { Ant } from "./ant";
import { Target1, Target2, Target3, Target4, Target5, Target6 } from "./assets";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";
import { levels } from "./levels";
import { distanceToNearestIncrement, type Point } from "./utils";

const snapshotDelay = 0.1;
export const levelAngle = 2 * Math.PI * 0.21;
const initialLevel = 1;

export class LevelSelector extends Entity {
	rotation = -levelAngle * (initialLevel - 1);
	speed = 0;
	center = { x: 1920 / 2, y: 1300 };
	touchPoint: Point | null = null;
	ants: EntityArray<Ant>;

	lastSnapshot: { lt: number; rotation: number } = { lt: 0, rotation: 0 };
	nextSnapshot: { lt: number; rotation: number } = { lt: 0, rotation: 0 };

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.addChildren(this.ants);
		this.addTicker((delta) => this.tick(delta));
		for (let i = 0; i < 100; i++) {
			const ant = new Ant();
			ant.initCircle(915);
			this.ants.add(ant);
		}
	}

	tick(delta: number) {
		for (const ant of this.ants.entities) {
			ant.tick(delta);
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
			-levelAngle * (levels.length - 1),
			0,
			this.speed,
		);
		this.speed = dangle * 10;
		this.rotation += delta * this.speed;
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
