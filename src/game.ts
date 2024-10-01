import { Music } from "./assets";
import { Entity } from "./entities";

export class Game extends Entity {
	constructor() {
		super();
	}

	start() {
		void Music.play({ loop: true, volume: 0.5 });
	}
}
