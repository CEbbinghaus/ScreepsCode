const { Log, LogLevel } = require("./logging");
const run = require("./run");
const spawn = require("./spawner");

let TICK = 0;

module.exports.loop = function () {
	Log(`Local Tick: ${TICK++}, Game Tick: ${Game.time}`, LogLevel.Debug);
	try {
		spawn();
	} catch (ex) {Log(ex, LogLevel.Critical)}
	
	try {
		run();
	} catch (ex) {Log(ex, LogLevel.Critical)}
};
