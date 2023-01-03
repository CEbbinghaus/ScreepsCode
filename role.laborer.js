const {
	MINIMUM_LABORER_COST,
	CARRY_COST,
	MOVE_COST,
	WORK_COST,
} = require("./constants");
const { Log } = require("./logging");
const { GUID, AcquireEnergy } = require("./util");

const roleLaborer = {
	role: "laborer",
	/**
	 *
	 * @param {Creep} creep
	 */
	run: function (creep) {
		if (creep.memory.charge) {
			const task = DoLaborerTasks(creep);
			creep.say(task);

			if (creep.store.energy <= 0) {
				creep.memory.charge = false;
			}
		} else {
			if (creep.store.getFreeCapacity() > 0) {
				if (AcquireEnergy(creep)) creep.say("📤");
				else creep.say("❗");
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

/**
 *
 * @param {Creep} creep
 * @returns {AnyOwnedStructure[]}
 */
function FindSpawnsWithoutEnergy(creep) {
	return creep.pos.findClosestByPath(
		creep.room.find(FIND_MY_STRUCTURES, {
			filter: (structure) =>
				structure.structureType == STRUCTURE_SPAWN &&
				structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
		})
	);
}

/**
 *
 * @param {Creep} creep
 * @returns {AnyOwnedStructure[]}
 */
function FindExtensionWithoutEnergy(creep) {
	return creep.pos.findClosestByPath(
		creep.room.find(FIND_MY_STRUCTURES, {
			filter: (structure) =>
				structure.structureType == STRUCTURE_EXTENSION &&
				structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
		})
	);
}

/**
 *
 * @param {Creep} creep
 * @returns {AnyOwnedStructure[]}
 */
function FindTowerWithoutEnergy(creep) {
	return creep.pos.findClosestByPath(
		creep.room.find(FIND_MY_STRUCTURES, {
			filter: (structure) =>
				structure.structureType == STRUCTURE_TOWER &&
				structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
		})
	);
}

/**
 *
 * @param {Creep} creep
 * @returns {string}
 */
function DoLaborerTasks(creep) {
	// Charge any spawns or extensions
	let target = FindSpawnsWithoutEnergy(creep);

	target = target || FindExtensionWithoutEnergy(creep);

	target = target || FindTowerWithoutEnergy(creep);

	if (target) {
		if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
		return "🔋";
	}

	// Upgrade Controller
	if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller);
	}

	return "⬆️";
}
