const roleLaborer = require('./role.laborer')

const MOVE_COST = 50
const CARRY_COST = 50
const WORK_COST = 100
const MINIMUM_LABORER_COST = CARRY_COST + WORK_COST + MOVE_COST
const MINIMUM_MINER_COST = WORK_COST + MOVE_COST
let creepUUIDSuffix = 0

// NOTE: Approach to development
// 1. Identify greatest behavioural need
// 2. Find a way to make it a task
// 3. Integrate the task with the allocation system

// Task priority: Defend > Harvest > Build > Upgrade
// TODO: Github this work
// TODO: Upgrade controller
// TODO: Generalise tasks
// TODO: Build Extensions
// TODO: Build containers
// TODO: Dedicated miners


module.exports.loop = function () {

    const rooms = {}
    const unallocatedSources = []
    const unallocatedCreeps = []
    for (let roomKey in Game.rooms) {
        const room = Game.rooms[roomKey]
        const [available,total] = [room.energyAvailable,room.energyCapacityAvailable]
        const sources = room.find(FIND_SOURCES)
        const structures = room.find(FIND_STRUCTURES)
        const spawns = structures.filter(structure=>structure.structureType === STRUCTURE_SPAWN)
        const availableSpawns = spawns.filter(spawn=>!spawn.spawning)
        const extensions = structures.filter(structure=>structure.structureType === STRUCTURE_EXTENSION)
        const creeps = room.find(FIND_CREEPS)

        const allocatedRoomSources = creeps.reduce((accum,creep)=>{
            const creepSourceAllocation = (creep.memory && creep.memory.sourceId) || false

            if(creepSourceAllocation) {
                accum.push(creepSourceAllocation)
            }

            return accum
        },[])
        const unallocatedRoomSources = sources.map(source=>source.id).filter(sourceId=>!allocatedRoomSources.includes(sourceId))

        const unallocatedRoomCreeps = creeps.filter(creep=>{
            const creepSourceAllocation = (creep.memory && creep.memory.source) || false
            const creepTaskAllocation =  (creep.memory && creep.memory.task) || false
            return !creepSourceAllocation && !creepTaskAllocation
        })

        rooms[roomKey] = {
            availableSpawns,
            creeps,
            energy: {
                available,
                total
            },
            extensions,
            name: room.name,
            spawns,
            sources,
            unallocatedRoomCreeps,
            unallocatedRoomSources,
        }
    }

    for (let roomKey in rooms) {
        const room = rooms[roomKey]
        const {
            availableSpawns,
            creeps,
            energy,
            extensions,
            name,
            spawns,
            sources,
            unallocatedRoomCreeps,
            unallocatedRoomSources,
        } = room
        const {
            available
        } = energy

        console.log(`Room: ${name}`);
        console.log(`  Sources: ${sources.map(source=>source.id).join(', ')}`)
        console.log(`    Unallocated: ${unallocatedRoomSources.map(source=>source).join(', ')}`)
        console.log(`  Spawns: ${spawns.map(spawn=>spawn.id).join(', ')}`)
        console.log(`  Creeps: ${creeps.map(creep=>creep.id).join(', ')}`)
        console.log(`    Unallocated: ${unallocatedRoomCreeps.map(creep=>creep.id).join(', ')}`)
        console.log(`  Extensions: ${extensions.map(extension=>extension.id).join(', ')}`)

        const unreservedEnergyAvailable = available

        // TODO: If creep available, allocate to unallocated source
            // TODO: Allocate creeps to sources
            // TODO: Filter, record remaining unallocations
            unallocatedCreeps.push(...unallocatedRoomCreeps)
            // unallocatedSources.push(...unallocatedRoomSources)

        // Find spawn which is not spawning
        // console.info(spawns)

        console.log(`Energy: ${energy.available} ${energy.total}`)
        console.log(`Unallocated Sources: ${unallocatedRoomSources.map(s=>s).length}, UnreservedEnergy: ${unreservedEnergyAvailable}, availbleSpawns: ${availableSpawns}`)

        if(unallocatedRoomSources.length && unreservedEnergyAvailable > MINIMUM_LABORER_COST && availableSpawns.length) {
            const laborerBody = composeLaborerBody(unreservedEnergyAvailable,availableSpawns.length)

            if (laborerBody) {
                let sourceIndex = 0
                for(let spawn of availableSpawns) {
                    if (sourceIndex >= unallocatedRoomSources.length) {
                        continue
                    }
                    const sourceId = unallocatedRoomSources[sourceIndex]
                    console.log('Source allocated:',sourceId)
                    createCreep({ body:laborerBody, sourceId, spawn })
                    sourceIndex++
                }
                // TODO: Adjust this once creep allocation is properly handled
                unallocatedSources.push(...unallocatedRoomSources.slice(sourceIndex))
            }
        }

    }
    console.log('\n')

    console.log(`All Unallocated Creeps: ${unallocatedCreeps.join(', ')}`)
    console.log(`All Unallocated Sources: ${unallocatedSources.join(', ')}`)
    console.log(`New creeps needed: ${unallocatedSources.length - unallocatedCreeps.length > 0 ? unallocatedSources.length - unallocatedCreeps.length : 0}`)
    console.log('\n')

    for (let creepKey in Game.creeps) {
        const creep = Game.creeps[creepKey]
        if(creep.memory && creep.memory.role === 'laborer') {
            console.log('Triggering laborer role')
            roleLaborer.run(creep)
        }
    }

}

function composeLaborerBody (energyAvailable, desiredLaborers) {
    if (energyAvailable < MINIMUM_LABORER_COST) {
        return false
    }

    const maximumLaborers = Math.floor(energyAvailable / MINIMUM_LABORER_COST)

    if (maximumLaborers <= desiredLaborers) {
        return [WORK,CARRY,MOVE]
    }

    const moveAndCarryEnergyReserved = (CARRY_COST + MOVE_COST) * desiredLaborers

    const workPartCount = Math.floor((energyAvailable - moveAndCarryEnergyReserved) / WORK_COST)

    const body = [MOVE,CARRY,...Array.of(workPartCount).fill(WORK)]
    return body
}

function createCreep ({ body, sourceId, spawn }) {
    console.log(spawn)
    const spawnResult = spawn.spawnCreep(body,`Laborer${creepUUIDSuffix}`,{
        memory: {
            role: 'laborer',
            task: 'harvest',
            sourceId
        }
    })
    creepUUIDSuffix++

    return spawnResult
}