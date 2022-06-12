class ModelLoaders{
    constructor(){
    }
    loadIsland(loadingManager){
        const loader = new THREE.GLTFLoader(loadingManager);
        loader.load('../../models/island/scene.gltf', function (gltf) {
            gltf.scene.scale.set(14,14,14)
            gltf.scene.rotation.y = Math.PI/1.5
            gltf.scene.position.set(0,40,0)
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                  child.castShadow = true;
                }
             });
            game.deleteAfterWait.add(gltf.scene);

        }, undefined, function (error) {
            console.error(error);
        });
    }
    loadSmallShipIdle(x,y,z,rotation, loadingManager){
        const loader = new THREE.FBXLoader(loadingManager);
        let model;
        loader.load('../../models/smallShip.fbx', function (object) {
            model = object
            model.scale.set(0.0085,0.0085,0.0085)
            model.rotation.y = rotation
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            })
            model.position.set(x,y,z)
            game.deleteAfterWait.add(model)
        })
    }
    loadLargeShipIdle(x,y,z,rotation, loadingManager){
        const loader = new THREE.FBXLoader(loadingManager);
        let model;
        loader.load('../../models/largeShip2.fbx', function (object) {
            model = object
            model.scale.set(0.04,0.04,0.04)
            model.position.set(x,y,z)
            model.rotation.y = rotation
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            })
            game.deleteAfterWait.add(model)
        });
    }
    loadMediumShipIdle(x,y,z,rotation, loadingManager){
        const loader = new THREE.GLTFLoader(loadingManager);
            loader.load('../../models/mediumShip/scene.gltf', function (gltf) {
                gltf.scene.scale.set(0.1,0.1,0.1)
                gltf.scene.rotation.y = rotation
                gltf.scene.position.set(x,y,z)
                game.deleteAfterWait.add(gltf.scene);
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                      child.castShadow = true;
                    }
                 });
            }, undefined, function (error) {
                console.error(error);
            });
    }
}