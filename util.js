module.exports.GUID = function () {
	var d = new Date().getTime(); //Timestamp
	var d2 =
		(typeof performance !== "undefined" &&
			performance.now &&
			performance.now() * 1000) ||
		0; //Time in microseconds since page-load or 0 if unsupported
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			var r = Math.random() * 16; //random number between 0 and 16
			if (d > 0) {
				//Use timestamp until depleted
				r = (d + r) % 16 | 0;
				d = Math.floor(d / 16);
			} else {
				//Use microseconds since page-load if supported
				r = (d2 + r) % 16 | 0;
				d2 = Math.floor(d2 / 16);
			}
			return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
		}
	);
};

/**
 *
 * @param {Creep} creep
 * @returns {boolean}
 */
module.exports.AcquireEnergy = function (creep) {

	// Find any dropped energy. This will decay the fastest so its what we want to focus on
	const dropped = creep.pos.findClosestByPath(
		creep.room.find(FIND_DROPPED_RESOURCES, RESOURCE_ENERGY).sort((a, b) => a.amount - b.amount).slice(0, 4)
	);

	if (dropped) {
		if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
			creep.moveTo(dropped);
		}
		return true;
	}

	// Find any containers or storage that contain energy. That way we can retrieve more energy faster

	const storage = creep.pos.findClosestByPath(
		creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				if (
					structure.structureType != STRUCTURE_CONTAINER &&
					structure.structureType != STRUCTURE_STORAGE
				)
					return false;
				return structure.store[RESOURCE_ENERGY] > 0;
			},
		})
	);

	if (storage) {
		if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(storage);
		}
		return true;
	}

	// Lastly if we can work we can also just mine ourselves. Any of the above conditions are preferred but getting energy is better than not
	if(creep.body.find(v => v.type == WORK)) {

		const source = creep.pos.findClosestByPath(
			creep.room.find(FIND_SOURCES_ACTIVE)
		);
		
		if (source) {
			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
			return true;
		}
	}

	return false;
};
