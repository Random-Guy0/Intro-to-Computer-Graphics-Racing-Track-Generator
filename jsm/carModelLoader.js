import * as THREE from 'three'
import {MTLLoader} from './loaders/MTLLoader.js'
import {OBJLoader} from './loaders/OBJLoader.js'

const CAR_MODEL_DIRECTORY = "/models/car.obj"
const CAR_MATERIAL_DIRECTORY = "/models/car.mtl"

function addCarToScene (carSize, targetScene) {
    var mtlLoader = new MTLLoader()
    mtlLoader.load(CAR_MATERIAL_DIRECTORY, (materials) => {
        materials.preload()
        materials.materials.color.color.set(0xFFBBBB)   // Colour of the car
        materials.materials.disk.color.set(0xFFFFFF)    // Colour of the brake disk
        //materials.materials.elements.color.set(0xFFFFFF)  // Front light, side mirrors, etc
        materials.materials.tyre.color.set(0x000000)    // Colour of the Tyre
        materials.materials.wheel.color.set(0xFFFFFF)    // Colour of the wheels
        materials.materials.window.color.set(0xFFFFFF)    // Colour of the windows

        var loader = new OBJLoader()
        loader.setMaterials(materials)
        loader.load(CAR_MODEL_DIRECTORY, (obj) => {
            obj.traverse (
                (child) => {
                        console.log(child)
                }
            )

            for (var i = obj.children.length - 1; i >= 0; i--) {
                //if(obj.children[i].name == 'Cube') obj.remove(obj.children[i])
                //grila_Plane.002
                //Plane.001_Plane
                //car_Plane.001
                switch(obj.children[i].name)
                {
                    case 'Cube':
                    //case 'grila_Plane.002':
                    case 'Plane.001_Plane':
                    //case 'car_Plane.001':
                        obj.remove(obj.children[i])
                        break
                    default:
                }
            }
        
            var boundingBox = new THREE.Box3().setFromObject(obj)
            var center = new THREE.Vector3()
            var size = new THREE.Vector3()
            boundingBox.getCenter(center)
            boundingBox.getSize(size)
            var min = boundingBox.min
            console.log(size.x + " " + size.y)
        
            var sca = new THREE.Matrix4()
            var tra = new THREE.Matrix4()
            var combined = new THREE.Matrix4()
        
            sca.makeScale(carSize/size.length(),carSize/size.length(),carSize/size.length())
            tra.makeTranslation (-center.x,-min.y,-center.z)
            
            combined.multiply(sca)
            combined.multiply(tra)
        
            obj.applyMatrix4(combined)
            obj.name = "Car"
            targetScene.add(obj)
        })
    })
}

export {
    addCarToScene
}