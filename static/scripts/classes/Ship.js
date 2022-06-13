class Ship extends THREE.Mesh {
    constructor(type, posX, posZ, rotation, xArray, yArray) {
        super()
        let temp = this;
        this.obj = new THREE.Object3D();
        this.x = xArray;
        this.y = yArray;
        this.obj.rotation.y = rotation
        this.name = type
        this.distance = 0;
        this.shakeAngle = 0;
        let loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () => {
            game.loadedModels += 1;
            if (game.loadedModels >= 7) {
                ui.switchDisplayById('loadingScreen', 'none')
            }
        }
        switch (type) {
            case "raft":
                this.distance = 1
                this.shakeAngle = Math.PI / 20
                this.obj.position.set(posX, 30, posZ)
                const loader = new THREE.GLTFLoader(loadingManager);
                loader.load('../../models/raft/untitled.gltf', function (gltf) {
                    gltf.scene.scale.set(0.175, 0.175, 0.175)
                    gltf.scene.position.set(0, 0, 0)
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                        }
                    });
                    temp.obj.add(gltf.scene);
                }, undefined, function (error) {
                    console.error(error);
                });
                break;
            case "smallShip":
                this.obj.position.set(posX, 30, posZ)
                const smallShipLoader = new THREE.FBXLoader(loadingManager);
                this.distance = 3
                this.shakeAngle = Math.PI / 10
                smallShipLoader.load('../../models/smallShip.fbx', function (object) {
                    let model = object
                    model.scale.set(0.01, 0.01, 0.01)
                    model.position.set(0, 0, 0)
                    model.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                        }
                    })
                    temp.obj.add(model)
                });
                break;
            case "mediumShip":
                this.obj.position.set(posX, 45, posZ)
                this.distance = 5
                this.shakeAngle = Math.PI / 15
                const mediumShipLoader = new THREE.FBXLoader(loadingManager);
                let model;
                mediumShipLoader.load('../../models/largeShip2.fbx', function (object) {
                    model = object
                    model.scale.set(0.03, 0.03, 0.03)
                    model.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                        }
                    })
                    temp.obj.add(model)
                });
                break;
            case "largeShip":
                this.obj.position.set(posX, 42, posZ)
                this.distance = 8
                this.shakeAngle = Math.PI / 36
                const largeShipLoader = new THREE.GLTFLoader(loadingManager);
                largeShipLoader.load('../../models/mediumShip/scene.gltf', function (gltf) {
                    gltf.scene.scale.set(0.24, 0.24, 0.24)
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                        }
                    });
                    temp.obj.add(gltf.scene);
                }, undefined, function (error) {
                    console.error(error);
                });
            default:
                break;
        }
    }
    getObj() {
        return this.obj;
    }
    sink() {
        var audio = new Audio('../../sound/effects/splash.mp3');
        audio.play();
        new TWEEN.Tween(this.obj.rotation)
            .to({ x: 0, y: this.obj.rotation.y, z: this.obj.rotation.z + Math.PI }, 3050)
            .repeat(0)
            .easing(TWEEN.Easing.Back.InOut)
            .onUpdate()
            .onComplete(() => {
                var audio = new Audio('../../sound/effects/sinking.mp3');
                audio.play();
                new TWEEN.Tween(this.obj.position)
                    .to({ x: this.obj.position.x, y: 0, z: this.obj.position.z }, 750)
                    .repeat(0)
                    .easing(TWEEN.Easing.Back.InOut)
                    .onUpdate()
                    .onComplete()
                    .start()
            })
            .start()
    }
    idleShipAnimation() {
        new TWEEN.Tween(this.obj.position)
            .to({ x: this.obj.position.x, y: this.obj.position.y - this.distance, z: this.obj.position.z }, 2000)
            .repeat(0)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate()
            .onComplete(() => {
                new TWEEN.Tween(this.obj.position)
                    .to({ x: this.obj.position.x, y: this.obj.position.y + this.distance, z: this.obj.position.z }, 2000)
                    .repeat(0)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate()
                    .onComplete(() => this.idleShipAnimation())
                    .start()
            })
            .start()
    }//Math.PI/36
    shake() {
        new TWEEN.Tween(this.obj.rotation)
            .to({ x: this.obj.rotation.x + this.shakeAngle, y: this.obj.rotation.y, z: this.obj.rotation.z }, 500)
            .repeat(0)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate()
            .onComplete(() => {
                new TWEEN.Tween(this.obj.rotation)
                    .to({ x: this.obj.rotation.x - this.shakeAngle, y: this.obj.rotation.y, z: this.obj.rotation.z }, 750)
                    .repeat(0)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate()
                    .onComplete()
                    .start()
            })
            .start()
    }
}
