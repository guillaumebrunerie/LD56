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

export class App {
	speed = 1;
	game = new Game();

	constructor() {
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
			const delta = (ticker.deltaTime / 60) * this.speed;
			this.game.tick(delta);
		});
		// Ticker.shared.minFPS = 10;
		// Ticker.shared.maxFPS = 10;
		Ticker.shared.add(tick);
		window.cleanup = () => {
			Ticker.shared.remove(tick);
			closeSound();
		};
	}
}

export const app = new App();
