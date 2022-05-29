class ChunkSystem {
    constructor(chunk_size, distance, track) {
        this.chunk_size = chunk_size
        this.distance = distance
        this.chunk_offset_x = 0.5
        this.chunk_offset_z = 0.5

        this.loaded_chunks = []

        /* this.geometry = new THREE.BoxGeometry(chunk_size, 1, chunk_size)
        this.material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa
        }) */

        this.chunk_coord_pos = this.getTargetChunkCoord(track)
        this.init(track)
    }

    init(track) {
        for(var i = (this.chunk_coord_pos.z - this.distance); i <= this.chunk_coord_pos.z + this.distance; i++) {
            for(var j = (this.chunk_coord_pos.x - this.distance); j <= this.chunk_coord_pos.x + this.distance; j++) {
                this.createChunk(j, i)
            }
        }
    }

    //CHUNK NAMING SCHEME: "CHUNK:"+current.x+":"+z
    updateChunk(track) {
        let current = this.getTargetChunkCoord(track)
        if(current.x != this.chunk_coord_pos.x) {
            let dist_multiplier = 0
            if(current.x < this.chunk_coord_pos.x) dist_multiplier = -1
            else dist_multiplier = 1
            for(var i = (this.chunk_coord_pos.z - this.distance); i <= this.chunk_coord_pos.z + this.distance; i++) {
                this.removeChunk((current.x - (this.distance + 1) * dist_multiplier), i)
                this.removeChunk((current.x - (this.distance + 2) * dist_multiplier), i)
                this.createChunk((current.x + this.distance * dist_multiplier), i)
            }
              
            this.chunk_coord_pos.x = current.x
            return
        }
        if(current.z != this.chunk_coord_pos.z) {
            let dist_multiplier = 0
            if(current.z < this.chunk_coord_pos.z) dist_multiplier = -1
            else dist_multiplier = 1
            for(var i = (this.chunk_coord_pos.x - this.distance); i <= this.chunk_coord_pos.x + this.distance; i++) {
                this.removeChunk(i, (current.z - (this.distance + 1) * dist_multiplier))
                this.removeChunk(i, (current.z - (this.distance + 2) * dist_multiplier))
                this.createChunk(i, (current.z + this.distance * dist_multiplier))
            }

            this.chunk_coord_pos.z = current.z
            return
        } 
    }

    createChunk(x, z) {
        let x_n = x + this.chunk_offset_x
        let z_n = z + this.chunk_offset_z
        let mesh = new THREE.Mesh(this.geometry, this.material)
        mesh.name = x_n+":"+z_n
        mesh.position.x = x_n * this.chunk_size
        mesh.position.z = z_n * this.chunk_size
        /* scene.add(mesh) */
    }

    removeChunk(x, z) {
        let x_n = x + this.chunk_offset_x
        let z_n = z + this.chunk_offset_z
        scene.remove(scene.getObjectByName(x_n+":"+z_n))    
    }

    getTargetChunkCoord(track) {
        return new THREE.Vector3(Math.floor(track.mesh.position.x / this.chunk_size), 0, Math.floor(track.mesh.position.z / this.chunk_size))
    }
    
}