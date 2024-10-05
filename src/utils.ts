import { useReducer } from "react";

export const mod = (a: number, b: number) => (b + (a % b)) % b;

export const useForceUpdate = () => {
	const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
	return forceUpdate;
};

export type Point = {
	x: number;
	y: number;
};

export const distanceBetween = (p1: Point, p2: Point) => {
	return Math.sqrt(distance2(p1, p2));
};

export const distance2 = (p1: Point, p2: Point) => {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return dx * dx + dy * dy;
};

export const randomAroundPoint = (p: Point, r: number): Point => {
	const d = Math.random() * r;
	const angle = Math.random() * Math.PI * 2;
	return {
		x: p.x + d * Math.cos(angle),
		y: p.y + d * Math.sin(angle),
	};
};

export const relativePos = (nx: number, ny: number): Point => ({
	x: 1920 * nx,
	y: 1080 * ny,
});

export const positionAwayFrom = (
	points: Point[],
	delta: number,
): Point | null => {
	for (let i = 0; i < 100; i++) {
		const x = delta + Math.random() * (1920 - 2 * delta);
		const y = delta + Math.random() * (1080 - 2 * delta);
		if (points.every((pos) => distance2(pos, { x, y }) >= delta * delta)) {
			return { x, y };
		}
	}
	return null;
};
