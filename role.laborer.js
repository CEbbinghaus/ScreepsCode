const {
	MINIMUM_LABORER_COST,
	CARRY_COST,
	MOVE_COST,
	WORK_COST,
} = require("./constants");
const { Log } = require("./logging");
const { GUID } = require("./util");

const roleLaborer = {
	role: "laborer",
	/**
	 * 
	 * @param {Creep} creep 
	 */
	run: function (creep) {
		
		if(creep.memory.charge) {
			const target = creep.pos.findClosestByPath(creep.room.find(FIND_CONSTRUCTION_SITES));

			if (!target) {
				creep.memory.charge = false;
				return;
			}

			creep.say("🔋");
			if (
				creep.upgradeController(creep.room.controller) ==
				ERR_NOT_IN_RANGE
			) {
				creep.moveTo(creep.room.controller, {
					visualizePathStyle: { stroke: "#ffffff" },
				});
			}

			if(creep.store.energy <= 0) {
				creep.memory.charge = false;
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
				creep.memory.charge = true;
			}
	
		}		
	},
	create: function () {
		let body = [WORK, CARRY, MOVE];

		// const maximumLaborers = Math.floor(
		// 	energyAvailable / MINIMUM_LABORER_COST
		// );

		// if (maximumLaborers <= desiredLaborers) {
		// }

		// const moveAndCarryEnergyReserved =
		// 	(CARRY_COST + MOVE_COST) * desiredLaborers;

		// const workPartCount = Math.floor(
		// 	(energyAvailable - moveAndCarryEnergyReserved) / WORK_COST
		// );

		// body = [MOVE, CARRY, ...Array.of(workPartCount).fill(WORK)];

		return { memory: { role: this.role }, body, id: `Laborer:${GUID()}` };
	},
};

module.exports = roleLaborer;
