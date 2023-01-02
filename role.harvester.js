const {
	MINIMUM_LABORER_COST,
	CARRY_COST,
	MOVE_COST,
	WORK_COST,
} = require("./constants");
const { Log } = require("./logging");
const { GUID } = require("./util");

const roleHarvester = {
	role: "harvester",
	/**
	 *
	 * @param {Creep} creep
	 */
	run: function (creep) {

		if (creep.store.getFreeCapacity() > 0) {
			const sources = creep.room.find(FIND_SOURCES_ACTIVE);

			const source = creep.pos.findClosestByPath(sources);

			if (!source) return creep.say("⁉️");

			creep.say("⛏️");

			if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
				creep.moveTo(source, {
					visualizePathStyle: { stroke: "#ffaa00" },
				});
			}
		} else {
			
			let targets = creep.room.find(FIND_MY_STRUCTURES, {
				filter: (structure) => {
					return (structure.store && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
				},
			})

			// we have run out of things to charge. Time to upgrade the room
			const target = creep.pos.findClosestByPath(targets);

			if(!target){
				creep.moveTo(0, 0)
				creep.say("❌");
				return;
			}

			if (target &&
				creep.transfer(target, RESOURCE_ENERGY) ==
				ERR_NOT_IN_RANGE
			) {
				creep.moveTo(target, {
					visualizePathStyle: { stroke: "#ffffff" },
				});
				// return;
			}

			// if (
			// 	creep.upgradeController(creep.room.controller) ==
			// 	ERR_NOT_IN_RANGE
			// ) {
			// 	creep.moveTo(creep.room.controller, {
			// 		visualizePathStyle: { stroke: "#ffffff" },
			// 	});
			// }
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

		return { memory: {role: this.role}, body, id:`Harvester:${GUID()}` };
	},
};

module.exports = roleHarvester;
