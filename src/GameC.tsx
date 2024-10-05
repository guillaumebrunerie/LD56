import type { FederatedPointerEvent } from "pixi.js";
import { Circle } from "./Circle";
import type { Ant, Game, Target } from "./game";
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
			{game.ants.entities.map(
				(ant, i) => ant.state == "dead" && <AntC key={i} ant={ant} />,
			)}
			{game.ants.entities.map(
				(ant, i) => ant.state != "dead" && <AntC key={i} ant={ant} />,
			)}
			{game.targets.entities.map((target, i) => (
				<TargetC key={i} target={target} />
			))}
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
			alpha={
				ant.state == "appearing" ? ant.lt / ant.appearDuration
				: ant.state == "dead" ?
					1 - ant.lt / ant.dieDuration
				:	1
			}
			color={
				ant.state == "dead" ? 0x333333
				: ant.state == "carrying" ?
					0xbbbbbb
				:	0x888888
			}
		/>
	);
};

const TargetC = ({ target }: { target: Target }) => {
	return (
		<Circle
			x={target.position.x}
			y={target.position.y}
			radius={45}
			color={0xff0000}
		/>
	);
};
