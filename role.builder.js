const { GUID } = require("./util");

const roleBuilder = {
	role: "builder",

	/** @param {Creep} creep **/
	run: function (creep) {
		if (creep.memory.build) {
			const target = creep.pos.findClosestByPath(
				creep.room.find(FIND_CONSTRUCTION_SITES)
			);

			if (!target) {
				const walls = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType === STRUCTURE_WALL;
					}
				});

				// const wall = walls.sort((a, b) => a.hits - b.hits).slice(0, 10);
				const wall = creep.pos.findClosestByPath(walls.sort((a, b) => a.hits - b.hits).slice(0, 10));

				if(wall) {
					if(creep.repair(wall) == ERR_NOT_IN_RANGE)
						creep.moveTo(wall);
					
				}else {
					creep.memory.build = false;
					return;
				}
			}

			creep.say("🚧");
			if (target && creep.build(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {
					visualizePathStyle: { stroke: "#ffffff" },
				});
			}

			if (creep.store.energy <= 0) {
				creep.memory.build = false;
			}
		} else {
			if (creep.store.getFreeCapacity() > 0) {

				const storage = creep.pos.findClosestByPath(
					creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
							if (
								structure.structureType !=
									STRUCTURE_CONTAINER &&
								structure.structureType != STRUCTURE_STORAGE
							)
								return false;
							return structure.store[RESOURCE_ENERGY] > 0;
						},
					})
				);

				// console.log(storage)

				if (storage) {
					creep.say("⬆️");

					if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(storage, {
							visualizePathStyle: { stroke: "#ffaa00" },
						});
					}
					return;
				}

				const source = creep.pos.findClosestByPath(
					creep.room.find(FIND_SOURCES_ACTIVE)
				);
				if (!source) return;

				creep.say("⛏️");

				if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source, {
						visualizePathStyle: { stroke: "#ffaa00" },
					});
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
