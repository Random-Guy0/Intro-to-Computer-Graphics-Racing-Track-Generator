import * as THREE from "three";

var moveDir = new THREE.Vector3(0, 0, 0);

class CarControls
{
    constructor(car, camera, moveSpeed, turnSpeed, THREE, CANNON, physicsWorld, groundMat)
    {
        this.car = car;
        this.body;
        this.camera = camera;

        this.moveSpeed = moveSpeed;
        this.turnSpeed = turnSpeed;

        this.CANNON = CANNON;

        this.physicsWorld = physicsWorld;
        this.groundMat = groundMat

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(event)
    {
        switch(event.keyCode)
        {
            case 87:
            case 38:
                if(moveDir.z > -1)
                    moveDir.z -= 1;
                break;
            case 83:
            case 40:
                if(moveDir.z < 1)
                    moveDir.z += 1;
                break;
            case 65:
            case 37:
                if(moveDir.x < 1)
                    moveDir.x += 1;
                break;
            case 68:
            case 39:
                if(moveDir.x > -1)
                    moveDir.x -= 1;
                break;
        }
    }

    onKeyUp(event)
    {
        switch(event.keyCode)
        {
            case 87:
            case 38:
                moveDir.z += 1;
                break;
            case 83:
            case 40:
                moveDir.z -= 1;
                break;
            case 65:
            case 37:
                moveDir.x -= 1;
                break;
            case 68:
            case 39:
                moveDir.x += 1;
                break;
        }
    }
    
    createRigidBody()
    {
        var carShape = new this.CANNON.Box(new this.CANNON.Vec3(0.85 * this.car.scale.x, 0.85 * this.car.scale.y, 0.85 * this.car.scale.z));
        var mat = new this.CANNON.Material();
        var carBody = new this.CANNON.Body({ mass : 1, material: mat});
        carBody.addShape(carShape);
        carBody.position.set(this.car.position.x, this.car.position.y, this.car.position.z);
        carBody.quaternion.set(this.car.quaternion.x, this.car.quaternion.y, this.car.quaternion.z, this.car.quaternion.w)

        carBody.angularDamping = 1;

        var mat_ground = new this.CANNON.ContactMaterial(this.groundMat, mat, {friction: 0.0025, restitution: 0.0});
        this.physicsWorld.addContactMaterial(mat_ground);

        this.body = carBody
        return carBody;
    }

    move(deltaTime)
    {
        var velocity = this.body.velocity;
        var speed = velocity.length();

        if(speed > 0.005)
        {
            var rot = this.turnSpeed * moveDir.x;
            var curRot = new this.CANNON.Vec3();
            this.body.quaternion.toEuler(curRot);
            var newRot = new this.CANNON.Vec3(curRot.x, curRot.y + rot * deltaTime, curRot.z);
            var newQuat = new this.CANNON.Quaternion();
            newQuat.setFromEuler(newRot.x, newRot.y, newRot.z);
            this.body.quaternion = newQuat;
        }

        if(speed < 60)
        {
            var force = new this.CANNON.Vec3(moveDir.z * this.moveSpeed, 0, 0);
            this.body.applyLocalForce(force, this.body.pointToLocalFrame(this.body.position));
        }

        this.applyDrag(0.02);
    }

    applyDrag(coefficient)
    {
        var velocity = this.body.velocity;
        var localVelocity = this.body.vectorToLocalFrame(velocity);

        var localSpeed = localVelocity.length();

        var dragMagnitude = coefficient * Math.pow(localSpeed, 2);

        var drag = velocity.clone();
        drag.scale(-1, drag);

        drag.normalize();

        drag.scale(dragMagnitude, drag);

        var centerInWorldCoords = this.body.pointToWorldFrame(new this.CANNON.Vec3());
        this.body.applyForce(drag, centerInWorldCoords);
    }

    setVariable(carProperties) {
        this.moveSpeed = carProperties.move_speed
        this.turnSpeed = carProperties.turnSpeed
    }
}

export default CarControls;