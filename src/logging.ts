
export enum LogLevel {
	None = 0,
	Debug,
	Info,
	Warn,
	Error,
	Critical
}

const DefaultLogLevel = LogLevel.Info;
const CurrentLogLevel = LogLevel.None;

/**
 * Lops a message with values
 * @param {string} message
 * @param {any} levelOrData
 * @param  {...any} data
 */
export function Log(message: string, levelOrData?: LogLevel | any, ...data: any[]) {
	
	if(typeof(levelOrData) === "number")
		levelOrData = {LogLevel: levelOrData};
	
	// Combine all elements into one
	const aggregateData = Object.assign({}, levelOrData, ...data);

	const logLevel = (aggregateData.LogLevel || DefaultLogLevel);

	// Ensure only messages we want get logged
	if (logLevel < CurrentLogLevel) return;

	// Log the message with the correct Level
	console.log(`${LogLevel[logLevel]}: ${message}`);
};
