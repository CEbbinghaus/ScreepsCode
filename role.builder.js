const { GUID } = require("./util");

const roleBuilder = {
	role: "builder",

	/** @param {Creep} creep **/
	run: function (creep) {

		if(creep.memory.build) {
			const target = creep.pos.findClosestByPath(creep.room.find(FIND_CONSTRUCTION_SITES));

			if (!target) {
				creep.memory.build = false;
				return;
			}

			
			creep.say("🚧");
			if (creep.build(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {
					visualizePathStyle: { stroke: "#ffffff" },
				});
			}

			if(creep.store.energy <= 0) {
				creep.memory.build = false;
			}
		} else {
			if(creep.store.getFreeCapacity() > 0) {
			
				const source = creep.pos.findClosestByPath(creep.room.find(FIND_SOURCES_ACTIVE));
				if(!source)
					return;
	
				creep.say("⛏️");
	
				if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source, {
						visualizePathStyle: { stroke: "#ffaa00" },
					});
				}
				return;
			}else {
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
