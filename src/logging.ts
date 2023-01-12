
import Logger, {LoggerPipe, LogLevel} from "lipe"
import { deprecate } from "util";

export { LogLevel } from "lipe";

export const MinimumLogLevel = LogLevel.None;
export const logger = new Logger();

// logger.pipe.Pipe((msg, opt) => opt.logLevel > MinimumLogLevel);
logger.pipe.Pipe((msg) => console.log(msg));


export const Log = (message: string , level?: number) => logger.Log(message);