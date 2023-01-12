import { logger } from "./logging";

import harvester from "role.harvester";
import laborer from "role.laborer";
import builder from "role.builder";


export default async function() {

	for (const [id, room] of Object.entries(Game.rooms)) {

		const creeps = room.find(FIND_CREEPS);
		const sources = room.find(FIND_SOURCES_ACTIVE);
		const spawns = room.find(FIND_MY_SPAWNS);

		const validSpawns = spawns.filter(v => !v.spawning);

		if(!validSpawns.length) {
			logger.Debug(`Room ${id} has no spawning capacity`);
			continue;
		}
		
		const roles = creeps.reduce(function(obj: Record<string, Creep[]>, value) {
			(obj[value.memory.role] = obj[value.memory.role] || []).push(value);
			return obj;
		}, {});

		if((validSpawns.length && (!roles["laborer"] || roles["laborer"].length < 4))) {
			const spawn = validSpawns.pop() as StructureSpawn;
			logger.Log("Spawning Laborer")
			const creep = laborer.create(spawn);
			//@ts-ignore
			spawn.spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}
		
		if(validSpawns.length && (!roles["harvester"] || roles["harvester"].length < Math.max(sources.length * 2, 5))) {
			const spawn = validSpawns.pop() as StructureSpawn;
			logger.Log("Spawning Harvester")
			const creep = harvester.create(spawn)
			//@ts-ignore
			spawn.spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}
		
		
		if(validSpawns.length && (!roles["builder"] || roles["builder"].length < 4)) {
			const spawn = validSpawns.pop() as StructureSpawn;
			logger.Log("Spawning Builder")
			const creep = builder.create(spawn)
			//@ts-ignore
			spawn.spawnCreep(creep.body, creep.id, {memory: creep.memory});
		}

	}
}