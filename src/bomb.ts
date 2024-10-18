import type { Point } from "./utils";

export class Bomb {
	pos: Point;
	timeout: number;
	duration = 3;

	constructor(pos: Point) {
		this.pos = pos;
		this.timeout = this.duration;
	}

	tick(delta: number) {
		this.timeout -= delta;
		if (this.timeout < 0) {
			this.timeout = 0;
		}
	}
}
