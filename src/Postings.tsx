import { BackdropBlurFilter, GrayscaleFilter } from "pixi-filters";
import {
	BtnCompleteTxt,
	BtnGamePausedTxt,
	BtnGameTxt,
	BtnLevelTxt,
	BtnOverTxt,
	Click,
	Logo,
	Target1,
	Target2,
	Target3,
	Target4,
	Target5,
	Target6,
	Target7,
	Target_Shadow,
} from "./assets";
import { CustomText } from "./CustomText";
import type { Game } from "./game";
import { Rectangle } from "./Rectangle";
import { levels } from "./levels";

const buttonsY = 850;

const buttonsXLeft = 1920 / 3;
const buttonsXCenter = 1920 / 2;
const buttonsXRight = (1920 * 2) / 3;

const backdropFilter = new BackdropBlurFilter();
const lightBackdropFilter = new BackdropBlurFilter({ strength: 0 });
const textColor = "#DDD";

export const LogoScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<sprite
				texture={Logo}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					void Click.play();
					game.skipLogo();
				}}
			/>
			<CustomText
				anchor={0.5}
				x={1920 / 2}
				y={900}
				text="Click to start"
			/>
		</container>
	);
};

const levelIntroDuration = 1.5;

export const LevelIntro = ({ game }: { game: Game }) => {
	const level = game.level;
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.01}
				color={0}
				filters={lightBackdropFilter}
			/>
			<container
				x={1920 / 2}
				y={400}
				anchor={0}
				alpha={1 - (game.startLt / levelIntroDuration) ** 2}
				scale={1.5} // + game.startLt / levelIntroDuration / 2}
			>
				<LevelCardContents
					game={game}
					level={level}
					name={levels[level - 1].name}
				/>
			</container>
		</container>
	);
};

const grayscaleFilter = new GrayscaleFilter();

const TargetTexture = [
	Target1,
	Target1,
	Target2,
	Target3,
	Target4,
	Target5,
	Target6,
	Target7,
];

export const LevelCardContents = ({
	game,
	level,
	name,
}: {
	game: Game;
	level: number;
	name: string;
}) => {
	const levelText = `LEVEL ${level}`;
	const targetId = levels[level - 1].targets[0].id;
	const isLocked = level > game.levelSelector.lastLevel;

	return (
		<container>
			<sprite anchor={0.5} scale={2} texture={Target_Shadow} />
			<sprite
				anchor={0.5}
				scale={2}
				texture={TargetTexture[targetId]}
				filters={isLocked ? grayscaleFilter : undefined}
			/>
			{isLocked && (
				<container>
					<CustomText
						anchor={0.5}
						angle={-25}
						y={3}
						text="LOCKED"
						style={{
							fill: "#222",
							fontSize: 30,
							letterSpacing: 10,
							fontFamily: "Comix Loud",
						}}
					/>
					<CustomText
						anchor={0.5}
						angle={-25}
						text="LOCKED"
						style={{
							fill: "#db402c",
							fontSize: 30,
							letterSpacing: 10,
							fontFamily: "Comix Loud",
						}}
					/>
				</container>
			)}
			<container y={150} filters={isLocked ? grayscaleFilter : undefined}>
				<CustomText
					anchor={0.5}
					x={0}
					y={5}
					style={{
						fill: "#222",
						fontSize: 36,
						fontFamily: "Comix Loud",
					}}
					text={levelText}
				/>
				<CustomText
					anchor={0.5}
					style={{
						fill: "#ff75f1",
						fontSize: 36,
						fontFamily: "Comix Loud",
					}}
					text={levelText}
				/>
			</container>
			<container
				y={200}
				filters={level > 1 ? grayscaleFilter : undefined}
			>
				<CustomText
					anchor={{ x: 0.5, y: 0 }}
					x={0}
					y={5}
					style={{
						fill: "#222",
						fontSize: 40,
						fontFamily: "Laffayette Comic Pro",
					}}
					text={name}
				/>
				<CustomText
					anchor={{ x: 0.5, y: 0 }}
					style={{
						fill: "#ffdefc",
						fontSize: 40,
						fontFamily: "Laffayette Comic Pro",
					}}
					text={name}
				/>
			</container>
		</container>
	);
};

