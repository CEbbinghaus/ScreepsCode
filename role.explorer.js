const { GUID, AcquireEnergy } = require("./util");

const roleBuilder = {
	role: "explorer",

	/** @param {Creep} creep **/
	run: function (creep) {
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
	create: function (spawn) {
		let body = [WORK, CARRY, MOVE, MOVE, MOVE];

		return { memory: { role: this.role }, body, id: `Explorer:${GUID()}` };
	},
};

module.exports = roleBuilder;

/**
 *
 * @param {Creep} creep
 */
function Explore(creep) {}

/**
 *
 * @param {Creep} creep
 */
 function Settle(creep) {
	// if()

	AcquireEnergy(creep)

 }