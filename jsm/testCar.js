import * as THREE from 'three'
import { Vector3 } from 'three'

var moveDirection = new THREE.Vector3()
class Player {

    car
    moveDirection

    constructor(scene) {
        this.material = new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
        this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)
        this.car = new THREE.Mesh(this.geometry, this.material)
        this.car.position.y = 10.0
        scene.add(this.car)

        addEventListener('keydown', this.onKeyDown)
        addEventListener('keyup', this.onKeyUp)
    }

    onKeyDown(event) {
        switch(event.keyCode) {
            case 87: // W
                moveDirection.z = 1.0
            break
            case 65: // A
                moveDirection.x = 1.0
            break
            case 83: // S
                moveDirection.z = -1.0
            break
            case 68: // D
                moveDirection.x = -1.0
            break
        }
    }

    onKeyUp(event) {
        switch(event.keyCode) {
            case 87: // W
                moveDirection.z = 0
            break
            case 65: // A
                moveDirection.x = 0
            break
            case 83: // S
                moveDirection.z = 0
            break
            case 68: // D
                moveDirection.x = 0
            break
        }
    }

    move() {
        let target_x = this.car.position.x + moveDirection.x * 0.1
        let target_z = this.car.position.z + moveDirection.z * 0.1 
        this.car.position.set(target_x, this.car.position.y, target_z) 
    }
}

export default Player