const LogLevel = {
	None: 0,
	[0]: "None",
	Debug: 1,
	[1]: "Debug",
	Info: 2,
	[2]: "Info",
	Warn: 3,
	[3]: "Warn",
	Error: 4,
	[4]: "Error",
	Critical: 5,
	[5]: "Critical",
};

module.exports.LogLevel = LogLevel;

const DefaultLogLevel = LogLevel.Info;
const CurrentLogLevel = LogLevel.Info;

/**
 * Lops a message with values
 * @param {string} message
 * @param {any} levelOrData
 * @param  {...any} data
 */
module.exports.Log = function (message, levelOrData, ...data) {
	
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
