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
