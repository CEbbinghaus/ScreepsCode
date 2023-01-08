import { GUID } from "./util";
import { Log, LogLevel } from "./logging";
import roleBuilder from "role.builder";
import roleExplorer from "role.explorer";
import roleHarvester from "role.harvester";
import roleLaborer from "role.laborer";
import roleUpgrader from "role.upgrader";

export default async function () {

	if([...Game.rooms["W8N3"].find(FIND_HOSTILE_CREEPS), ...Game.rooms["W8N3"].find(FIND_HOSTILE_POWER_CREEPS)].length > 0) {
		Game.rooms["W8N3"].controller?.activateSafeMode();
	}


	for(const [id, structure] of Object.entries(Game.structures)) {
		if(! (structure instanceof StructureTower && structure.structureType == STRUCTURE_TOWER) )
			continue;
			
		const closestHostile = structure.pos.findClosestByRange(structure.room.find(FIND_HOSTILE_CREEPS))

		if(closestHostile)
		structure.attack(closestHostile);
		// else {
		// 	const closestRampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_RAMPART});

		// 	if(closestRampart) {
		// 		tower.repair(closestRampart);
		// 	}
		// }
	}


	for (const [id, creep] of Object.entries(Game.creeps)) {

		if(creep.spawning)
			continue;

		const role = creep.memory.role;

		if(!role)
			return Log(`Creep "${creep.id}" has an Invalid Role`)

		// const roleObject = ((await import(`./role.${role}.js`))).default;
		const roleObject = require(`./role.${role}.js`).default;

		switch(role) {
			case "builder":
				roleBuilder.run(creep);
				break;
			case "explorer":
				roleExplorer.run(creep);
				break;
			case "harvester":
				roleHarvester.run(creep);
				break;
			case "laborer":
				roleLaborer.run(creep);
				break;
			case "upgrader":
				roleUpgrader.run(creep);
				break;
			default:
				Log(`Creep "${creep.id}"'s role ${role} doesn't exist`, LogLevel.Error);
		}

		// if(!roleObject)

		// roleObject.run(creep);
	}
};