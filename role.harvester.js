	const {
		MINIMUM_LABORER_COST,
		CARRY_COST,
		MOVE_COST,
		WORK_COST,
	} = require("./constants");
	const { Log } = require("./logging");
	const { GUID } = require("./util");

	const roleHarvester = {
		role: "harvester",
		/**
		 *
		 * @param {Creep} creep
		 */
		run: function (creep) {
			if ((!creep.store.getCapacity()) || creep.store.getFreeCapacity() > 0) {
				const sources = creep.room.find(FIND_SOURCES_ACTIVE);

				const source = creep.pos.findClosestByPath(sources);

				if (!source) return creep.say("⁉️");

				creep.say("⛏️");

				if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
					creep.moveTo(source, {
						visualizePathStyle: { stroke: "#ffaa00" },
					});
				}
			} else {
				let targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						if(structure.structureType != STRUCTURE_CONTAINER)
							return;
						return !structure.pos.lookFor("creep").filter(v => v.id != creep.id).length;
					},
				});

				// we have run out of things to charge. Time to upgrade the room
				const target = creep.pos.findClosestByPath(targets);

				if (!target) {
					creep.moveTo(0, 0);
					creep.say("❌");
					return;
				}

				if(!creep.pos.isEqualTo(target)) {
					creep.moveTo(target);
					return;
				}

				if (
					target &&
					creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
				) {
					creep.moveTo(target, {
						visualizePathStyle: { stroke: "#ffffff" },
					});
					// return;
				}
			}
		},
		/**
		 *
		 * @param {StructureSpawn} spawn
		 * @returns	
		 */
		create: function (spawn) {

			let spawnEnergy = spawn.store[RESOURCE_ENERGY];

			spawnEnergy -= MOVE_COST;

			const workElementCount = Math.max((spawnEnergy / WORK_COST) | 0, 1);
			const workElements = Array.from(new Array(workElementCount)).fill(WORK);

			let body = [...workElements, MOVE];

			// const moveAndCarryEnergyReserved =
			// 	(CARRY_COST + MOVE_COST) * desiredLaborers;

			// const workPartCount = Math.floor(
			// 	(energyAvailable - moveAndCarryEnergyReserved) / WORK_COST
			// );

			// body = [MOVE, CARRY, ...Array.of(workPartCount).fill(WORK)];

			return { memory: { role: this.role }, body, id: `Harvester:${GUID()}` };
		},
	};

	module.exports = roleHarvester;
