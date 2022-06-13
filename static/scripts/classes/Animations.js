
class Animations {
    constructor(params) {
    }
    sink(ship) {
        var audio = new Audio('../../sound/effects/splash.mp3');
        audio.play();
        new TWEEN.Tween(ship.rotation)
            .to({ x: 0, y: Math.PI, z: -Math.PI }, 3050)
            .repeat(0)
            .easing(TWEEN.Easing.Back.InOut)
            .onUpdate()
            .onComplete(() => {
                var audio = new Audio('../../sound/effects/sinking.mp3');
                audio.play();
                new TWEEN.Tween(ship.position)
                    .to({ x: ship.position.x, y: 0, z: ship.position.z }, 750)
                    .repeat(0)
                    .easing(TWEEN.Easing.Back.InOut)
                    .onUpdate()
                    .onComplete()
                    .start()
            })
            .start()
    }
    cameraToChoose(camera) {
        new TWEEN.Tween(camera.position)
            .to({ x: 2000, y: 450, z: 0 }, 100)
            .repeat(0)
            .easing(TWEEN.Easing.Exponential.In)
            .onUpdate()
            .onComplete(() => { game.generateFieldsToChose(); ui.switchDisplayById("shipTypeButtons", "block"); })
            .start()
    }
    cameraToGameplay() {//x: 1000, y: 450, z: 0
        new TWEEN.Tween(game.camera.position)
            .to({ x: 1000, y: 450, z: 0 }, 300)
            .repeat(0)
            .easing(TWEEN.Easing.Exponential.In)
            .onUpdate()
            .onComplete(() => { game.generateGameplayModels() })
            .start()
    }
    cameraToGameplaySlow() {//x: 1000, y: 450, z: 0
        new TWEEN.Tween(game.camera.position)
            .to({ x: 1000, y: 450, z: 0 }, 750)
            .repeat(0)
            .easing(TWEEN.Easing.Exponential.In)
            .onUpdate()
            .start()
    }
    cameraToOpponent() {
        new TWEEN.Tween(game.camera.position)
            .to({ x: -900, y: 450, z: 0 }, 750)
            .repeat(0)
            .easing(TWEEN.Easing.Exponential.In)
            .onUpdate()
            .onComplete()
            .start()
    }
    cannonBall(x, z, h, s, l, field, destroyed) {
        var audio = new Audio('../../sound/effects/canonFire.mp3');
        audio.play();
        let ballgeometry = new THREE.SphereGeometry(4, 32, 32);
        let ballmaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const flyingSphere = new THREE.Mesh(ballgeometry, ballmaterial);
        flyingSphere.position.set(850, 300, -200)
        game.scene.add(flyingSphere);
        new TWEEN.Tween(flyingSphere.position)
            .to({ x: x, y: 30, z: z }, 600)
            .repeat(0)
            .easing(TWEEN.Easing.Exponential.Out)
            .onUpdate()
            .onComplete(() => {
                if (flyingSphere.parent != undefined) {
                    flyingSphere.parent.remove(flyingSphere)
                }

                let geometry = new THREE.SphereBufferGeometry(17, 32, 32)
                let tesselateModifier = new THREE.TessellateModifier(18, 6);
                geometry = tesselateModifier.modify(geometry)
                const numFaces = geometry.attributes.position.count;
                const colors = new Float32Array(numFaces * 3 * 3);
                const vel = new Float32Array(numFaces * 3 * 3);
                const color = new THREE.Color()
                for (let f = 0; f < numFaces; f++) {
                    const index = 9 * f;
                    color.setHSL(h, s, l)
                    let dirX = Math.random() * 2 - 1;
                    let dirY = Math.random() * 2 - 1;
                    let dirZ = Math.random() * 2 - 1;
                    for (let i = 0; i < 3; i++) {
                        colors[index + (3 * i)] = color.r;
                        colors[index + (3 * i) + 1] = color.g;
                        colors[index + (3 * i) + 2] = color.b;
                        vel[index + (3 * i)] = dirX
                        vel[index + (3 * i) + 1] = dirY
                        vel[index + (3 * i) + 2] = dirZ
                    }
                }
                geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
                geometry.setAttribute('vel', new THREE.BufferAttribute(vel, 3))
                const shaderMaterial = new THREE.ShaderMaterial({
                    uniforms: uniforms,
                    vertexShader: vertShader,
                    fragmentShader: fragShader
                })
                const sphere = new THREE.Mesh(geometry, shaderMaterial);
                sphere.position.set(x, 30, z)
                game.scene.add(sphere);
                game.objectToExplode = sphere;
                game.explode = true;
                if (h == 0.0555) {
                    var audio = new Audio('../../sound/effects/hitShip.mp3');
                    audio.play();
                    let attackedShip;
                    game.shipsObjects3D.map((ship) => {
                        ship.x.map((element, i) => {
                            if (element == field.x && ship.y[i] == field.y) {
                                attackedShip = ship;
                            }
                        })
                    })
                    if (attackedShip != undefined) {
                        destroyed ? attackedShip.sink() : attackedShip.shake()
                    }


                } else {
                    var audio = new Audio('../../sound/effects/hitWater.mp3');
                    audio.play();
                }

            })
            .start()
    }
}