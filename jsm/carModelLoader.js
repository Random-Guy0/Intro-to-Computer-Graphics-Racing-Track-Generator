import * as THREE from 'three'
import {MTLLoader} from './loaders/MTLLoader.js'
import {OBJLoader} from './loaders/OBJLoader.js'

const CAR_MODEL_DIRECTORY = "/models/car.obj"
const CAR_MATERIAL_DIRECTORY = "/models/car.mtl"

var bodyMat
var diskMat
var tyreMat
var wheelMat
var windowMat

function addCarToScene (carSize, targetScene, bodyColor = 0x000000, diskColor = 0xFFFFFF, tyreColor = 0x080808, wheelColor = 0xFFFFFF, windowTint = 0xEEEEFF) {
    var mtlLoader = new MTLLoader()
    mtlLoader.load(CAR_MATERIAL_DIRECTORY, (materials) => {
        materials.preload()
        bodyMat = materials.materials.color
        diskMat = materials.materials.disk
        tyreMat = materials.materials.tyre
        wheelMat = materials.materials.wheel
        windowMat = materials.materials.window
        bodyMat.color.set(bodyColor)   // Colour of the car
        diskMat.color.set(diskColor)    // Colour of the brake disk
        //materials.materials.elements.color.set(0xFFFFFF)  // Front light, side mirrors, etc
        tyreMat.color.set(tyreColor)    // Colour of the Tyre
        wheelMat.color.set(wheelColor)    // Colour of the wheels
        windowMat.color.set(windowTint)    // Colour of the windows

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

function updateCarMaterial (bodyColor = 0x000000, diskColor = 0xFFFFFF, tyreColor = 0x080808, wheelColor = 0xFFFFFF, windowTint = 0xEEEEFF) {
    if(!(bodyMat && diskMat && tyreMat && wheelMat && windowMat)) return
    bodyMat.color.set(bodyColor)   // Colour of the car
    diskMat.color.set(diskColor)    // Colour of the brake disk
    //materials.materials.elements.color.set(0xFFFFFF)  // Front light, side mirrors, etc
    tyreMat.color.set(tyreColor)    // Colour of the Tyre
    wheelMat.color.set(wheelColor)    // Colour of the wheels
    windowMat.color.set(windowTint)    // Colour of the windows
}

export {
    updateCarMaterial,
    addCarToScene
}