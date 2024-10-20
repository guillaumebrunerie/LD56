import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Application, extend } from "@pixi/react";
import { Container, Sprite, Text, Graphics, NineSliceSprite } from "pixi.js";

import { AppC } from "./AppC";
import { app } from "./app";

extend({ Container, Sprite, Text, Graphics, NineSliceSprite });

const root = createRoot(document.getElementById("container") as Element);
root.render(
	<StrictMode>
		<Application
			width={1920}
			height={1080}
			backgroundColor={0x2d293f}
			useBackBuffer
		>
			<AppC />
		</Application>
	</StrictMode>,
);

document.addEventListener("visibilitychange", () => {
	if (document.visibilityState == "hidden") {
		app.game.pause();
	} else if (
		document.visibilityState == "visible" &&
		app.game.state == "levelSelect"
	) {
		app.game.resume();
	}
});
