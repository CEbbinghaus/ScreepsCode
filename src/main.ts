import { Log, LogLevel } from "./logging";
import run from "./run";
import spawn from "./spawner";

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
	} catch (ex: any) {
		Log(`${ex?.name}: ${ex?.message}\n${ex?.stack}`, LogLevel.Critical)
	}
	
	try {
		run();
	} catch (ex: any) {
		Log(`${ex?.name}: ${ex?.message}\n${ex?.stack}`, LogLevel.Critical)
	}
};

function EnsureSetup() {
	if(!Memory.structures)
		Memory.structures = {};
}

function Clean() {
	Log("Cleaning Memory", LogLevel.Info);

	for (const [structureID, assignedCreeps] of Object.entries(Memory.structures)) {
		// //@ts-ignore
		const structure = Game.getObjectById(structureID as Id<OwnedStructure>);
		
		if(!structure) {
			Log(`Structure ${structureID} no longer exists. Removing its record`, LogLevel.Debug);
			delete Memory.structures[structureID]
			continue;
		}
		
		for(const creepId of assignedCreeps) {
			// //@ts-ignore
			const creep = Game.getObjectById(creepId as Id<Creep>);
			if(!creep) {
				Log(`Creep ${creepId} no longer exists. Removing it from Structure ${structureID}`, LogLevel.Debug);
				assignedCreeps.splice(assignedCreeps.indexOf(creepId), 1);
			}
		}
	}
}