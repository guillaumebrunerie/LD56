import { Entity } from "./entities";
import type { Point } from "./utils";

const bombTimer = 3;

export class Bomb extends Entity {
	pos: Point;
	timer: number;

	constructor(pos: Point) {
		super();
		this.pos = pos;
		this.timer = bombTimer;
	}

	tick(delta: number) {
		this.timer -= delta;
		if (this.timer < 0) {
			this.timer = 0;
		}
	}
}
