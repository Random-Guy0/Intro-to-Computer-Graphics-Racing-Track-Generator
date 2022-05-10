import * as THREE from "three";

var moveDir = new THREE.Vector3(0, 0, 0);

class CarControls
{
    constructor(car, camera, moveSpeed, turnSpeed, THREE)
    {
        this.car = car;
        this.camera = camera;

        this.moveSpeed = moveSpeed;
        this.turnSpeed = turnSpeed;

        window.addEventListener('keydown', this.onKeyDown);
    }

    onKeyDown(event)
    {
        switch(event.keyCode)
        {
            case 87:
            case 38:
                console.log("forward");
                if(moveDir != null)
                    moveDir.z -= 1;
                break;
            case 83:
            case 40:
                console.log("backwards");
                if(moveDir != null)
                    moveDir.z += 1;
                break;
            case 65:
            case 37:
                console.log("left");
                if(moveDir != null)
                    moveDir.x -= 1;
                break;
            case 68:
            case 39:
                console.log("right");
                if(moveDir != null)
                    moveDir.x += 1;
                break;
        }
    }
    
    createRigidBody()
    {

        return null;
    }

    move()
    {
        
    }
}

export default CarControls;