import { useEffect } from "react";
import { action } from "mobx";
import { App } from "./app";
import { GameC } from "./GameC";
import { SoundButton } from "./SoundButton";

const app = new App();

export const AppC = () => {
	useEffect(() => {
		const callback = action((event: KeyboardEvent) => {
			if (event.key == "ArrowUp") {
				app.speed *= 2;
			} else if (event.key == "ArrowDown") {
				app.speed *= 1 / 2;
				if (app.speed == 0) {
					app.speed = 1 / 64;
				}
			} else if (event.key == "ArrowLeft") {
				app.speed = 0;
			} else if (event.key == "ArrowRight") {
				app.speed = 1;
			}
		});
		if (import.meta.env.DEV) {
			window.addEventListener("keydown", callback);
			return () => {
				window.removeEventListener("keydown", callback);
			};
		}
	});

	return (
		<container>
			<GameC game={app.game} />
			<SoundButton />
		</container>
	);
};
