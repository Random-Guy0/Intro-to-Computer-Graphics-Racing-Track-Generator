import * as THREE from 'three'
import {MTLLoader} from './loaders/MTLLoader.js'
import {OBJLoader} from './loaders/OBJLoader.js'

const CAR_MODEL_DIRECTORY = "/models/car.obj"
const CAR_MATERIAL_DIRECTORY = "/models/car.mtl"

// #region DEFAULT COLOURS
const DEF_BODY_COL = 0x000000
const DEF_DISK_COL = 0xFFFFFF
const DEF_TYRE_COL = 0x080808
const DEF_WHEEL_COL = 0xFFFFFF
const DEF_WINDOW_COL = 0xEEEEFF
// #endregion

var bodyMat
var diskMat
var tyreMat
var wheelMat
var windowMat
var matLoaded = false

function addCarToScene (carSize, targetScene, peakHeight, bodyColor = DEF_BODY_COL, diskColor = DEF_DISK_COL, tyreColor = DEF_TYRE_COL, wheelColor = DEF_WHEEL_COL, windowTint = DEF_WINDOW_COL) {
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
                        //console.log(child)
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
            //console.log(size.x + " " + size.y)
        
            var sca = new THREE.Matrix4()
            var tra = new THREE.Matrix4()
            var combined = new THREE.Matrix4()
        
            sca.makeScale(carSize/size.length(),carSize/size.length(),carSize/size.length())
            tra.makeTranslation (-center.x,-min.y + peakHeight + 2,-center.z)
            
            combined.multiply(sca)
            combined.multiply(tra)
        
            obj.applyMatrix4(combined)
            obj.name = "Car"
            targetScene.add(obj)
        })
    },
    (xhr) => {
        if(xhr.loaded/xhr.total == 1) matLoaded = true
    }
    )
    
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

function getMaterialsObject() {
    //console.log([bodyMat, diskMat, tyreMat, wheelMat, windowMat])
    if((bodyMat && diskMat && tyreMat && wheelMat && windowMat)){
        return {
            body_colour: bodyMat.color.getHex(),
		    disk_colour: diskMat.color.getHex(),
		    tyre_colour: tyreMat.color.getHex(),
		    wheel_colour: wheelMat.color.getHex(),
		    window_tint: windowMat.color.getHex()
        }
    }
    else {
        // js pain
        return {
            body_colour: DEF_BODY_COL,
            disk_colour: DEF_DISK_COL,
            tyre_colour: DEF_TYRE_COL,
            wheel_colour: DEF_WHEEL_COL,
            window_tint: DEF_WINDOW_COL
        }
    }
    
}

export {
    updateCarMaterial,
    addCarToScene,
    getMaterialsObject,
    matLoaded
}