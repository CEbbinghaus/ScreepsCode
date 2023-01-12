import { logger } from "logging";
import run from "./run";
import spawn from "./spawner";

let TICK = 0;

// We want to make sure that some specific data stores always exist.
EnsureSetup();

module.exports.loop = function () {
	try {
		logger.Debug("Local Tick: {localTick}, Game Tick: {gameTick}, CPU Usage: {cpuUsage}", {localTick: TICK++, gameTick: Game.time, cpuUsage: Game.cpu.getUsed()});

		if(!(TICK % 1000)) {
			Clean();
		}


		spawn();
		
		run();


	} catch (ex: any) {
		logger.Critical(`${ex?.name}: ${ex?.message}\n${ex?.stack}`)
	}
};


function EnsureSetup() {
	if(!Memory.structures)
		Memory.structures = {};
}

function Clean() {
	logger.Info("Cleaning Memory");

	for (const [structureID, assignedCreeps] of Object.entries(Memory.structures)) {
		// //@ts-ignore
		const structure = Game.getObjectById(structureID as Id<OwnedStructure>);
		
		if(!structure) {
			logger.Info(`Structure ${structureID} no longer exists. Removing its record`);
			delete Memory.structures[structureID]
			continue;
		}
		
		for(const creepId of assignedCreeps) {
			// //@ts-ignore
			const creep = Game.getObjectById(creepId as Id<Creep>);
			if(!creep) {
				logger.Info(`Creep ${creepId} no longer exists. Removing it from Structure ${structureID}`);
				assignedCreeps.splice(assignedCreeps.indexOf(creepId), 1);
			}
		}
	}
}