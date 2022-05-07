import * as THREE from 'three'
import {MTLLoader} from './loaders/MTLLoader.js'
import {OBJLoader} from './loaders/OBJLoader.js'

const CAR_MODEL_DIRECTORY = "/models/car.obj"
const CAR_MATERIAL_DIRECTORY = "/models/car.mtl"

function addCarToScene (carSize, targetScene) {
    var mtlLoader = new MTLLoader()
    mtlLoader.load(CAR_MATERIAL_DIRECTORY, (materials) => {
        materials.preload()
        var loader = new OBJLoader()
        loader.setMaterials(materials)
        loader.load(CAR_MODEL_DIRECTORY, (obj) => {
            var boundingBox = new THREE.Box3().setFromObject(obj)
        
            var center = new THREE.Vector3()
            var size = new THREE.Vector3()
            boundingBox.getCenter(center)
            boundingBox.getSize(size)
            var min = boundingBox.min
        
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