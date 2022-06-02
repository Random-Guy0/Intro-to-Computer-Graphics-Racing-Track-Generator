import * as THREE from "three";

var moveDir = new THREE.Vector3(0, 0, 0);
var brake = false;

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

        //this.createRigidBody();
    }

    onKeyDown(event)
    {
        switch(event.keyCode)
        {
            case 87:
            case 38:
                if(moveDir.z < 1)
                    moveDir.z += 1;
                break;
            case 83:
            case 40:
                if(moveDir.z > -1)
                    moveDir.z -= 1;
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
            case 32:
                brake = !brake;
                break;
        }
    }

    onKeyUp(event)
    {
        switch(event.keyCode)
        {
            case 87:
            case 38:
                moveDir.z -= 1;
                break;
            case 83:
            case 40:
                moveDir.z += 1;
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
        var down = new this.CANNON.Vec3(0, -1, 0);

        var carShape = new this.CANNON.Box(new this.CANNON.Vec3(3 * this.car.scale.x, 0.7 * this.car.scale.y, 1.25 * this.car.scale.z));
        var mat = new this.CANNON.Material('wheel');
        var carMainBody = new this.CANNON.Body({ mass : 1});
        carMainBody.addShape(carShape, new this.CANNON.Vec3(0, 0.1, 0));
        carMainBody.position.set(this.car.position.x, this.car.position.y, this.car.position.z);
        carMainBody.quaternion.set(this.car.quaternion.x, this.car.quaternion.y, this.car.quaternion.z, this.car.quaternion.w);

        var wheelShape = new this.CANNON.Cylinder(0.3, 0.3, 0.2, 20);
        var quaternionWheel = new this.CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)

        //carBody.angularFactor = new this.CANNON.Vec3(0.1, 0, 0.1);
        //carBody.fixedRotation = true;
        //carBody.updateMassProperties();
        //carBody.angularDamping = 0.5;
        /*
        
        var carBody = new this.CANNON.RigidVehicle(
            { chassisBody: carMainBody}
        );

        var frontLeftWheel = new this.CANNON.Body({ mass: 1, material: mat });
        frontLeftWheel.addShape(wheelShape, new this.CANNON.Vec3(), quaternionWheel);
        carBody.addWheel({
            body: frontLeftWheel,
            position: new this.CANNON.Vec3(-1.375, -0.3, 0.85),
            direction: down
        });

        var frontRightWheel = new this.CANNON.Body({ mass: 1, material: mat });
        frontRightWheel.addShape(wheelShape, new this.CANNON.Vec3(), quaternionWheel);
        carBody.addWheel({
            body: frontRightWheel,
            position: new this.CANNON.Vec3(-1.375, -0.3, -0.85),
            direction: down
        });

        var backLeftWheel = new this.CANNON.Body({ mass: 1, material: mat });
        backLeftWheel.addShape(wheelShape, new this.CANNON.Vec3(), quaternionWheel);
        carBody.addWheel({
            body: backLeftWheel,
            position: new this.CANNON.Vec3(1.3, -0.3, 0.85),
            direction: down
        });

        var backRightWheel = new this.CANNON.Body({ mass: 1, material: mat });
        backRightWheel.addShape(wheelShape, new this.CANNON.Vec3(), quaternionWheel);
        carBody.addWheel({
            body: backRightWheel,
            position: new this.CANNON.Vec3(1.3, -0.3, -0.85),
            direction: down
        });

        for(var i = 0; i < carBody.wheelBodies.length; i++)
        {
            carBody.wheelBodies[i].angularDamping = 0.4;
        }*/

        var carBody = new this.CANNON.RaycastVehicle({
            chassisBody: carMainBody,
            //indexForwardAxis: 2,
            //indexUpAxis: 1,
            //indexRightAxis: 0
        });

        var wheelOptions = {
            radius: 0.3,
            directionLocal: new this.CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 45,
            suspensionRestLength: 0.4,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.5,
            maxSuspensionForce: 200000,
            rollInfluence: 0.01,
            axleLocal: new this.CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new this.CANNON.Vec3(-1, 0, 1),
            maxSuspensionTravel: 0.25,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true,
        };

        //front left wheel
        wheelOptions.chassisConnectionPointLocal.set(-1.375, 0, 0.85);
        carBody.addWheel(wheelOptions);

        //front right wheel
        wheelOptions.chassisConnectionPointLocal.set(-1.375, 0, -0.85);
        carBody.addWheel(wheelOptions);

        //back left wheel
        wheelOptions.chassisConnectionPointLocal.set(1.3, 0, 0.85);
        carBody.addWheel(wheelOptions);

        //back right wheel
        wheelOptions.chassisConnectionPointLocal.set(1.3, 0, -0.85);
        carBody.addWheel(wheelOptions);

        var wheelBodies = [];
        carBody.wheelInfos.forEach((wheel) => {
            var wheelBody = new this.CANNON.Body({
                mass: 0,
                material: mat
            });
            wheelBody.type = this.CANNON.KINEMATIC;
            wheelBody.collisionFilterGroup = 0;
            wheelBody.addShape(wheelShape, new this.CANNON.Vec3(), quaternionWheel);
            wheelBodies.push(wheelBody);
            this.physicsWorld.addBody(wheelBody);
        });

        this.physicsWorld.addEventListener('postStep', () => {
            for(var i = 0; i < carBody.wheelInfos.length; i++)
            {
                carBody.updateWheelTransform(i);
                var transform = carBody.wheelInfos[i].worldTransform;
                var wheelBody = wheelBodies[i];
                wheelBody.position.copy(transform.position);
                wheelBody.quaternion.copy(transform.quaternion);
            }
        });


        var mat_ground = new this.CANNON.ContactMaterial(this.groundMat, mat, {friction: 0.3, restitution: 0.0, ContactEquationStiffness: 1000});
        //this.physicsWorld.addContactMaterial(mat_ground);
        this.physicsWorld.addContactMaterial(mat_ground);

        this.body = carBody

        carBody.addToWorld(this.physicsWorld);
        
        return carBody;
    }

    move()
    {
        /*
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
            this.body.applyForce(force);
        }

        this.applyDrag(0.02);
        */
       

        this.body.applyEngineForce(-moveDir.z * this.moveSpeed, 2);
        this.body.applyEngineForce(-moveDir.z * this.moveSpeed, 3);

        this.body.setSteeringValue(moveDir.x * this.turnSpeed, 0);
        this.body.setSteeringValue(moveDir.x * this.turnSpeed, 1);

        if(brake)
        {
            this.body.setBrake(0.05, 0);
            this.body.setBrake(0.05, 1);
            this.body.setBrake(0.05, 2);
            this.body.setBrake(0.05, 3);
        }
        else
        {
            this.body.setBrake(0, 0);
            this.body.setBrake(0, 1);
            this.body.setBrake(0, 2);
            this.body.setBrake(0, 3);
        }

        //this.applyDrag(0.02);
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
        this.turnSpeed = carProperties.turn_speed
    }
}

export default CarControls;