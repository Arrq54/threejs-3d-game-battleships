class ModelLoaders{
    constructor(){
    }
    loadIsland(){
        const loader = new THREE.GLTFLoader();
        loader.load('../../models/island/scene.gltf', function (gltf) {
            gltf.scene.scale.set(14,14,14)
            gltf.scene.rotation.y = Math.PI/1.5
            gltf.scene.position.set(0,40,0)
            game.scene.add(gltf.scene);

        }, undefined, function (error) {
            console.error(error);
        });
    }
    loadRaft(x,z,rotation){
        const loader = new THREE.GLTFLoader();
            loader.load('../../models/raft/untitled.gltf', function (gltf) {
                gltf.scene.scale.set(0.175,0.175,0.175)
                gltf.scene.position.set(x,30,z)
                gltf.scene.rotation.y = rotation
                game.scene.add(gltf.scene);
            }, undefined, function (error) {
                console.error(error);
            });
    }
    loadSmallShip(x,z,rotation){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/smallShip.fbx', function (object) {
            model = object
            model.scale.set(0.01,0.01,0.01)
            model.position.set(x,30,z)
            model.rotation.y = rotation
            game.scene.add(model)
        });
    }
    loadSmallShipIdle(x,y,z,rotation){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/smallShip.fbx', function (object) {
            model = object
            model.scale.set(0.0085,0.0085,0.0085)
            model.rotation.y = rotation
            model.position.set(x,y,z)
            game.scene.add(model)
        })
    }
    loadLargeShipIdle(x,y,z,rotation){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/largeShip2.fbx', function (object) {
            model = object
            model.scale.set(0.04,0.04,0.04)
            model.position.set(x,y,z)
            model.rotation.y = rotation
            game.scene.add(model)
        });
    }
    loadMediumShipIdle(x,y,z,rotation){
        const loader = new THREE.GLTFLoader();
            loader.load('../../models/mediumShip/scene.gltf', function (gltf) {
                gltf.scene.scale.set(0.1,0.1,0.1)
                gltf.scene.rotation.y = rotation
                gltf.scene.position.set(x,y,z)
                game.scene.add(gltf.scene);
            }, undefined, function (error) {
                console.error(error);
            });
    }
    loadMediumShip(x,z,rotation){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/largeShip2.fbx', function (object) {
            model = object
            model.scale.set(0.03,0.03,0.03)
            model.position.set(x,45,z)
            model.rotation.y = rotation
            game.scene.add(model)
        });
    }
    loadLargeShip(x,z,rotation){
        const loader = new THREE.GLTFLoader();
        loader.load('../../models/mediumShip/scene.gltf', function (gltf) {
            gltf.scene.scale.set(0.24,0.24,0.24)
            gltf.scene.position.set(x,42,z)
            gltf.scene.rotation.y = rotation
            game.scene.add(gltf.scene);
        }, undefined, function (error) {
            console.error(error);
        });
    }
}
