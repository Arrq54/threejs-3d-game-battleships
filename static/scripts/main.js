let game, modelLoaders;
window.onload = ()=>{
    modelLoaders = new ModelLoaders();
    game = new Game()
    
}
window,onresize = ()=>{
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}