export const levels = [
	{
		level: 1,
		name: "The cake is a lie",
		initialAnts: 10,
		targets: [{ id: 1, pos: { x: 1920 * 0.5, y: 1080 * 0.5 }, delta: 100 }],
		sources: [{ pos: { x: 1920 * 0.15, y: 1080 * 0.25 }, delta: 100 }],
	},
	{
		level: 2,
		name: "XXXX",
		initialAnts: 20,
		targets: [{ id: 1, pos: { x: 1920 * 0.5, y: 1080 * 0.5 }, delta: 100 }],
		sources: [
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.25 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.75 }, delta: 100 },
		],
	},
	{
		level: 3,
		name: "YYYY",
		initialAnts: 50,
		targets: [
			{ id: 1, pos: { x: 1920 * 0.4, y: 1080 * 0.5 }, delta: 100 },
			{ id: 1, pos: { x: 1920 * 0.6, y: 1080 * 0.5 }, delta: 100 },
		],
		sources: [
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.25 }, delta: 100 },
			{ pos: { x: 1920 * 0.15, y: 1080 * 0.75 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.75 }, delta: 100 },
			{ pos: { x: 1920 * 0.85, y: 1080 * 0.25 }, delta: 100 },
		],
	},
	// { level: 4, name: "ZZZZ" },
	// { level: 5, name: "AAAA" },
	// { level: 6, name: "BBBB" },
];