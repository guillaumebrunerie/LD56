type Ticker = (delta: number) => void;

export class Entity {
	lt = 0;
	children: Entity[] = [];
	tickers: Ticker[] = [];

	constructor() {}

	// get isIdle() {
	// 	return 0 == 0;
	// }

	tick_(delta: number) {
		this.lt += delta;
		for (const child of this.children) {
			child.tick_(delta);
		}
		for (const ticker of this.tickers) {
			ticker(delta);
		}
	}

	addTicker(ticker: Ticker) {
		this.tickers.push(ticker);
		return this.tickers[this.tickers.length - 1];
	}

	removeTicker(ticker: Ticker) {
		if (!this.tickers.includes(ticker)) {
			throw new Error("Trying to remove non-existing ticker.");
		}
		this.tickers = this.tickers.filter((t) => t != ticker);
	}

	addChildren(...children: Entity[]) {
		this.children.push(...children);
	}

	removeChildren(...children: Entity[]) {
		this.children = this.children.filter((c) => !children.includes(c));
	}
}
