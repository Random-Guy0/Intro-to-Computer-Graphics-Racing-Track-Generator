/*
    Chunk Class:
    Each chunk contains a heightmap, as well as the mesh and physics body
*/
import * as THREE from 'three'
//import {noise} from './perlin.js'
import * as CANNON from 'cannon-es'

/**
 * CONFIG
 */
const peakHeight = 60
const terrainSmoothing = 300

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

    constructor(xChunkCoordinate, yChunkCoordinate, chunkSize, split, noiseSeed, targetScene, physicsWorld) {
        this.xChunkCoordinate = xChunkCoordinate
        this.yChunkCoordinate = yChunkCoordinate
        this.chunkSize = chunkSize
        this.split = split - 1
        this.noiseSeed = noiseSeed
        this.height = peakHeight
        this.smoothing = terrainSmoothing
        this.heightMap2D = [[]]
        this.targetScene = targetScene
        this.physicsWorld = physicsWorld

        this.geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, this.split, this.split)
        this.material = new THREE.MeshLambertMaterial()
        this.material.vertexColors = true;
        this.material.wireframe = false

        this.generateHeightMap().then(
            () => {
                this.chunkMesh = this.generateVisual()
                this.chunkMesh.position.set(xChunkCoordinate * chunkSize, 0, -yChunkCoordinate * chunkSize)
                targetScene.add(this.chunkMesh)
            }
        )
        this.chunkPhysicsBody = this.generatePhysics()
        physicsWorld.addBody(this.chunkPhysicsBody)



    }

    /**
     * Generate height map for the terrain of the chunk
     * @returns A 2D array representing the height map
     */
    generateHeightMap() {
        return new Promise(
            (resolve, reject) => {
                noise.seed(this.noiseSeed);
                var rawVertices = this.geometry.attributes.position.array;
                let temp = []
                let iter = 0
                let ret = []
                for (var i = 0; i <= rawVertices.length; i += 3) {
                    if(iter == this.split + 1) {
                        iter = 0
                        ret.push(temp)
                        temp = []
                    }
                    temp.push(this.height * noise.perlin2((rawVertices[i] + this.chunkSize*this.xChunkCoordinate) / this.smoothing, (rawVertices[i + 1] + this.chunkSize*this.yChunkCoordinate) / this.smoothing))
                    iter++
                }
                this.heightMap2D = ret
                this.heightMap = ret.flat()
                resolve()
            }
        )
    }

    /**
     * Generate mesh for the terrain of the chunk
     * @returns THREE.js mesh
     */
    generateVisual() {
        let mesh = new THREE.Mesh(this.geometry, this.material)
        mesh.rotation.x = -Math.PI / 2

        var rawVertices = mesh.geometry.getAttribute('position').array
        for (var i = 0; i < this.heightMap.length; i++) {
            rawVertices[i * 3 + 2] = this.heightMap[i]
        }
        mesh.geometry.getAttribute('position').needsUpdate = true
        mesh.geometry.computeVertexNormals()
        mesh.name = this.getKey()
        
        this.generateColor(mesh);

        return mesh
    }

    generateColor(mesh)
    {
        var geometry = mesh.geometry;
        var count = geometry.attributes.position.count;
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        
        var grassColor = new THREE.Color(0x63f542);

        var snowColor = new THREE.Color(0xf5fcfc);

        var rockColor = new THREE.Color(0x8f6f10);

        var sandColor = new THREE.Color(0xdbc81a);

        var darkGrassColor = new THREE.Color(0x47bf2c);

        var vPosition = geometry.getAttribute('position');
        var vColors = geometry.attributes.color;

        for(var i = 0; i < count; i++)
        {
            var pos = new THREE.Vector3();
            pos.fromBufferAttribute(vPosition, i);
            var posY = mesh.localToWorld(pos).z;
            //console.log(posY);
            if(posY < -15)
            {
                vColors.setXYZ(i, darkGrassColor.r, darkGrassColor.g, darkGrassColor.b);
            }
            else if(posY < 1)
            {
                vColors.setXYZ(i, grassColor.r, grassColor.g, grassColor.b);
            }
            else if(posY > 25)
            {
                vColors.setXYZ(i, snowColor.r, snowColor.g, snowColor.b);
            }
            else if(posY < 10)
            {
                vColors.setXYZ(i, sandColor.r, sandColor.g, sandColor.b);
            }
            else if(posY < 25)
            {
                vColors.setXYZ(i, rockColor.r, rockColor.g, rockColor.b);
            }
        }
    }

    /**
     * Generate physics for the terrain chunk
     * @returns Physics body
     */
    generatePhysics() {
        const heightFieldShape = new CANNON.Heightfield(this.heightMap2D, {
            elementSize: this.chunkSize / this.split,
          })
        const groundMaterial = new CANNON.Material()
        const heightfieldBody = new CANNON.Body({ friction: 0, mass: 0, material: groundMaterial })
        heightfieldBody.addShape(heightFieldShape)

        heightfieldBody.position.set(
          (-(this.split) * heightFieldShape.elementSize) / 2 +this.xChunkCoordinate * this.chunkSize,
          0,
          (-(this.split) * heightFieldShape.elementSize) / 2 -this.yChunkCoordinate * this.chunkSize
        )
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, -Math.PI / 2)


        return heightfieldBody// Physics body
    }

    /**
     * Gets the key for the chunk in string form to be used as a key for a hashmap
     * @returns Key for the hashmap
     */
    getKey() {
        var ret = ""
        return ret.concat(this.xChunkCoordinate, ':', -this.yChunkCoordinate)
    }

    /**
     * Remove mesh and physic body from the scene, freeing up memory
     */
    delete() {
        this.targetScene.remove(this.chunkMesh)
        
        this.physicsWorld.removeBody(this.chunkPhysicsBody)
    }
}

export default Chunk