import type { Graphics } from "pixi.js";
import { type ComponentProps, type Ref, useCallback } from "react";

type RectangleProps = ComponentProps<"graphics"> & {
	x: number;
	y: number;
	width: number;
	height: number;
	color?: number;
	alpha?: number;
	myRef?: Ref<Graphics>;
};

type Draw = ComponentProps<"graphics">["draw"];

export const Rectangle = ({
	x,
	y,
	width,
	height,
	color = 0x222222,
	alpha = 1,
	myRef,
	...rest
}: RectangleProps) => {
	const draw = useCallback<Draw>(
		(g) => {
			g.clear();
			g.rect(x, y, width, height);
			g.fill({ color, alpha });
		},
		[x, y, width, height, color, alpha],
	);

	return <graphics ref={myRef} {...rest} draw={draw} />;
};
