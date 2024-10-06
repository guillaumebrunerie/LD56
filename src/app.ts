import { Entity } from "./entities";
import { Game } from "./game";
import { Ticker } from "pixi.js";
import { action } from "mobx";
import { initSound, closeSound } from "./sound";

declare global {
	interface Window {
		app: App;
		appR: App;
		cleanup?: () => void;
	}
}

export class App extends Entity {
	speed = 1;
	game = new Game();

	constructor() {
		super();
		this.addChildren(this.game);
		this.init();
	}

	init() {
		// Put debugging informating in the window
		if (import.meta.env.DEV) {
			window.appR = this;
			Object.defineProperty(window, "app", {
				get: () => JSON.parse(JSON.stringify(this)) as App,
				configurable: true,
			});
		}
		window.cleanup?.();

		// Initialize sound and ticker
		initSound();
		const tick = action((ticker: Ticker) => {
			this.tick_((ticker.deltaTime / 60) * this.speed);
		});
		Ticker.shared.add(tick);
		window.cleanup = () => {
			Ticker.shared.remove(tick);
			closeSound();
		};

		this.game.init();
	}
}
