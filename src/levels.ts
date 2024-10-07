import type { PowerUp } from "./game";
import type { Point } from "./utils";

type TargetData = { id: number; pos: Point; delta: number };
type SourceData = { pos: Point; delta: number };

type Level = {
	name: string;
	initialAnts: number;
	targets: TargetData[];
	sources: SourceData[];
	powerUps: PowerUp[];
};

export const levels: Level[] = [
	{
		name: "That’s it!\nCheeese!",
		initialAnts: 10,
		targets: [
			{ id: 2, pos: { x: (1920 * 3) / 4, y: 1080 * 0.5 }, delta: 100 },
		],
		sources: [{ pos: { x: (1920 * 1) / 4, y: 1080 * 0.5 }, delta: 100 }],
		powerUps: ["shockwave"],
	},
	{
		name: "My sandwich?\nMY SANDWICH?",
		initialAnts: 20,
		targets: [
			{ id: 3, pos: { x: 1920 * 0.5, y: 1080 * 0.25 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.7 }, delta: 100 },
		],
		powerUps: ["shockwave"],
	},
	{
		name: "Cowabunga!",
		initialAnts: 10,
		targets: [
			{ id: 4, pos: { x: 1920 * 0.3, y: 1080 * 0.3 }, delta: 100 },
			{ id: 4, pos: { x: 1920 * 0.7, y: 1080 * 0.3 }, delta: 100 },
			{ id: 4, pos: { x: 1920 * 0.5, y: 1080 * 0.7 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.3, y: 1080 * 0.3 }, delta: 100 },
			{ pos: { x: 1920 * 0.7, y: 1080 * 0.3 }, delta: 100 },
			{ pos: { x: 1920 * 0.5, y: 1080 * 0.7 }, delta: 100 },
		],
		powerUps: ["shockwave", "push"],
	},
	{
		name: "What’s this? What’s this?\nThere’s crawlers everywhere!",
		initialAnts: 50,
		targets: [
			{ id: 5, pos: { x: 1920 * 0.2, y: 1080 * 0.5 }, delta: 100 },
			{ id: 5, pos: { x: 1920 * 0.8, y: 1080 * 0.5 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.35, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.35, y: 1080 * 0.3 }, delta: 100 },
			{ pos: { x: 1920 * 0.5, y: 1080 * 0.5 }, delta: 100 },
			{ pos: { x: 1920 * 0.65, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.65, y: 1080 * 0.3 }, delta: 100 },
		],
		powerUps: ["shockwave", "push", "bomb"],
	},
	{
		name: "The cake is a lie",
		initialAnts: 100,
		targets: [
			{ id: 1, pos: { x: 1920 * 0.4, y: 1080 * 0.45 }, delta: 100 },
			{ id: 1, pos: { x: 1920 * 0.6, y: 1080 * 0.45 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.2 }, delta: 100 },
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.2 }, delta: 100 },
		],
		powerUps: ["shockwave", "push", "bomb", "hologram"],
	},
	{
		name: "Humans are\ninteresting",
		initialAnts: 100,
		targets: [
			{ id: 7, pos: { x: 1920 * 0.5, y: 1080 * 0.45 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.2 }, delta: 100 },
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.2 }, delta: 100 },
		],
		powerUps: ["shockwave", "push", "bomb", "hologram", "freeze"],
	},
	{
		name: "Houston, we\nhave a problem",
		initialAnts: 200,
		targets: [
			{ id: 6, pos: { x: 1920 * 0.5, y: 1080 * 0.55 }, delta: 100 },
			{ id: 6, pos: { x: 1920 * 0.5, y: 1080 * 0.45 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.2 }, delta: 100 },
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.7 }, delta: 100 },
			{ pos: { x: 1920 * 0.5, y: 1080 * 0.5 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.2 }, delta: 100 },
		],
		powerUps: ["shockwave", "push", "bomb", "hologram", "freeze"],
	},
];
