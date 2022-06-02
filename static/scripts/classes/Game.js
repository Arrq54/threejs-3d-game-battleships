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
        this.tableLineGeo = new THREE.BoxGeometry( 500, 3, 3 ); 
        this.tableLineMat =  new THREE.MeshBasicMaterial( {color: 0xffffff} );
    }
    setup = ()=>{
        let loader = new THREE.TextureLoader();
        this.scene.background = loader.load( '../../textures/background2.jpeg' );
        let sandGeometry = new THREE.PlaneGeometry( 8000, 8000, 100, 100 );
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
        const waterGeometry = new THREE.PlaneGeometry( 7000, 7000, 100, 100 );
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
            ui.switchDisplayById("ready","block")
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
    gatherInfoAboutShips(){
        this.fieldsToChoseObjects.map((element,i)=>{
            if(element.hasShip){
                this.fieldsToChose[element.y][element.x] = parseInt(element.shipType)
            }
        })
        animations.cameraToGameplay(this.camera)
    }
    generateGameplayModels(){
        this.camera.lookAt(1000,0,500)
        console.log("renderek bedzie")
        ui.switchDisplayById("shipTypeButtons","none")
        ui.switchDisplayById("ready","none")
        ui.switchDisplayById("rotateInfo","none")
        let xs = [1250,1200,1150,1100,1050,1000,950,900,850,800,750,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000]
        let zs = [500,500,500,500,500,500,500,500,500,500,500,250,300,350,400,450,500,550,600,650,700,750]
        let rotations = [Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,Math.PI/2,0,0,0,0,0,0,0,0,0,0,0]
        xs.map((e,i)=>{
            this.addTableLine(xs[i],zs[i],rotations[i])
        })

        //GENEROWANIE MODELI STATKOW NA PODSTAWIE TABELI WYBRANYCH PÓL

        let raftRandomDirection = [Math.PI, -Math.PI, Math.PI/2]
        let smallShipRandomDirectionHorizontal = [Math.PI/2, -Math.PI/2]
        let smallShipRandomDirectionVertical = [0, Math.PI]
        let mediumShipRandomDirectionHorizontal = [Math.PI/2, -Math.PI/2]
        let mediumShipRandomDirectionVertical = [Math.PI,0] 

        let largeShipRandomDirectionHorizontal = [Math.PI/2, -Math.PI/2]
        let largeShipRandomDirectionVertical = [Math.PI,0] 
        let smallShipsHelpArray = []
        let mediumShipsHelpArray = []
        let largeShipsHelpArray = []
        this.fieldsToChose.map((line,y)=>{
            line.map((item,x)=>{
                if(item==1){
                    modelLoaders.loadRaft(775 + x*50,275+y*50,raftRandomDirection[Math.floor(Math.random()*raftRandomDirection.length)])
                }else if(item==2){
                    let xs = [-1,0,0,1]
                    let ys = [0,-1,1,0]
                    if(smallShipsHelpArray.filter((element)=>{return element.x==x&&element.y==y}).length==0){
                        xs.map((element,i)=>{
                            if(this.fieldsToChose[y+ys[i]]!=undefined){
                                if(this.fieldsToChose[y+ys[i]][x+xs[i]]!=undefined){
                                    if(this.fieldsToChose[y+ys[i]][x+xs[i]]==2){
                                        smallShipsHelpArray.push({x: x+xs[i], y: y+ys[i]})
                                        let randomOrient;
                                        y+ys[i]==y?randomOrient = smallShipRandomDirectionHorizontal[Math.floor(Math.random()*smallShipRandomDirectionHorizontal.length)]:randomOrient = smallShipRandomDirectionVertical[Math.floor(Math.random()*smallShipRandomDirectionVertical.length)]
                                        modelLoaders.loadSmallShip(775 + ((x+x+xs[i])/2)*50,275+((y+y+ys[i])/2)*50,randomOrient)
                                        
                                    }
                                }
                            }
                         })
                    }
                }else if(item==3){
                    let xs = [-2,-1,0,0,0,0,1,2]
                    let ys = [0,0,-2,-1,1,2,0,0]
                    let tabOfX = [], tabOfY = [];
                    if(mediumShipsHelpArray.filter((element)=>{return element.x==x&&element.y==y}).length==0){
                        tabOfX.push(x)
                        tabOfY.push(y)
                        xs.map((element,i)=>{
                            if(this.fieldsToChose[y+ys[i]]!=undefined){
                                if(this.fieldsToChose[y+ys[i]][x+xs[i]]!=undefined){
                                    if(this.fieldsToChose[y+ys[i]][x+xs[i]]==3){
                                        mediumShipsHelpArray.push({x: x+xs[i], y: y+ys[i]})
                                        tabOfX.push(x+xs[i])
                                        tabOfY.push(y+ys[i])
                                    }
                                }
                            }
                         })
                         let randomOrient = 0;
                         let middleElementX = tabOfX.sort()[1]
                         let middleElementY = tabOfY.sort()[1]
                         tabOfY[0]!=tabOfY[1]?randomOrient = mediumShipRandomDirectionVertical[Math.floor(Math.random()*mediumShipRandomDirectionVertical.length)]:randomOrient = mediumShipRandomDirectionHorizontal[Math.floor(Math.random()*mediumShipRandomDirectionHorizontal.length)]
                         modelLoaders.loadMediumShip(775 + middleElementX*50,275+middleElementY*50,randomOrient)
                    }
                }else if(item==4){
                    let xs = [-3,-2,-1,0,0,0,0,0,0,1,2,3]
                    let ys = [0,0,0,-3,-2,-1,1,2,3,0,0,0,]
                    let sumOfX = 0, sumOfY = 0;
                    if(largeShipsHelpArray.filter((element)=>{return element.x==x&&element.y==y}).length==0){
                        sumOfX+=x;
                        sumOfY+=y;
                        xs.map((element,i)=>{
                            if(this.fieldsToChose[y+ys[i]]!=undefined){
                                if(this.fieldsToChose[y+ys[i]][x+xs[i]]!=undefined){
                                    if(this.fieldsToChose[y+ys[i]][x+xs[i]]==4){
                                        largeShipsHelpArray.push({x: x+xs[i], y: y+ys[i]})
                                        sumOfX+=x+xs[i]
                                        sumOfY+=y+ys[i]
                                    }
                                }
                            }
                         })
                        let randomOrient = 0;
                        let avgX = sumOfX/4
                        let avgY = sumOfY/4
                        console.log(avgX)
                        console.log(avgY)
                          avgY!=y?randomOrient = largeShipRandomDirectionVertical[Math.floor(Math.random()*largeShipRandomDirectionVertical.length)]:randomOrient = largeShipRandomDirectionHorizontal[Math.floor(Math.random()*largeShipRandomDirectionHorizontal.length)]
                         modelLoaders.loadLargeShip(775 + avgX*50,275+avgY*50,randomOrient)
                    }
                }
            })
        })

    }
    addTableLine(x,z,rotation){
        const cube = new THREE.Mesh( game.tableLineGeo, game.tableLineMat );
        cube.position.set(x,27,z)
        cube.rotation.y = rotation
        this.scene.add( cube );
    }
 }