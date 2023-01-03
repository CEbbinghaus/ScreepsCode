const { GUID } = require("./util");
const { Log, LogLevel } = require("./logging");



module.exports = function () {

	if([...Game.rooms["W8N3"].find(FIND_HOSTILE_CREEPS), ...Game.rooms["W8N3"].find(FIND_HOSTILE_POWER_CREEPS)].length > 0) {
		Game.rooms["W8N3"].controller.activateSafeMode();
	}
	for (const [id, creep] of Object.entries(Game.creeps)) {

		if(creep.spawning)
			continue;

		const role = creep.memory.role;

		if(!role)
			return Log(`Creep "${creep.id}" has an Invalid Role`)

		const roleObject = require(`./role.${role}`);

		if(!roleObject)
			return Log(`Creep "${creep.id}"'s role ${role} doesn't exist`);

		roleObject.run(creep);
	}
};