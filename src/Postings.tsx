import { CustomText } from "./CustomText";
import type { Game } from "./game";
import { Rectangle } from "./Rectangle";

const buttonsY = 850;

const buttons2Left = 1920 / 3;
const buttons2Right = (1920 * 2) / 3;

// const buttons3Left = 1920 / 4;
// const buttons3Middle = (1920 * 2) / 4 - 30;
// const buttons3Right = (1920 * 3) / 4;

export const PauseScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.resume();
				}}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 - 50}
				anchor={0.5}
				text="Game paused"
				style={{ fontFamily: "Heroes Legend" }}
			/>
			<CustomText
				x={buttons2Left}
				y={buttonsY}
				anchor={0.5}
				text="Restart?"
				cursor="pointer"
				eventMode="static"
				style={{ fontFamily: "Heroes Legend" }}
				onPointerDown={() => {
					game.restart();
				}}
			/>
			<CustomText
				x={buttons2Right}
				y={buttonsY}
				anchor={0.5}
				text="Main menu"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.backToMainMenu();
				}}
			/>
		</container>
	);
};

export const GameOverScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 - 50}
				anchor={0.5}
				text="Game over!"
				style={{ fontFamily: "Heroes Legend" }}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 50}
				anchor={0.5}
				text="Restart?"
				cursor="pointer"
				eventMode="static"
				style={{ fontFamily: "Heroes Legend" }}
				onPointerDown={() => {
					game.restart();
				}}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 150}
				anchor={0.5}
				text="Main menu"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.backToMainMenu();
				}}
			/>
		</container>
	);
};

export const WinScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 - 50}
				anchor={0.5}
				text="You win!"
				style={{ fontFamily: "Heroes Legend" }}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 50}
				anchor={0.5}
				text="Next level?"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.nextLevel();
				}}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 150}
				anchor={0.5}
				text="Main menu"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.backToMainMenu();
				}}
			/>
		</container>
	);
};
