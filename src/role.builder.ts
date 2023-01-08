import { GUID, AcquireEnergy } from "./util";

export default {
	role: "builder",

	/** @param {Creep} creep **/
	run: function (creep: Creep) {
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
					if (creep.store.energy) {
						creep.memory.build = true;
					} else {
						creep.moveTo(32, 32);
						creep.say("🕰️");
					}
					return;
				}

				if (AcquireEnergy(creep))
					creep.say("🪫");
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
	create: function (spawn: StructureSpawn) {
		let body = [WORK, CARRY, MOVE, MOVE];

		// const moveAndCarryEnergyReserved =
		// 	(CARRY_COST + MOVE_COST) * desiredLaborers;

		// const workPartCount = Math.floor(
		// 	(energyAvailable - moveAndCarryEnergyReserved) / WORK_COST
		// );

		// body = [MOVE, CARRY, ...Array.of(workPartCount).fill(WORK)];

		return { memory: { role: this.role }, body, id: `Builder:${GUID()}` };
	},
};

/**
 * 
 * 
 * @param {Creep} creep 
 * @returns 
 */
function findStructureForRepair(creep: Creep) {

	for (const [structureID, assignedCreeps] of Object.entries(Memory.structures)) {
		if(assignedCreeps.includes(creep.id))
		{	
			const structure = Game.getObjectById(structureID as Id<AnyOwnedStructure>);

			if(!structure) {
				delete Memory.structures[structureID];
				continue;
			}

			if(structure.hitsMax - structure.hits){
				return structure;
			} else {
				assignedCreeps.splice(assignedCreeps.indexOf(creep.id));
			}
		}
	}

	/**
	 *
	 * @param {Creep} creep
	 * @param {AnyStructure} structure
	 */
	function find(creep: Creep, structure: AnyStructure) {
		const hitDeficit = structure.hitsMax - structure.hits;
		const hitDeficitPercentage = (structure.hits / structure.hitsMax) * 100;

		function needsRepair() {
			if (structure.structureType == STRUCTURE_WALL) {
				if (structure.hits < 1000) return true;
				else return false;
			}

			if (structure.structureType == STRUCTURE_RAMPART) {
				if (structure.hits < 20000) return true;
				else return false;
			}

			return hitDeficitPercentage < 95;
		}

		const needs = needsRepair();

		if (!needs) return false;

		const assignedCreeps = Memory.structures[structure.id];

		if (!assignedCreeps) {
			Memory.structures[structure.id] = [];
			return true;
		}

		if (assignedCreeps.includes(creep.id)) return true;
		
		// the formula for the below is (deficit / (hitsPerEnergy / 2)) / energyPerWorker
		const repairCount = Math.max(((hitDeficit / 50) / 50) | 0, 1);

		return repairCount - assignedCreeps.length > 0;
	}
	return creep.pos.findClosestByPath(
		creep.room.find(FIND_STRUCTURES, {
			filter: find.bind({}, creep),
		})
	);
}


/**
 *
 * @param {Creep} creep
 * @returns {string}
 */
function DoBuildTasks(creep: Creep) {
	// Repair what's low.
	const structureToRepair = findStructureForRepair(creep);

	if (
		(!structureToRepair && creep.memory.repairing) ||
		creep.memory.repairing != (structureToRepair && structureToRepair.id)
	) {
		const structureId = creep.memory.repairing;
		/** @type {string[]} */
		const assignedCreeps = Memory.structures[structureId as string];

		if (assignedCreeps) {
			const index = assignedCreeps.indexOf(creep.id);

			if (index !== -1) {
				assignedCreeps.splice(index, 1);
			}
		}

		delete creep.memory.repairing;
	}

	if (structureToRepair) {
		creep.memory.repairing = structureToRepair.id;

		/** @type {string[]} */
		const assignedCreeps =
			Memory.structures[structureToRepair.id] ||
			(Memory.structures[structureToRepair.id] = []);
		if (!assignedCreeps.includes(creep.id)) {
			Memory.structures[structureToRepair.id].push(creep.id);
		}

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
			return (
				structure.structureType === STRUCTURE_WALL ||
				structure.structureType === STRUCTURE_RAMPART
			);
		},
	});

	// const wall = walls.sort((a, b) => a.hits - b.hits).slice(0, 10);
	const wall = creep.pos.findClosestByPath(
		walls.sort((a, b) => a.hits - b.hits).slice(0, 20)
	);

	if (wall) {
		if (creep.repair(wall) == ERR_NOT_IN_RANGE) creep.moveTo(wall);
		return "🧱";
	}

	return null;
}
