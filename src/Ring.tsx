import { type ComponentProps, useCallback } from "react";

type RingProps = ComponentProps<"graphics"> & {
	x?: number;
	y?: number;
	radius: number;
	strokeWidth: number;
	color?: number;
	alpha?: number;
};

type Draw = ComponentProps<"graphics">["draw"];

export const Ring = ({
	x = 0,
	y = 0,
	radius,
	strokeWidth,
	color = 0xff00ff,
	alpha = 1,
	...rest
}: RingProps) => {
	const draw = useCallback<Draw>(
		(g) => {
			g.clear();
			g.circle(x, y, radius);
			g.setStrokeStyle({
				width: strokeWidth,
			});
			g.stroke({ color, alpha });
		},
		[x, y, radius, color, alpha, strokeWidth],
	);

	return <graphics {...rest} draw={draw} />;
};
