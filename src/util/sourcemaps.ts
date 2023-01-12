import { SourceMapConsumer } from "source-map";
import { isSimulator } from "./env";


const cache: { [key: string]: string } = {};

const consumer: SourceMapConsumer = await new SourceMapConsumer(require("main.js.map"));


export function sourceMappedStackTrace(error: Error | string): string {
	
	const stack: string = error instanceof Error ? (error.stack as string) : error;

	if (Object.prototype.hasOwnProperty.call(cache, stack)) {
		return cache[stack];
	}

	// eslint-disable-next-line no-useless-escape
	const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
	let match: RegExpExecArray | null;
	let outStack = error.toString();

	while ((match = re.exec(stack))) {
		if (match[2] === "main") {
			const pos = consumer.originalPositionFor({
				column: parseInt(match[4], 10),
				line: parseInt(match[3], 10)
			});

			if (pos.line != null) {
				if (pos.name) {
					outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
				} else {
					if (match[1]) {
						// no original source file name known - use file name from given trace
						outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
					} else {
						// no original source file name known or in given trace - omit name
						outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
					}
				}
			} else {
				// no known position
				break;
			}
		} else {
			// no more parseable lines
			break;
		}
	}

	cache[stack] = outStack;
	return outStack;
}

export function wrapLoop(loop: () => void): () => void {
	return () => {
		try {
			loop();
		} catch (e) {
			if (e instanceof Error) {
				if (isSimulator) {
					const message = `Source maps don't work in the simulator - displaying original error`;
					console.log(`<span style='color:red'>${message}<br>${_.escape(e.stack)}</span>`);
				} else {
					console.log(`<span style='color:red'>${_.escape(sourceMappedStackTrace(e))}</span>`);
				}
			} else {
				// can't handle it
				throw e;
			}
		}
	};
}