import { Entity } from "./entities";

type Type = "linear" | "exponential";

export class Value extends Entity {
	type: Type;
	value: number;
	target: number;
	speed = 0;
	delay = 0;

	constructor(type: Type, value = 0, target = value) {
		super();
		this.type = type;
		this.value = value;
		this.target = target;

		this.addTicker((delta) => {
			if (this.delay > 0) {
				this.delay = Math.max(0, this.delay - delta);
			}
			switch (this.type) {
				case "linear": {
					const diff = this.target - this.value;
					const deltaValue = this.speed * delta;
					if (Math.abs(diff) < deltaValue) {
						this.value = this.target;
					} else {
						this.value += deltaValue * Math.sign(diff);
					}
					break;
				}
				case "exponential": {
					this.value +=
						(this.target - this.value) *
						(1 - Math.exp(-this.speed * delta));
					break;
				}
			}
		});
	}

	setTarget(target: number, duration: number, delay = 0) {
		this.target = target;
		this.speed = duration > 0 ? 1 / duration : 1000000;
		this.delay = delay;
	}

	wait(delay = 0) {
		this.delay += delay;
		return new Promise<void>((resolve) => {
			const ticker = this.addTicker(() => {
				if (this.isIdle) {
					this.removeTicker(ticker);
					resolve();
				}
			});
		});
	}

	get isIdle() {
		return this.delay == 0 && Math.abs(this.value - this.target) < 0.001;
	}
}
