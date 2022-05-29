class ModelLoaders{
    constructor(){
        console.log("loaders")
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