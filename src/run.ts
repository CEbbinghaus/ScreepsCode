import { GUID } from "./util";
import { Log, LogLevel } from "./logging";

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

		const roleObject = ((await import(`./role.${role}.js`))).default;

		if(!roleObject)
			return Log(`Creep "${creep.id}"'s role ${role} doesn't exist`);

		roleObject.run(creep);
	}
};