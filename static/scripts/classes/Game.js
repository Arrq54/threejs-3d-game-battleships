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
        this.cantPlaceArray = [];
        this.cantPlaceArrayHelp = [];
        this.helpArrayForHover = [];
        this.horizontal = true;
        this.hoverMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../textures/hoverField.png') }) 
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
                    cube.hasShip=false;
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
        // console.log(clickedObject)
        if(clickedObject.name=="select"){
            let clicked = game.fieldsToChoseObjects.find((element)=>{return element.fieldId == clickedObject.fieldId})
            let removed = false;
            if(clicked.hasShip ){
                //ODKYRWANIE
                clickedObject.checked?clicked.material = game.notClickedMat:clicked.material = game.clickedMat
                clicked.checked = !clicked.checked;
                clicked.hasShip=false;
                if(clicked.shipType=="1"){
                    game.raftsLeft+=1;
                    ui.updateRaftsLeft()
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
                    clickedObject.checked?clicked.material = game.notClickedMat:clicked.material = game.clickedMat
                    clicked.checked = false
                }else if(clicked.shipType=="2"){
                    game.smallShipsLeft+=1;
                    ui.updateRaftsLeft()
                    clicked.material = game.notClickedMat
                    clicked.checked = false
                    clicked.hasShip = false;
                    clicked.otherBlock.hasShip = false;
                    clicked.otherBlock.material = game.notClickedMat
                    clicked.otherBlock.checked = false
                    let temp = game.cantPlaceArray.find((element)=>{return element.fieldId == clicked.fieldId})
                    let fromOther=false;
                    if(temp==undefined){
                        temp = game.cantPlaceArray.find((element)=>{return element.fieldId == clicked.otherBlock.fieldId})
                        fromOther=true;
                    }
                    temp.fields.map((element)=>{
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
                    if(fromOther){
                        game.cantPlaceArray = game.cantPlaceArray.filter((element)=>{return element.fieldId != clicked.otherBlock.fieldId})
                    }else{
                        game.cantPlaceArray = game.cantPlaceArray.filter((element)=>{return element.fieldId != clicked.fieldId})
                    }
                   
                }
               
                else if(clicked.shipType=="3"){
                    game.mediumShipsLeft+=1;
                    ui.updateRaftsLeft()
                    clicked.material = game.notClickedMat
                    clicked.checked = false
                    clicked.hasShip = false;
                    let temp = game.cantPlaceArray.find((item)=>{return item.fieldId == clicked.fieldId})
                    let idtoDo = clicked.fieldId;
                    clicked.otherBlocks.map((element)=>{
                        element.hasShip = false;
                        element.material = game.notClickedMat;
                        element.checked = false;
                        if(temp==undefined){
                            temp = game.cantPlaceArray.find((item)=>{return item.fieldId == element.fieldId})
                            idtoDo = element.fieldId
                        }
                    })
                    temp.fields.map((element)=>{
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
                    game.cantPlaceArray = game.cantPlaceArray.filter((element)=>{return element.fieldId != idtoDo})
                   
                
                    
                }
                removed=true;
            }
            if(!removed){
                if(game.typeOfChosingShip==1 && !clicked.checked && clicked.canPutShip && clicked.material != game.clickedMat){
                     //WYBIERANIE STATKU - JEDYNKA
                    if( game.raftsLeft!=0){
                        game.raftsLeft -=1;
                        clicked.hasShip = true;
                        clicked.shipType = "1"
                        ui.updateRaftsLeft()
                        game.helpArrayForHover = []
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
                        clicked.material = game.clickedMat
                        clicked.checked = true;
                    }
                }else if(game.typeOfChosingShip==2 && !clicked.checked && clicked.canPutShip&&clicked.material != game.clickedMat&&clicked.hasShip==false){
                    //WYBIERANIE STATKU - DWÓJKA
                    let field1;
                    game.horizontal? field1 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+1 && element.y == clickedObject.y}): field1 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-1})
                    if(field1.canPutShip&& !field1.hasShip){
                        if( game.smallShipsLeft!=0){
                            game.smallShipsLeft -=1;
                            clicked.hasShip = true;
                            ui.updateRaftsLeft()
                            game.helpArrayForHover = []
                            clicked.shipType = "2"
                            let xs,ys;
                            if(game.horizontal){
                                xs =[-1,-1,-1,0,0,1,1,2,2,2]
                                ys = [-1,0,1,-1,1,-1,1,-1,0,1]
                            }else{
                                xs =[-1,0,1,-1,1,-1,1,-1,0,1]
                                ys = [1,1,1,0,0,-1,-1,-2,-2,-2]
                            }
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
                            field1.hasShip=true;
                            field1.shipType = "2";
                            field1.otherBlock = clicked;
                            clicked.otherBlock = field1
                            clicked.material = game.clickedMat
                            field1.material = game.clickedMat
                            field1.checked = true;
                            clicked.checked = true;
                        }
                    }  
                }
                else if(game.typeOfChosingShip==3 && !clicked.checked && clicked.canPutShip&&clicked.material != game.clickedMat&&clicked.hasShip==false){
                    if(game.mediumShipsLeft!=0){
                        let field2,field3;
                        game.mediumShipsLeft -=1;
                        
                        ui.updateRaftsLeft()
                        game.helpArrayForHover = []
                        if( game.horizontal){
                            field2 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+1 && element.y == clickedObject.y})
                            field3 =  game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+2 && element.y == clickedObject.y})
                        }else{
                            field2 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-1})
                            field3 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-2})
                        }
                        clicked.shipType = "3"
                        field2.shipType = "3"
                        field3.shipType = "3"
                        clicked.material = game.clickedMat
                        field2.material = game.clickedMat
                        field3.material = game.clickedMat
                        clicked.hasShip = true;
                        field2.hasShip = true;
                        field3.hasShip = true;
                        clicked.otherBlocks = [field2,field3]
                        field2.otherBlocks = [clicked,field3]
                        field3.otherBlocks = [clicked,field2]
                        field2.checked = true;
                        field3.checked = true;
                        clicked.checked = true;
                        let xs,ys;
                        if(game.horizontal){
                            xs =[-1,-1,-1,0,0,1,1,2,2,3,3,3]
                            ys = [-1,0,1,-1,1,-1,1,-1,1,-1,0,1]
                        }else{
                            xs =[-1,0,1,-1,1,-1,1,-1,1,-1,0,1]
                            ys = [1,1,1,0,0,-1,-1,-2,-2,-3,-3,-3]
                        }
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
            }
        }
    }
})





