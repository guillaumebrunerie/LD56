import type { FederatedPointerEvent } from "pixi.js";
import { Circle } from "./Circle";
import type { Ant, Game } from "./game";
import { Rectangle } from "./Rectangle";

export const GameC = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				eventMode="static"
				onPointerDown={(e: FederatedPointerEvent) => {
					const { x, y } = e.global;
					game.shockwave(x, y);
				}}
			/>
			{game.ants.entities.map((ant, i) => (
				<AntC key={i} ant={ant} />
			))}
			<Circle x={1920 / 2} y={1080 / 2} radius={45} color={0xff0000} />
			{game.sources.map(({ x, y }, i) => (
				<Circle key={i} x={x} y={y} radius={20} color={0x0000ff} />
			))}
		</container>
	);
};

const AntC = ({ ant }: { ant: Ant }) => {
	return (
		<Circle
			x={ant.position.x}
			y={ant.position.y}
			radius={10}
			color={0x888888}
		/>
	);
};
