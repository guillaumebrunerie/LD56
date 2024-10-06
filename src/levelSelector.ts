import { Entity } from "./entities";
import type { Point } from "./utils";

export class LevelSelector extends Entity {
	rotation = 0;
	speed = 0;
	damping = 10;

	touchPoint: Point | null = null;

	constructor() {
		super();
		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		this.rotation += delta * this.speed;
		// this.speed +=
	}

	touchStart(pos: Point) {
		this.touchPoint = pos;
		this.speed = 0;
	}

	touchDrag(pos: Point) {}
}