//              HOVER - NAJEZDZANIE NA POLA I SIE ZMIENIAJA NA ZIELONE
window.addEventListener("mousemove", (e) => {
    if(game!=null){
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2()
        mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouseVector, game.camera);
        const intersects = raycaster.intersectObjects(game.scene.children);
        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            game.helpArrayForHover.map((element)=>{
                element.material = game.notClickedMat;
            })
            game.helpArrayForHover = []
            if(clickedObject.name=="select"){
                switch(game.typeOfChosingShip){
                    case 1:
                        let clicked = game.fieldsToChoseObjects.find((element)=>{return element.fieldId == clickedObject.fieldId})
                        if(clicked.hasShip == false && clicked.canPutShip==true && game.raftsLeft!=0){
                            clicked.material = game.hoverMat
                            game.helpArrayForHover.push(clicked)
                        }
                        break;
                    case 2:
                        let field0,field1;
                        field0 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y})
                        game.horizontal? field1 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+1 && element.y == clickedObject.y}): field1 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-1})
                        if(field0&&field1&&field0.hasShip == false && field0.canPutShip==true && game.smallShipsLeft!=0 && field1.hasShip == false && field1.canPutShip==true){
                            field0.material = game.hoverMat
                            field1.material = game.hoverMat
                            game.helpArrayForHover.push(field0)
                            game.helpArrayForHover.push(field1)
                        }
                        break;
                    case 3:
                        let part0,part2,part3;
                        part0 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y})
                        if(game.horizontal){
                            part2 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+1 && element.y == clickedObject.y})
                            part3 =  game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+2 && element.y == clickedObject.y})
                        }else{
                            part2 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-1})
                            part3 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-2})
                        }
                        if(part0&&part2&&part3&&part0.hasShip == false && part0.canPutShip==true && game.mediumShipsLeft!=0 && part2.hasShip == false && part2.canPutShip==true&& part3.hasShip == false && part3.canPutShip==true){
                            part0.material = game.hoverMat
                            part2.material = game.hoverMat
                            part3.material = game.hoverMat
                            game.helpArrayForHover.push(part0)
                            game.helpArrayForHover.push(part2)
                            game.helpArrayForHover.push(part3)
                        }
                        break;
                        case 4:
                            let largeShipPart1,largeShipPart2,largeShipPart3,largeShipPart4;
                            largeShipPart1 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y})
                            if(game.horizontal){
                                largeShipPart2 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+1 && element.y == clickedObject.y})
                                largeShipPart3 =  game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+2 && element.y == clickedObject.y})
                                largeShipPart4 =  game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x+3 && element.y == clickedObject.y})
                            }else{
                                largeShipPart2 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-1})
                                largeShipPart3 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-2})
                                largeShipPart4 = game.fieldsToChoseObjects.find((element)=>{return element.x == clickedObject.x && element.y == clickedObject.y-3})
                            }
                            if(largeShipPart1&&largeShipPart2&&largeShipPart3&&largeShipPart4&&largeShipPart1.hasShip == false && largeShipPart1.canPutShip==true && game.largeShipsLeft!=0 && largeShipPart2.hasShip == false && largeShipPart2.canPutShip==true&& largeShipPart3.hasShip == false && largeShipPart3.canPutShip==true&& largeShipPart4.hasShip == false && largeShipPart4.canPutShip==true){
                                largeShipPart1.material = game.hoverMat
                                largeShipPart2.material = game.hoverMat
                                largeShipPart3.material = game.hoverMat
                                largeShipPart4.material = game.hoverMat
                                game.helpArrayForHover.push(largeShipPart1)
                                game.helpArrayForHover.push(largeShipPart2)
                                game.helpArrayForHover.push(largeShipPart3)
                                game.helpArrayForHover.push(largeShipPart4)
                            }
                            break;

                    default:
                        break;
                }
            }
        }
    }
})
document.addEventListener("keydown", (e) => {
    if(e.keyCode==82){
        game.horizontal = !game.horizontal;
    }
 });