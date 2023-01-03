const { Log, LogLevel } = require("./logging");
const run = require("./run");
const spawn = require("./spawner");

let TICK = 0;

module.exports.loop = function () {
	Log(`Local Tick: ${TICK++}, Game Tick: ${Game.time}`, LogLevel.Debug);
	
	if(TICK == 0){
		EnsureSetup();
	}
	
	if(!(TICK % 1000)) {
		Clean();
	}

	try {
		spawn();
	} catch (ex) {Log(`${ex.name}: ${ex.message}\n${ex.stack}`, LogLevel.Critical)}
	
	try {
		run();
	} catch (ex) {Log(`${ex.name}: ${ex.message}\n${ex.stack}`, LogLevel.Critical)}
};

function EnsureSetup() {
	if(!Memory.structures)
		Memory.structures = {};
}

function Clean() {
	Log("Cleaning Memory", LogLevel.Info);

	for (const [structureID, assignedCreeps] of Object.entries(Memory.structures)) {
		const structure = Game.getObjectById(structureID);

		if(!structure) {
			Log(`Structure ${structureID} no longer exists. Removing its record`, LogLevel.Debug);
			delete Memory.structures[structureID]
			continue;
		}
		
		for(const creepId of assignedCreeps) {
			const creep = Game.getObjectById(creepId);
			if(!creep) {
				Log(`Creep ${creepId} no longer exists. Removing it from Structure ${structureID}`, LogLevel.Debug);
				assignedCreeps.splice(assignedCreeps.indexOf(creepId), 1);
			}
		}
	}
}