export const PauseScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.01}
				color={0}
				filters={backdropFilter}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					void Click.play();
					game.resume();
				}}
			/>
			<sprite
				texture={BtnGamePausedTxt}
				anchor={0.5}
				x={1920 / 2}
				y={450}
				scale={1.5}
			/>
			<RestartButton game={game} />
			<MainMenuButton game={game} />
			<CustomText
				x={1920 / 2}
				y={980}
				anchor={0.5}
				text="(click anywhere to resume)"
				style={{
					fontSize: 20,
					fontFamily: "Heroes Legend",
					fill: textColor,
					dropShadow: {
						angle: 90,
						distance: 3,
					},
				}}
			/>
		</container>
	);
};

export const LevelSelectPauseScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.01}
				color={0}
				filters={backdropFilter}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					void Click.play();
					game.resume();
				}}
			/>
			<sprite
				texture={BtnGamePausedTxt}
				anchor={0.5}
				x={1920 / 2}
				y={450}
				scale={1.5}
			/>
			<MainMenuButton game={game} />
			<WipeSaveButton game={game} />
			<CustomText
				x={1920 / 2}
				y={980}
				anchor={0.5}
				text="(click anywhere to resume)"
				style={{
					fontSize: 20,
					fontFamily: "Heroes Legend",
					fill: textColor,
					dropShadow: {
						angle: 90,
						distance: 3,
					},
				}}
			/>
		</container>
	);
};

const RestartButton = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={buttonsXRight}
			y={buttonsY}
			anchor={0.5}
			text="Restart"
			cursor="pointer"
			eventMode="static"
			style={{
				fontFamily: "Heroes Legend",
				fill: textColor,
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			onPointerDown={() => {
				void Click.play();
				game.restart();
			}}
		/>
	);
};

const NextLevelButton = ({ game }: { game: Game }) => {
	if (game.level == levels.length) {
		return null;
	}
	return (
		<CustomText
			x={buttonsXRight}
			y={buttonsY}
			anchor={0.5}
			text="Next level"
			cursor="pointer"
			eventMode="static"
			style={{
				fontFamily: "Heroes Legend",
				fill: textColor,
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			onPointerDown={() => {
				void Click.play();
				game.nextLevel();
			}}
		/>
	);
};

const MainMenuButton = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={buttonsXLeft}
			y={buttonsY}
			anchor={0.5}
			text="Main menu"
			style={{
				fontFamily: "Heroes Legend",
				fill: textColor,
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			cursor="pointer"
			eventMode="static"
			onPointerDown={() => {
				void Click.play();
				game.backToMainMenu();
			}}
		/>
	);
};

const MainMenuButton2 = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={game.level == levels.length ? buttonsXCenter : buttonsXLeft}
			y={buttonsY}
			anchor={0.5}
			text="Main menu"
			style={{
				fontFamily: "Heroes Legend",
				fill: textColor,
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			cursor="pointer"
			eventMode="static"
			onPointerDown={() => {
				void Click.play();
				game.backToMainMenu();
			}}
		/>
	);
};

const WipeSaveButton = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={buttonsXRight}
			y={buttonsY}
			anchor={0.5}
			text="Wipe save (!)"
			style={{
				fontFamily: "Heroes Legend",
				fill: "#D44",
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			cursor="pointer"
			eventMode="static"
			onPointerDown={() => {
				void Click.play();
				game.resetLastUnlockedLevel();
				game.resume();
			}}
		/>
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
				filters={backdropFilter}
				alpha={0.3}
				color={0}
				eventMode="static"
			/>
			<container x={1920 / 2} y={450}>
				<sprite texture={BtnGameTxt} anchor={0.5} />
				<sprite texture={BtnOverTxt} anchor={0.5} />
			</container>
			<container y={70}>
				<RestartButton game={game} />
				<MainMenuButton game={game} />
			</container>
		</container>
	);
};

export const WinScreen = ({ game }: { game: Game }) => {
	const nt = Math.min(game.startLt / 0.5, 1);
	if (nt < 1) {
		return null;
	}
	return (
		<container alpha={nt * nt}>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
				eventMode="static"
			/>
			<container x={1920 / 2} y={400}>
				<sprite texture={BtnLevelTxt} anchor={0.5} />
				<sprite texture={BtnCompleteTxt} anchor={0.5} />
			</container>
			<NextLevelButton game={game} />
			<MainMenuButton2 game={game} />
		</container>
	);
};
