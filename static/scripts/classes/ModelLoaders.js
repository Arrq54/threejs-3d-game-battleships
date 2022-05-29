class ModelLoaders{
    constructor(){
        console.log("loaders")
    }
    loadMediumBoat(){
        const loader = new THREE.FBXLoader();
        let model;
        let mixer
        loader.load('../../models/boat.fbx', function (object) {

            console.log("jest model")
            object.traverse(function (child) {
            // dla kazdego mesha w modelu
            if (child.isMesh) {
            console.log(child)

            }
            });
            model = object
            console.log(model)
            model.scale.set(0.01,0.01,0.01)
            model.position.set(0,60,0)
            game.scene.add(model)
        });
    }
    loadRaft(){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/tratwa2.fbx', function (object) {

            console.log("jest model")
            object.traverse(function (child) {
            // dla kazdego mesha w modelu
            if (child.isMesh) {
            console.log(child)

            }
            });
            model = object
            console.log(model)
            model.scale.set(0.35,0.35,0.35)
            game.scene.add(model)
        });
    }
}