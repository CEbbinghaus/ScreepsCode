import {
	MINIMUM_LABORER_COST,
	CARRY_COST,
	MOVE_COST,
	WORK_COST,
} from "./constants";
import { Log } from "./logging";
import { GUID, AcquireEnergy } from "./util";

export default {
	role: "laborer",
	/**
	 *
	 * @param {Creep} creep
	 */
	run: function (creep: Creep) {
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

		return { memory: { role: this.role }, body, id: `Laborer:${GUID()}` };
	},
};

/**
 *
 * @param {Creep} creep
 * @returns {AnyOwnedStructure[]}
 */
function FindSpawnsWithoutEnergy(creep: Creep) {
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
function FindExtensionWithoutEnergy(creep: Creep) {
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
function FindTowerWithoutEnergy(creep: Creep) {
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
function DoLaborerTasks(creep: Creep) {
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
	if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
		creep.moveTo(creep.room.controller as StructureController);
	}

	return "⬆️";
}
