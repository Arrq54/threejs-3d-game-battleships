 class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x333333);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);
        this.chessboard = []
        this.pawns = []
        this.camera.position.set(600, 231, 600)
        this.camera.lookAt(this.scene.position)
        this.axes = new THREE.AxesHelper(1000)
        this.scene.add(this.axes)
        this.render() // wywołanie metody render
        this.setup()
        this.ships = []
        this.fieldsToChose = [
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
        ]
        this.fieldsToChoseObjects = []
        this.clickedMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../../textures/chosenField.png') })
        this.notClickedMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../textures/fieldToChose.png') }) 
        this.cantPlaceMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../textures/cantPlace.png') }) 
        this.raftsLeft = 4;
        this.smallShipsLeft = 3;
        this.mediumShipsLeft =2;
        this.largeShipsLeft = 1;
        this.cantPlaceArray = []
        this.cantPlaceArrayHelp = []
    }
    setup = ()=>{
        let loader = new THREE.TextureLoader();
        this.scene.background = loader.load( '../../textures/background2.jpeg' );
        let sandGeometry = new THREE.PlaneGeometry( 6000, 6000, 100, 100 );
        sandGeometry.rotateX( -Math.PI / 2 );
        const vertex = new THREE.Vector3();
        let position = sandGeometry.attributes.position;
        for ( let i = 0, l = position.count; i < l; i ++ ) {
            vertex.fromBufferAttribute( position, i );
            vertex.x += Math.random() * 20 - 10;
            vertex.y += Math.random() * 2;
            vertex.z += Math.random() * 20 - 10;
            position.setXYZ( i, vertex.x, vertex.y, vertex.z );
        }
        sandGeometry = sandGeometry.toNonIndexed();
        position = sandGeometry.attributes.position;
        const colorsFloor = [];
        const color = new THREE.Color();
        for ( let i = 0; i < position.count; i ++ ) {
            color.setHSL( Math.random() * (0.16111 - 0.1222) + 0.1222, 0.5,0.6);
            colorsFloor.push( color.r, color.g, color.b );
        }
        sandGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );
        const sandMaterial = new THREE.MeshBasicMaterial( {vertexColors: true } );
        const sand = new THREE.Mesh( sandGeometry, sandMaterial );
        this.scene.add( sand );
        const waterGeometry = new THREE.PlaneGeometry( 5000, 5000, 100, 100 );
        waterGeometry.rotateX(Math.PI / 2 );
        const waterMaterial = new THREE.MeshBasicMaterial( {color: 0x46b7e3, side: THREE.DoubleSide,transparent: true, opacity: 0.6} );
        const water = new THREE.Mesh( waterGeometry, waterMaterial );
        water.position.y = 30
        this.scene.add( water );
        const light = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(light);
        this.angle = 0
        }
        loadWaitingScreen(){
            ui.switchDisplayById("wait","block")
            this.waitForOpponent = true;
            modelLoaders.loadSmallShipIdle(140,30,170,Math.PI - 0.5)
            modelLoaders.loadSmallShipIdle(-60,30,170,Math.PI/2)
            modelLoaders.loadSmallShipIdle(-120,30,-180,Math.PI)
            modelLoaders.loadLargeShipIdle(80,40,-250,Math.PI+0.5)
            modelLoaders.loadLargeShipIdle(-380,40,-420,Math.PI+0.5)
            modelLoaders.loadLargeShipIdle(-620,40,-720,Math.PI+0.5)
            modelLoaders.loadSmallShipIdle(-220,30,-180,Math.PI)
            modelLoaders.loadMediumShipIdle(-500,30,20,Math.PI)
            modelLoaders.loadMediumShipIdle(500,30,20,Math.PI)
            modelLoaders.loadMediumShipIdle(170,30,20,Math.PI)
            modelLoaders.loadMediumShipIdle(250,30,320,Math.PI+0.3)
            modelLoaders.loadMediumShipIdle(650,30,-820,0)
            modelLoaders.loadIsland()
            // var audio = new Audio('../../sound/soundtrack/waiting theme.mp3');
            // audio.play();
        }
        pickShips(){
            animations.cameraToChoose(this.camera)
            ui.switchDisplayById("wait","none")
            this.waitForOpponent = false;
        }
        generateFieldsToChose(){
            this.camera.lookAt(this.camera.position.x,0,this.camera.position.z)
            let shift =2000;
            let fieldId=0;
            this.fieldsToChose.map((array,i)=>{
                array.map((item,j)=>{
                    const geometry = new THREE.BoxGeometry( 25, 1, 25 );
                    const material = new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide, 
                        map: new THREE.TextureLoader().load('../../textures/fieldToChose.png'), 
                        transparent: true, 
                        opacity: 1, 
                    })
                    const cube = new THREE.Mesh( geometry, material );
                    cube.name = "select"
                    cube.x = i
                    cube.y = j
                    cube.fieldId = fieldId
                    fieldId+=1;
                    cube.canPutShip = true;
                    cube.checked = false;
                    cube.position.set(shift + (i * 25) - (25 * this.fieldsToChose.length) / 2, 30,(j * 25)  - (25 * this.fieldsToChose.length) / 2)
                    this.scene.add( cube );
                    this.fieldsToChoseObjects.push(cube)
                })
            })
        }
    render = () => {
        if(this.waitForOpponent){
            this.camera.position.z = 600 * Math.cos(this.angle);
            this.camera.position.x = 600 * Math.sin(this.angle);
            this.camera.lookAt(0,150,0)
            this.angle+=0.005
        }
        requestAnimationFrame(this.render);
        TWEEN.update();
        this.renderer.render(this.scene, this.camera);
    }
 }


 window.addEventListener("mousedown", (e) => {
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2()
    mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVector, game.camera);
    const intersects = raycaster.intersectObjects(game.scene.children);
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        if(clickedObject.name=="select"){
            let canChange=false;
            let clicked = game.fieldsToChoseObjects.find((element)=>{return element.fieldId == clickedObject.fieldId})
            if(clicked.hasShip ){
                canChange=true;
                clicked.hasShip=false;
                if(game.typeOfChosingShip==1){
                    game.raftsLeft+=1;
                    ui.updateRaftsLeft()
                }
                let blockedFieldsArray = game.cantPlaceArray.find((element)=>{return element.fieldId == clicked.fieldId})
                blockedFieldsArray.fields.map((element)=>{
                    help = game.cantPlaceArrayHelp.filter((item,index)=>{return item.x==element.x && item.y==element.y})
                    if(help.length==1){
                        element.material = game.notClickedMat
                        element.canPutShip = true;
                    }
                    let stay = help[0]
                    game.cantPlaceArrayHelp = game.cantPlaceArrayHelp.filter((item,index)=>{return item.fieldId!=help[0].fieldId})
                    for(let h=0;h<help.length-1;h++){
                        game.cantPlaceArrayHelp.push(stay)
                    }
                })
                game.cantPlaceArray = game.cantPlaceArray.filter((element)=>{return element.fieldId != clicked.fieldId})
            }
            if(game.typeOfChosingShip==1 && !clicked.checked && clicked.canPutShip){
                if( game.raftsLeft!=0){
                    game.raftsLeft -=1;
                    clicked.hasShip = true;
                    ui.updateRaftsLeft()
                    canChange=true;
                    console.log(`(${clicked.x},${clicked.y})`)
                    let xs = [-1,-1,-1,0,0,1,1,1]
                    let ys = [-1,0,1,-1,1,-1,0,1]
                    let temp = []
                    xs.map((v,i)=>{
                        obj = game.fieldsToChoseObjects.find((element)=>{return (element.x==clicked.x+xs[i] && element.y==clicked.y+ys[i])})
                        if(obj!=undefined){
                            obj.material = game.cantPlaceMat
                            obj.canPutShip = false;
                            game.cantPlaceArrayHelp.push(obj)
                            temp.push(obj)
                        }
                        
                    })
                    game.cantPlaceArray.push({fieldId: clicked.fieldId, fields: temp})
                }
            }
            

            if(canChange){
                let clicked = game.fieldsToChoseObjects.find((element)=>{return element.fieldId == clickedObject.fieldId})
                clickedObject.checked?clicked.material = game.notClickedMat:clicked.material = game.clickedMat
                clicked.checked = !clicked.checked;
            }
        }
    }
})