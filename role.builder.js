const { GUID, AcquireEnergy } = require("./util");

const roleBuilder = {
	role: "builder",

	/** @param {Creep} creep **/
	run: function (creep) {
		if (creep.memory.build) {
			const task = DoBuildTasks(creep);
			if (task) {
				creep.say(task);	
			}

			if (creep.store.energy <= 0) {
				creep.memory.build = false;
			}
		} else {
			if (creep.store.getFreeCapacity() > 0) {
				const emptySpawns = creep.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) =>
						structure.structureType == STRUCTURE_SPAWN &&
						structure.store[RESOURCE_ENERGY] < 200,
				});

				if (emptySpawns.length) {
					if(creep.store.energy){
						creep.memory.build = true;
					}else {
						creep.moveTo(32, 32);
						creep.say("🕰️");
					}
					return;
				}

				if (AcquireEnergy(creep))
					creep.say("📤");
				else {
					creep.say("❗");
					if (creep.store.energy) {
						creep.memory.build = true;
					}
				}
				return;
			} else {
				creep.memory.build = true;
			}
		}
	},
	/**
	 *
	 * @param {StructureSpawn} spawn
	 * @returns
	 */
	create: function (spawn) {
		let body = [WORK, CARRY, MOVE];

		// const moveAndCarryEnergyReserved =
		// 	(CARRY_COST + MOVE_COST) * desiredLaborers;

		// const workPartCount = Math.floor(
		// 	(energyAvailable - moveAndCarryEnergyReserved) / WORK_COST
		// );

		// body = [MOVE, CARRY, ...Array.of(workPartCount).fill(WORK)];

		return { memory: { role: this.role }, body, id: `Builder:${GUID()}` };
	},
};

module.exports = roleBuilder;

/**
 * 
 * @param {AnyStructure} structure 
 */
function findStructureForRepair(structure) {
	if(structure.structureType == STRUCTURE_WALL) {
		if(structure.hits < 1000)
			return true;
		else
			return false;
	}

	if(structure.structureType == STRUCTURE_RAMPART) {
		if(structure.hits < 20000)
			return true;
		else
			return false;
	}

	return structure.hitsMax - structure.hits;
}

/**
 *
 * @param {Creep} creep
 * @returns {string}
 */
function DoBuildTasks(creep) {
	
	// Repair what's low.
	const structureToRepair = creep.pos.findClosestByPath(
		creep.room.find(FIND_STRUCTURES, {
			filter: findStructureForRepair
		})
	);

	if (structureToRepair) {
		if (creep.repair(structureToRepair) == ERR_NOT_IN_RANGE) {
			creep.moveTo(structureToRepair);
		}
		return "🛠️";
	}

	// Build what needs to be built
	const construction = creep.pos.findClosestByPath(
		creep.room.find(FIND_CONSTRUCTION_SITES)
	);

	if (construction) {
		if (creep.build(construction) == ERR_NOT_IN_RANGE) {
			creep.moveTo(construction);
		}

		return "🚧";
	}

	// Reinforce the walls
	const walls = creep.room.find(FIND_STRUCTURES, {
		filter: (structure) => {
			return structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART;
		},
	});

	// const wall = walls.sort((a, b) => a.hits - b.hits).slice(0, 10);
	const wall = creep.pos.findClosestByPath(
		walls.sort((a, b) => a.hits - b.hits).slice(0, 20)
	);

	if (wall) {
		if (creep.repair(wall) == ERR_NOT_IN_RANGE)
			creep.moveTo(wall);
		return "🧱"
	}

	return null;
}
