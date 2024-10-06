import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Application, extend } from "@pixi/react";
import { Container, Sprite, Text, Graphics, NineSliceSprite } from "pixi.js";

import { AppC } from "./AppC";

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
