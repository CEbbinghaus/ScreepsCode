const { GUID } = require("./util");
const { Log, LogLevel } = require("./logging");



module.exports = function () {

	if([...Game.rooms["W8N3"].find(FIND_HOSTILE_CREEPS), ...Game.rooms["W8N3"].find(FIND_HOSTILE_POWER_CREEPS)].length > 0) {
		Game.rooms["W8N3"].controller.activateSafeMode();
	}


	for(const [id, structure] of Object.entries(Game.structures)) {
		if(structure.structureType !== STRUCTURE_TOWER)
			continue;
		
		/** @type {StructureTower} */
		const tower = structure;

		const closestHostile = tower.pos.findClosestByRange(tower.room.find(FIND_HOSTILE_CREEPS))

		if(closestHostile)
			tower.attack(closestHostile);
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

		const roleObject = require(`./role.${role}`);

		if(!roleObject)
			return Log(`Creep "${creep.id}"'s role ${role} doesn't exist`);

		roleObject.run(creep);
	}
};