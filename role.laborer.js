const roleLaborer = {
    run: function(creep) {
        console.log('Start')
        const {
            memory: {
                task,
                sourceId
            }
        } = creep

        // Task States: harvest | fill | withdraw | renew | recycle
        if(creep.store.getFreeCapacity() > 0) {
                const sources = creep.room.find(FIND_SOURCES).filter(source=>sourceId===source.id)
                const source = sources.length ? sources[0] : false
                if (source) {
                    const harvestAttempt = creep.harvest(source)
                    if(harvestAttempt === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                    } else {
                        console.log('AttemptResult', harvestAttempt)
                    }
                } else {
                    console.log('No such source:', source)
                }
        } else {
            console.log('Fill')
            const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });

            // const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            // if(target) {
            //     if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(target);
            //     }
            // }
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                // TODO: Add in edge case if full. I.e. set task to null, making available for a new action
            }
        }
    }
};

module.exports = roleLaborer;