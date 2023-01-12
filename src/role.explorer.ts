import { GUID, AcquireEnergy } from "./util";

export default {
	role: "explorer",

	/** @param {Creep} creep **/
	run: function (creep: Creep) {
		const state = creep.memory.exploreState || "explore";
		switch (state) {
			case "settle":
				Settle(creep);
				break;
			case "explore":
			default:
				Explore(creep);
		}
	},
	/**
	 *
	 * @param {StructureSpawn} spawn
	 * @returns
	 */
	create: function (spawn: StructureSpawn) {
		let body = [WORK, CARRY, MOVE, MOVE, MOVE];

		return { memory: { role: this.role }, body, id: `Explorer:${GUID()}` };
	},
};

/**
 *
 * @param {Creep} creep
 */
function Explore(creep: Creep) {}

/**
 *
 * @param {Creep} creep
 */
 function Settle(creep: Creep) {
	// if()

	AcquireEnergy(creep)

 }