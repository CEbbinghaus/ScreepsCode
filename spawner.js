const { Log, LogLevel } = require("./logging")


module.exports = function() {

	for (const [id, room] of Object.entries(Game.rooms)) {

		const creeps = room.find(FIND_CREEPS);
		const sources = room.find(FIND_SOURCES_ACTIVE);
		const spawns = room.find(FIND_MY_SPAWNS);

		const validSpawns = spawns.filter(v => !v.spawning);

		if(!validSpawns.length) {
			Log(`Room ${id} has no spawning capacity`, LogLevel.Debug);
			continue;
		}
		
		const roles = creeps.reduce(function(obj, value) {
			(obj[value.memory.role] = obj[value.memory.role] || []).push(value);
			return obj;
		}, {});

		if(validSpawns.length && !roles["harvester"] || roles["harvester"].length < sources.length * 2) {
			Log("Spawning Harvester")
			const creep = require("role.harvester").create()
			validSpawns.pop().spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}

		if(false && (validSpawns.length && !roles["laborer"] || roles["laborer"].length < 5)) {
			Log("Spawning Laborer")
			const creep = require("role.laborer").create()
			validSpawns.pop().spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}

		if(validSpawns.length && !roles["builder"] || roles["builder"].length < 6) {
			Log("Spawning Builder")
			const creep = require("role.builder").create()
			validSpawns.pop().spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}

	}
}