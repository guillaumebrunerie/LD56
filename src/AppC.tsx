import { useEffect } from "react";
import { action } from "mobx";
import { SoundButton } from "./SoundButton";
import { App } from "./app";
import { GameC } from "./GameC";

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
			{/* <sprite */}
			{/* 	texture={Bg} */}
			{/* 	x={0} */}
			{/* 	y={0} */}
			{/* 	eventMode="static" */}
			{/* 	onPointerDown={(e: FederatedPointerEvent) => { */}
			{/* 		const { x, y } = e.global; */}
			{/* 		if (e.ctrlKey) { */}
			{/* 			console.log(`${Math.round(x)}, ${Math.round(y)}`); */}
			{/* 		} */}
			{/* 	}} */}
			{/* /> */}
			<GameC game={app.game} />
			<SoundButton x={0} y={0} />
		</container>
	);
};
