const Laborer = require("./role.laborer");
const { GUID } = require("./util");
const { Log, LogLevel } = require("./logging");
const {MINIMUM_LABORER_COST} = require("./constants")



module.exports = function () {
	const unallocatedSources = [];
	const unallocatedCreeps = [];
	for (let roomKey in Game.rooms) {
		const room = Game.rooms[roomKey];

		const [available, total] = [
			room.energyAvailable,
			room.energyCapacityAvailable,
		];

		const sources = room.find(FIND_SOURCES);
		const structures = room.find(FIND_STRUCTURES);

		const spawns = structures.filter(
			(structure) => structure.structureType === STRUCTURE_SPAWN
		);

		const availableSpawns = spawns.filter((spawn) => !spawn.spawning);

		const creeps = room.find(FIND_CREEPS);

		const allocatedRoomSources = creeps.reduce((accum, creep) => {
			const creepSourceAllocation =
				(creep.memory && creep.memory.sourceId) || false;

			if (creepSourceAllocation) {
				accum.push(creepSourceAllocation);
			}

			return accum;
		}, []);

		const unallocatedRoomSources = sources
			.map((source) => source.id)
			.filter((sourceId) => !allocatedRoomSources.includes(sourceId));

		const unallocatedRoomCreeps = creeps.filter((creep) => {
			const creepSourceAllocation =
				(creep.memory && creep.memory.source) || false;
			const creepTaskAllocation =
				(creep.memory && creep.memory.task) || false;
			return !creepSourceAllocation && !creepTaskAllocation;
		});

		const unreservedEnergyAvailable = available;

		// TODO: If creep available, allocate to unallocated source
		// TODO: Allocate creeps to sources
		// TODO: Filter, record remaining unallocations
		unallocatedCreeps.push(...unallocatedRoomCreeps);
		// unallocatedSources.push(...unallocatedRoomSources)

		// Find spawn which is not spawning
		// console.info(spawns)

		// if (
		// 	unallocatedRoomSources.length &&
		// 	unreservedEnergyAvailable > MINIMUM_LABORER_COST &&
		// 	availableSpawns.length
		// ) {
		// 	const laborerBody = Laborer.create(
		// 		unreservedEnergyAvailable,
		// 		availableSpawns.length
		// 	);

		// 	if (laborerBody) {
		// 		let sourceIndex = 0;
		// 		for (let spawn of availableSpawns) {
		// 			if (sourceIndex >= unallocatedRoomSources.length) {
		// 				continue;
		// 			}
		// 			const sourceId = unallocatedRoomSources[sourceIndex];
		// 			Log(`Source allocated: ${sourceId}`, LogLevel.Debug);
		// 			createCreep({ body: laborerBody, sourceId, spawn });
		// 			sourceIndex++;
		// 		}
		// 		// TODO: Adjust this once creep allocation is properly handled
		// 		unallocatedSources.push(
		// 			...unallocatedRoomSources.slice(sourceIndex)
		// 		);
		// 	}
		// }
	}


	for (let creepKey in Game.creeps) {
		const creep = Game.creeps[creepKey];

		const role = creep.memory.role;

		if(!role)
			return Log(`Creep "${creep.id}" has an Invalid Role`)

		const roleObject = require(`./role.${role}`);

		if(!roleObject)
			return Log(`Creep "${creep.id}"'s role ${role} doesn't exist`);

		roleObject.run(creep);
	}
};

function createCreep({ role = "laborer", body, sourceId, spawn }) {
	Log(spawn);

	const id = GUID();
	const spawnResult = spawn.spawnCreep(body, `Laborer:${id}`, {
		memory: {
			role,
			sourceId,
		},
	});

	return spawnResult;
}
