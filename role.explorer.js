const { GUID, AcquireEnergy } = require("./util");

const roleBuilder = {
	role: "explorer",

	/** @param {Creep} creep **/
	run: function (creep) {
	},
	/**
	 *
	 * @param {StructureSpawn} spawn
	 * @returns
	 */
	create: function (spawn) {
		let body = [MOVE, MOVE, MOVE];

		return { memory: { role: this.role }, body, id: `Explorer:${GUID()}` };
	},
};

module.exports = roleBuilder;