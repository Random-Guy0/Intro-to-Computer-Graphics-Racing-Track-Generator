import Chunk from "./Chunk.js"
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { MTLLoader } from './loaders/MTLLoader.js';
import { OBJLoader } from './loaders/OBJLoader.js';

/**
 * Chunk system
 * @param {number} chunk_size size of chunk
 * @param {number} chunk_div Number of division for chunk plane (resolution of chunk)
 * @param {number} distance viewing distance of tracking target
 * @param {Object3D} track Target to be tracked
 * @param {Scene} targetScene Scene for the chunk to be added
 * @param {Physics world} targetPhysics Target physics world
 * @param {number} seed Random seed for world generation
 */
class ChunkSystem {
    constructor(chunk_size, chunk_div, distance, track, targetScene, targetPhysics, seed, peakHeight, terrainSmoothing, properties) {
        this.chunk_size = chunk_size
        this.chunk_div = chunk_div
        this.distance = distance
        this.chunk_offset_x = 0.0
        this.chunk_offset_z = 0.0
        this.targetScene = targetScene
        this.targetPhysics = targetPhysics
        this.seed = seed

        this.properties = properties

        this.peakHeight = peakHeight;
        this.terrainSmoothing = terrainSmoothing;

        this.loaded_chunks = new Map()

        /* this.geometry = new THREE.BoxGeometry(chunk_size, 1, chunk_size)
        this.material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa
        }) */
        
        this.chunk_coord_pos = this.getTargetChunkCoord(track)
        this.init()
    }

    init() {
        for(var i = (this.chunk_coord_pos.z - this.distance); i <= this.chunk_coord_pos.z + this.distance; i++) {
            for(var j = (this.chunk_coord_pos.x - this.distance); j <= this.chunk_coord_pos.x + this.distance; j++) {
                this.createChunk(j, i)
            }
        }
    }

    //CHUNK NAMING SCHEME: "CHUNK:"+current.x+":"+z
    updateChunk(track) {
        let current = this.getTargetChunkCoord(track)
        //console.log(current)
        //console.log(this.chunk_coord_pos)
        if(current.x != this.chunk_coord_pos.x) {
            let dist_multiplier = 0
            if(current.x < this.chunk_coord_pos.x) dist_multiplier = -1
            else dist_multiplier = 1
            for(var i = (this.chunk_coord_pos.z - this.distance); i <= this.chunk_coord_pos.z + this.distance; i++) {
                this.removeChunk((current.x - (this.distance + 1) * dist_multiplier), i)
                this.removeChunk((current.x - (this.distance + 2) * dist_multiplier), i)
                this.createChunk((current.x + this.distance * dist_multiplier), -i)
            }
              
            this.chunk_coord_pos.z = current.z
            this.chunk_coord_pos.x = current.x
            return
        }
        if(current.z != this.chunk_coord_pos.z) {
            let dist_multiplier = 0
            if(current.z < this.chunk_coord_pos.z) dist_multiplier = -1
            else dist_multiplier = 1
            //console.log(current.z - (this.distance - 1) * dist_multiplier)
            for(var i = (this.chunk_coord_pos.x - this.distance); i <= this.chunk_coord_pos.x + this.distance; i++) {
                this.removeChunk(i, (current.z - (this.distance + 1) * dist_multiplier))
                this.removeChunk(i, (current.z - (this.distance + 2) * dist_multiplier))
                this.createChunk(i, -(current.z + this.distance * dist_multiplier))
            }

            this.chunk_coord_pos.x = current.x
            this.chunk_coord_pos.z = current.z
            return
        } 
    }

    createChunk(x, z) {
        let x_n = x + this.chunk_offset_x
        let z_n = z + this.chunk_offset_z
        let id = x_n+":"+z_n
        if(this.loaded_chunks[id] != null) return
        var chunk = new Chunk(x_n, z_n, this.chunk_size, this.chunk_div, this.seed, this.targetScene, this.targetPhysics, this.peakHeight, this.terrainSmoothing, this.properties)
        this.loaded_chunks.set(chunk.getKey(), chunk)
        /* scene.add(mesh) */
    }

    removeChunk(x, z) {
        let x_n = x + this.chunk_offset_x
        let z_n = z + this.chunk_offset_z
        let id = x_n+":"+z_n
        let targetChunk = this.loaded_chunks.get(id)
        if(targetChunk != null) targetChunk.delete()
        this.loaded_chunks.delete(id)
    }

    getTargetChunkCoord(track) {
        let ret = new THREE.Vector3(Math.floor(track.car.position.x / this.chunk_size), 0, Math.floor(track.car.position.z / this.chunk_size))
        
        return ret
    }

    removeAllChunks()
    {
        this.loaded_chunks.forEach((chunk) => {
            chunk.delete();
        });
    }
    
}

export default ChunkSystem