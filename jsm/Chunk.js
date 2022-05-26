/*
    Chunk Class:
    Each chunk contains a heightmap, as well as the mesh and physics body
*/
import * as THREE from 'three'

/**
 * Represents a chunk
 * @constructor
 * @param {number} xChunkCoordinate Position of the chunk in the x axis in the chunk coordinates
 * @param {number} yChunkCoordinate Position of the chunk in the y axis in the chunk coordinates
 * @param {number} chunkSize Size of each chunk
 * @param {number} split Resolution of the chunk
 * @param {number} noiseSeed Seed for the terrain generation
 */
class Chunk {
    xChunkCoordinate
    yChunkCoordinate
    heightMap
    chunkMesh
    chunkPhysicsBody
    
    split       // The number of vertices in a chunk is exactly this squared
    chunkSize   // Size of the chunk

    noiseSeed   // Seed for perlin noise

    constructor(xChunkCoordinate, yChunkCoordinate, chunkSize, split, noiseSeed) {
        this.xChunkCoordinate = xChunkCoordinate
        this.yChunkCoordinate = yChunkCoordinate
        this.chunkSize = chunkSize
        this.split = split
        this.heightMap = this.generateHeightMap()
    }

    /**
     * Generate height map for the terrain of the chunk
     * @returns A 2D array representing the height map
     */
    generateHeightMap() {
        var ret = []
        for(var x = 0; x < this.split; x++) {
            var row = []
            for(var y = 0; y < this.split; y++) {
                row.push(0/* Height goes here, generated with perlin noise */)
            }
            ret.push(row)
        }
        return ret
    }

    /**
     * Generate mesh for the terrain of the chunk
     * @returns THREE.js mesh
     */
    generateVisual() {
        if(this.heightMap != undefined) console.log("ERROR: Heightmap does not exists")
        const geometry = new THREE.PlaneGeometry(chunkSize, chunkSize, split, split)
        const material = new THREE.MeshLambertMaterial({color: 0x00FF00})               // Green flooring

        let mesh = new THREE.Mesh(geometry, material)
        
        var rawVertices = mesh.geometry.getAttribute('position').array
        for(var i = 0; i < rawVertices.length; i += 3) {
            rawVertices[i+2] = this.heightMap[i/3]
        }
        mesh.geometry.getAttribute('position').needsUpdate = true
        mesh.geometry.computeVertexNormals()

        return mesh
    }

    /**
     * Generate physics for the terrain chunk
     * @returns Physics body
     */
    generatePhysics() {
        if(this.heightMap != undefined) console.log("ERROR: Heightmap does not exists")
        return // Physics body
    }

    /**
     * Gets the key for the chunk in string form to be used as a key for a hashmap
     * @returns Key for the hashmap
     */
    getKey() {
        var ret = ""
        return ret.concat(this.xChunkCoordinate, ':', this.yChunkCoordinate)
    }

    /**
     * Remove mesh and physic body from the scene, freeing up memory
     */
    delete() {

    }
}