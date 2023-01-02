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
		if (creep.memory.charge) {
			let target = creep.pos.findClosestByPath(
				creep.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) =>
						structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
				})
			);
	
			target = target || creep.pos.findClosestByPath(
				creep.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) =>
						structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
				})
			);
			
			// console.log(target.store.getFreeCapacity(RESOURCE_ENERGY));	
			
			if (target) {
				creep.say("🔋");
				if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			} else {
				creep.say("⬆️");
				if (
					creep.upgradeController(creep.room.controller) ==
					ERR_NOT_IN_RANGE
				) {
					creep.moveTo(creep.room.controller);
				}
			}

			if (creep.store.energy <= 0) {
				creep.memory.charge = false;
			}
		} else {
			if (creep.store.getFreeCapacity() > 0) {
				
				const dropped = creep.room.find(FIND_DROPPED_RESOURCES, RESOURCE_ENERGY);
				
				const drop = creep.pos.findClosestByPath(dropped);

				if(drop) {
					creep.say("📤")
					if(creep.pickup(drop) == ERR_NOT_IN_RANGE) {
						creep.moveTo(drop);
					}
					return;
				}

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

				if (storage) {
					creep.say("📤");

					if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(storage);
					}
					return;
				}

				const source = creep.pos.findClosestByPath(
					creep.room.find(FIND_SOURCES_ACTIVE)
				);
				if (!source) return;

				creep.say("⛏️");

				if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source);
				}
				return;
			} else {
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
