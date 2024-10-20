import { app } from "./app";
import { GameC } from "./GameC";
import { SoundButton } from "./SoundButton";
import { useWindowEventListener } from "./useWindowEventListener";

export const AppC = () => {
	useWindowEventListener("keydown", (event) => {
		if (!import.meta.env.DEV) {
			return;
		}
		switch (event.code) {
			case "ArrowUp":
				app.speed *= 2;
				break;
			case "ArrowDown":
				app.speed *= 1 / 2;
				if (app.speed == 0) {
					app.speed = 1 / 64;
				}
				break;
			case "ArrowLeft":
				app.speed = 0;
				break;
			case "ArrowRight":
				app.speed = 1;
				break;
		}
	});

	return (
		<container>
			<GameC game={app.game} />
			<SoundButton />
		</container>
	);
};
