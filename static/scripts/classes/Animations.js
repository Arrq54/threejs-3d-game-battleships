class Animations{
    constructor(params) {
    }
    sink(ship){
        var audio = new Audio('../../sound/effects/splash.mp3');
        audio.play();
        new TWEEN.Tween(ship.rotation) 
            .to({ x: 0, y:  Math.PI, z:-Math.PI }, 3050)
            .repeat(0) 
            .easing(TWEEN.Easing.Back.InOut) 
            .onUpdate()
            .onComplete(()=>{
                var audio = new Audio('../../sound/effects/sinking.mp3');
                audio.play();
                new TWEEN.Tween(ship.position) 
                    .to({ x: ship.position.x, y:  0, z:ship.position.z}, 750)
                    .repeat(0) 
                    .easing(TWEEN.Easing.Back.InOut) 
                    .onUpdate()
                    .onComplete()
                    .start()
                    })
            .start()
    }
    waitingForOpponent(){

    }
    cameraToChoose(camera){
        let obj = game.scene.position
        console.log(obj)
        new TWEEN.Tween(camera.position) 
            .to({ x: 2000, y: 450, z: 0 }, 100)
            .repeat(0) 
            .easing(TWEEN.Easing.Exponential.In) 
            .onUpdate()
            .onComplete(()=>{game.generateFieldsToChose(); ui.switchDisplayById("shipTypeButtons","block");})
            .start()
    }
}