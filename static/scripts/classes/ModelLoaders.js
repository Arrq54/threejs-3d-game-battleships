class ModelLoaders{
    constructor(){
        console.log("loaders")
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
    loadRaft(){
        const loader = new THREE.GLTFLoader();
            loader.load('../../models/scene.gltf', function (gltf) {
                gltf.scene.scale.set(0.1,0.1,0.1)
                gltf.scene.rotation.y = -Math.PI/2
                game.scene.add(gltf.scene);
            }, undefined, function (error) {
                console.error(error);
            });
    }
    loadSmallShip(){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/smallShip.fbx', function (object) {
            model = object
            console.log(model)
            model.scale.set(0.0055,0.0055,0.0055)
            game.scene.add(model)
        });
    }
    loadSmallShipIdle(x,y,z,rotation){
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/smallShip.fbx', function (object) {
            model = object
            console.log(model)
            model.scale.set(0.0075,0.0075,0.0075)
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
            console.log(model)
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
                console.log("medium idle")
                // game.ships.push(gltf.scene)   ---- DODANIE STATKU DO JAKIEJS TABELI W GAMIE -> NA PRZYSZLOSC
            }, undefined, function (error) {
                console.error(error);
            });
    }
    loadMediumShip(){
        const loader = new THREE.GLTFLoader();
            loader.load('../../models/mediumShip/scene.gltf', function (gltf) {
                gltf.scene.scale.set(0.1,0.1,0.1)
                game.scene.add(gltf.scene);
                gltf.scene.position.set(0,40,0)
                // game.ships.push(gltf.scene)   ---- DODANIE STATKU DO JAKIEJS TABELI W GAMIE -> NA PRZYSZLOSC
            }, undefined, function (error) {
                console.error(error);
            });
    }
    loadLargeShip(){
        //DODANIE 
        const loader = new THREE.FBXLoader();
        let model;
        loader.load('../../models/largeShip2.fbx', function (object) {
            model = object
            console.log(model)
            model.scale.set(0.04,0.04,0.04)
            model.rotation.y = Math.PI
            game.scene.add(model)
            // game.ships.push(model)   ---- DODANIE STATKU DO JAKIEJS TABELI W GAMIE -> NA PRZYSZLOSC
        });
    }
}
