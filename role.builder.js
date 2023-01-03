const { GUID, AcquireEnergy } = require("./util");

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
				if(AcquireEnergy(creep))
					creep.say("📤");
				else
					creep.say("❗");
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
