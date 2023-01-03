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

		if((validSpawns.length && (!roles["laborer"] || roles["laborer"].length < 4))) {
			const spawn = validSpawns.pop();
			Log("Spawning Laborer")
			const creep = require("role.laborer").create(spawn)
			spawn.spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}
		
		if(validSpawns.length && (!roles["harvester"] || roles["harvester"].length < Math.max(sources.length * 2, 5))) {
			const spawn = validSpawns.pop();
			Log("Spawning Harvester")
			const creep = require("role.harvester").create(spawn)
			spawn.spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}

		
		if(validSpawns.length && (!roles["builder"] || roles["builder"].length < Math.max(room.find(FIND_CONSTRUCTION_SITES).length, 4))) {
			const spawn = validSpawns.pop();
			Log("Spawning Builder")
			const creep = require("role.builder").create(spawn)
			spawn.spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}

	}
}