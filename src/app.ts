import { Entity } from "./entities";
import { Game } from "./game";
import { Ticker } from "pixi.js";
import { action } from "mobx";
import { initSound, closeSound } from "./sound";

declare global {
	interface Window {
		app: App;
		appR: App;
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
			if (!window.app) {
				Object.defineProperty(window, "app", {
					get: () => JSON.parse(JSON.stringify(this)) as App,
				});
			}
		}

		// Initialize sound and ticker
		initSound();
		const tick = action((ticker: Ticker) => {
			this.tick_((ticker.deltaTime / 60) * this.speed);
		});
		Ticker.shared.add(tick);
		const cleanup = () => {
			Ticker.shared.remove(tick);
			closeSound();
		};

		// Start game
		this.game.start();

		return cleanup;
	}
}
