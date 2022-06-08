
class Game {
    constructor() {
        this.socket = io()
        this.helpforMichal = null
        this.cameraUp = false;
        this.cameraDown = false;
        this.cameraLeft = false;
        this.cameraRight = false;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
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
        this.opponentFields = []
        this.allyFields = []
        this.fieldsToChose = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
        this.fieldsToChoseObjects = []
        this.clickedMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../../textures/chosenField.png') })
        this.notClickedMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../../textures/fieldToChose.png') })
        this.cantPlaceMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../../textures/cantPlace.png') })
        this.raftsLeft = 4;
        this.smallShipsLeft = 3;
        this.mediumShipsLeft = 2;
        this.largeShipsLeft = 1;
        this.cantPlaceArray = [];
        this.cantPlaceArrayHelp = [];
        this.helpArrayForHover = [];
        this.horizontal = true;
        this.hoverMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../../textures/hoverField.png') })
        this.tableLineGeo = new THREE.BoxGeometry(500, 3, 3);
        this.tableLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.socket.on('shotAnswer', (data) => {
            data = data.find(item => {
                return item.for == sessionStorage.getItem('username')
            })
            if (data.type == 'answer') this.answerShot(data)
            else if (data.type == 'board') this.answerHit(data)
        })
        this.shipsObjects3D = []
    }
    answerShot = (data) => {
        let fieldsNextTo = []
        let field = this.opponentFields.find(item => item.x == data.cordinates.x && item.y == data.cordinates.y)
        if (data.answer == 'miss')
            field.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
        else if (data.answer == 'hit') {
            field.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/hit.png') }))
            fieldsNextTo.push(this.opponentFields.find(item => item.x == data.cordinates.x + 1 && item.y == data.cordinates.y + 1))
            fieldsNextTo.push(this.opponentFields.find(item => item.x == data.cordinates.x + 1 && item.y == data.cordinates.y - 1))
            fieldsNextTo.push(this.opponentFields.find(item => item.x == data.cordinates.x - 1 && item.y == data.cordinates.y + 1))
            fieldsNextTo.push(this.opponentFields.find(item => item.x == data.cordinates.x - 1 && item.y == data.cordinates.y - 1))
            fieldsNextTo.forEach(item => {
                if (item != null && item != undefined) {
                    item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                    item.gotShot()
                }
            })
        }
        field.gotShot()

    }

    answerHit = (data) => {
        this.fieldsToChose = data.board
        let field = this.allyFields.find(item => item.x == data.cordinates.x && item.y == data.cordinates.y)
        field.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
        field.gotShot()
    }

    setup = () => {
        let loader = new THREE.TextureLoader();
        this.scene.background = loader.load('../../textures/backgroundTest.jpg');
        let sandGeometry = new THREE.PlaneGeometry(8000, 8000, 100, 100);
        sandGeometry.rotateX(-Math.PI / 2);
        const vertex = new THREE.Vector3();
        let position = sandGeometry.attributes.position;
        for (let i = 0, l = position.count; i < l; i++) {
            vertex.fromBufferAttribute(position, i);
            vertex.x += Math.random() * 20 - 10;
            vertex.y += Math.random() * 2;
            vertex.z += Math.random() * 20 - 10;
            position.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        sandGeometry = sandGeometry.toNonIndexed();
        position = sandGeometry.attributes.position;
        const colorsFloor = [];
        const color = new THREE.Color();
        for (let i = 0; i < position.count; i++) {
            color.setHSL(Math.random() * (0.16111 - 0.1222) + 0.1222, 0.5, 0.6);
            colorsFloor.push(color.r, color.g, color.b);
        }
        sandGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
        const sandMaterial = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 50});
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        this.scene.add(sand);
        const waterGeometry = new THREE.PlaneGeometry(7000, 7000, 100, 100);
        waterGeometry.rotateX(Math.PI / 2);
        const waterMaterial = new THREE.MeshPhongMaterial ({ color: 0x46b9e3, side: THREE.DoubleSide, transparent: true, opacity: 0.6, shininess: 50 });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.receiveShadow = true;
        water.position.y = 30
        this.scene.add(water);
        // const light = new THREE.AmbientLight(0xffffff, 2);
        // this.scene.add(light);
        this.angle = 0
        this.loadSunlight()
    }
    loadWaitingScreen() {
        const color = 0xefece7;  // white
        const near = 50;
        const far = 2050;
        this.scene.fog = new THREE.Fog(color, near, far);

        ui.switchDisplayById("wait", "block")
        this.waitForOpponent = true;
        modelLoaders.loadSmallShipIdle(140, 30, 170, Math.PI - 0.5)
        modelLoaders.loadSmallShipIdle(-60, 30, 170, Math.PI / 2)
        modelLoaders.loadSmallShipIdle(-120, 30, -180, Math.PI)
        modelLoaders.loadLargeShipIdle(80, 40, -250, Math.PI + 0.5)
        modelLoaders.loadLargeShipIdle(-380, 40, -420, Math.PI + 0.5)
        modelLoaders.loadLargeShipIdle(-620, 40, -720, Math.PI + 0.5)
        modelLoaders.loadSmallShipIdle(-220, 30, -180, Math.PI)
        modelLoaders.loadMediumShipIdle(-500, 30, 20, Math.PI)
        modelLoaders.loadMediumShipIdle(500, 30, 20, Math.PI)
        modelLoaders.loadMediumShipIdle(170, 30, 20, Math.PI)
        modelLoaders.loadMediumShipIdle(250, 30, 320, Math.PI + 0.3)
        modelLoaders.loadMediumShipIdle(650, 30, -820, 0)
        modelLoaders.loadIsland()
        // var audio = new Audio('../../sound/soundtrack/waiting theme.mp3');
        // audio.play();
     
    }
    pickShips() {
        animations.cameraToChoose(this.camera)
        ui.switchDisplayById("wait", "none")
        ui.switchDisplayById("ready", "block")
        this.waitForOpponent = false;
    }

    generateFieldsToChose() {
        this.camera.lookAt(this.camera.position.x, 0, this.camera.position.z)
        let shift = 2000;
        let fieldId = 0;
        this.fieldsToChose.map((array, i) => {
            array.map((item, j) => {
                const geometry = new THREE.BoxGeometry(25, 1, 25);
                const material = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    map: new THREE.TextureLoader().load('../../textures/fieldToChose.png'),
                    transparent: true,
                    opacity: 1,
                })
                const cube = new THREE.Mesh(geometry, material);
                cube.name = "select"
                cube.x = i
                cube.y = j
                cube.fieldId = fieldId
                fieldId += 1;
                cube.hasShip = false;
                cube.canPutShip = true;
                cube.checked = false;
                cube.position.set(shift + (i * 25) - (25 * this.fieldsToChose.length) / 2, 30, (j * 25) - (25 * this.fieldsToChose.length) / 2)
                this.scene.add(cube);
                this.fieldsToChoseObjects.push(cube)
            })
        })
    }
    render = () => {
        if (this.cameraLeft) {
            this.camera.position.x += 7
        }
        if (this.cameraRight) {
            this.camera.position.x -= 7
        }
        if (this.cameraUp && this.camera.position.y > 255) {
            this.camera.position.y -= 2;
            this.camera.lookAt(this.camera.position.x, 0, 500);
        }
        if (this.cameraDown && this.camera.position.y < 600) {
            this.camera.position.y += 2;
            this.camera.lookAt(this.camera.position.x, 0, 500);
        }
        if (this.waitForOpponent) {
            this.camera.position.z = 600 * Math.cos(this.angle);
            this.camera.position.x = 600 * Math.sin(this.angle);
            this.camera.lookAt(0, 150, 0)
            this.angle += 0.005
        }
        requestAnimationFrame(this.render);
        TWEEN.update();
        this.renderer.render(this.scene, this.camera);
    }
    gatherInfoAboutShips() {
        this.fieldsToChoseObjects.map((element, i) => {
            if (element.hasShip) {
                this.fieldsToChose[element.y][element.x] = parseInt(element.shipType)
            }
        })
        let temp = this.fieldsToChose
        console.log(temp)
        // this.fieldsToChose.map(arr=>{
        //     arr.reverse()
        // })
        // console.log(this.fieldsToChose)
        animations.cameraToGameplay(this.camera)
        
    }
    generateGameplayModels() {
        const color = 0xefece7;  // white
        const near = 50;
        const far = 2000;
        this.scene.fog = new THREE.Fog(color, near, far);


        this.camera.lookAt(1000, 0, 500)
        console.log("renderek bedzie")
        ui.switchDisplayById("shipTypeButtons", "none")
        ui.switchDisplayById("ready", "none")
        ui.switchDisplayById("rotateInfo", "none")
        let xs = [1250, 1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
        let zs = [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750]
        let rotations = [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        xs.map((e, i) => {
            this.addTableLine(xs[i], zs[i], rotations[i])
        })

        this.generateOpponentsBoard(xs, zs)

        //GENEROWANIE MODELI STATKOW NA PODSTAWIE TABELI WYBRANYCH PÓL

        let raftRandomDirection = [Math.PI, -Math.PI, Math.PI / 2]
        let smallShipRandomDirectionHorizontal = [Math.PI / 2, -Math.PI / 2]
        let smallShipRandomDirectionVertical = [0, Math.PI]
        let mediumShipRandomDirectionHorizontal = [Math.PI / 2, -Math.PI / 2]
        let mediumShipRandomDirectionVertical = [Math.PI, 0]

        let largeShipRandomDirectionHorizontal = [Math.PI / 2, -Math.PI / 2]
        let largeShipRandomDirectionVertical = [Math.PI, 0]
        let smallShipsHelpArray = []
        let mediumShipsHelpArray = []
        let largeShipsHelpArray = []
        this.fieldsToChose.map((line, y) => {
            line.map((item, x) => {
                if (item == 1) {
                    let raft = new Ship("raft",1225 - x * 50,725 - y * 50,raftRandomDirection[Math.floor(Math.random() * raftRandomDirection.length)],[x],[y])
                    this.scene.add(raft.getObj())
                    this.shipsObjects3D.push(raft)
                    console.log(this.shipsObjects3D)
                    // modelLoaders.loadRaft(1225 - x * 50, 725 - y * 50, raftRandomDirection[Math.floor(Math.random() * raftRandomDirection.length)])
                } else if (item == 2) {
                    let xs = [-1, 0, 0, 1]
                    let ys = [0, -1, 1, 0]
                    if (smallShipsHelpArray.filter((element) => { return element.x == x && element.y == y }).length == 0) {
                        xs.map((element, i) => {
                            if (this.fieldsToChose[y + ys[i]] != undefined) {
                                if (this.fieldsToChose[y + ys[i]][x + xs[i]] != undefined) {
                                    if (this.fieldsToChose[y + ys[i]][x + xs[i]] == 2) {
                                        smallShipsHelpArray.push({ x: x + xs[i], y: y + ys[i] })
                                        let randomOrient;
                                        y + ys[i] == y ? randomOrient = smallShipRandomDirectionHorizontal[Math.floor(Math.random() * smallShipRandomDirectionHorizontal.length)] : randomOrient = smallShipRandomDirectionVertical[Math.floor(Math.random() * smallShipRandomDirectionVertical.length)]
                                        // modelLoaders.loadSmallShip(1225 - ((x + x + xs[i]) / 2) * 50, 725 - ((y + y + ys[i]) / 2) * 50, randomOrient)
                                        let smallShipObject = new Ship("smallShip",1225 - ((x + x + xs[i]) / 2) * 50,725 - ((y + y + ys[i]) / 2) * 50,randomOrient,[x,x + xs[i]],[y,y + ys[i]]) 
                                        this.scene.add(smallShipObject.getObj())
                                        this.shipsObjects3D.push(smallShipObject)
                                        console.log(this.shipsObjects3D);
                                    }
                                }
                            }
                        })
                    }
                } else if (item == 3 || item==9) {
                    let xs = [-2, -1, 0, 0, 0, 0, 1, 2]
                    let ys = [0, 0, -2, -1, 1, 2, 0, 0]
                    let tabOfX = [], tabOfY = [];
                    if (mediumShipsHelpArray.filter((element) => { return element.x == x && element.y == y }).length == 0) {
                        tabOfX.push(x)
                        tabOfY.push(y)
                        xs.map((element, i) => {
                            if (this.fieldsToChose[y + ys[i]] != undefined) {
                                if (this.fieldsToChose[y + ys[i]][x + xs[i]] != undefined) {
                                    if (this.fieldsToChose[y + ys[i]][x + xs[i]] == item) {
                                        mediumShipsHelpArray.push({ x: x + xs[i], y: y + ys[i] })
                                        tabOfX.push(x + xs[i])
                                        tabOfY.push(y + ys[i])
                                    }
                                }
                            }
                        })
                        let randomOrient = 0;
                        let middleElementX = tabOfX.sort()[1]
                        let middleElementY = tabOfY.sort()[1]
                        tabOfY[0] != tabOfY[1] ? randomOrient = mediumShipRandomDirectionVertical[Math.floor(Math.random() * mediumShipRandomDirectionVertical.length)] : randomOrient = mediumShipRandomDirectionHorizontal[Math.floor(Math.random() * mediumShipRandomDirectionHorizontal.length)]
                        // modelLoaders.loadMediumShip(1225 - middleElementX * 50, 725 - middleElementY * 50, randomOrient)
                        let mediumShipObject = new Ship("mediumShip",1225 - middleElementX * 50, 725 - middleElementY * 50,randomOrient,tabOfX,tabOfY)
                        this.scene.add(mediumShipObject.getObj())
                        this.shipsObjects3D.push(mediumShipObject)
                        console.log(this.shipsObjects3D);
                    }
                } else if (item == 4) {
                    let xs = [-3, -2, -1, 0, 0, 0, 0, 0, 0, 1, 2, 3]
                    let ys = [0, 0, 0, -3, -2, -1, 1, 2, 3, 0, 0, 0,]
                    let sumOfX = 0, sumOfY = 0;
                    let tabOfX = [], tabOfY = [];
                    if (largeShipsHelpArray.filter((element) => { return element.x == x && element.y == y }).length == 0) {
                        sumOfX += x;
                        sumOfY += y;
                        xs.map((element, i) => {
                            if (this.fieldsToChose[y + ys[i]] != undefined) {
                                if (this.fieldsToChose[y + ys[i]][x + xs[i]] != undefined) {
                                    if (this.fieldsToChose[y + ys[i]][x + xs[i]] == 4) {
                                        largeShipsHelpArray.push({ x: x + xs[i], y: y + ys[i] })
                                        sumOfX += x + xs[i]
                                        sumOfY += y + ys[i]
                                        tabOfX.push(x + xs[i])
                                        tabOfY.push(y + ys[i])
                                    }
                                }
                            } 0
                        })
                        let randomOrient = 0;
                        let avgX = sumOfX / 4
                        let avgY = sumOfY / 4
                        console.log(avgX)
                        console.log(avgY)
                        avgY != y ? randomOrient = largeShipRandomDirectionVertical[Math.floor(Math.random() * largeShipRandomDirectionVertical.length)] : randomOrient = largeShipRandomDirectionHorizontal[Math.floor(Math.random() * largeShipRandomDirectionHorizontal.length)]
                        // modelLoaders.loadLargeShip(1225 -avgX * 50, 725 - avgY * 50, randomOrient)
                        let largeShipObject = new Ship("largeShip",1225 - avgX * 50, 725 - avgY * 50,randomOrient,tabOfX,tabOfY)
                        this.scene.add(largeShipObject.getObj())
                        this.shipsObjects3D.push(largeShipObject)
                        console.log(this.shipsObjects3D);
                    }
                }
            })
        })

    }
    generateOpponentsBoard = (xs, zs) => {
        let xs2 = xs.map(item => item - 700)
        let rotations2 = [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        xs2.map((e, i) => {
            this.addTableLine(xs2[i], zs[i], rotations2[i])
        })
        //invisible meshes
        let geometry = new THREE.BoxGeometry(50, 4, 50);
        let material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        //opponent's Board
        for (let i = 0; i < 10; i++)
            for (let j = 0; j < 10; j++) {
                let field = new InvisibleField(geometry, material, i, j, 'invisibleFieldOpp')
                field.position.set(525 - i * 50, 27, 725 - j * 50)
                this.scene.add(field)
                this.opponentFields.push(field)
            }
        //ourBoard
        for (let i = 0; i < 10; i++)
            for (let j = 0; j < 10; j++) {
                let field = new InvisibleField(geometry, material, i, j, 'invisibleFieldAlly')
                field.position.set(1225 - i * 50, 27, 725 - j * 50)
                this.scene.add(field)
                this.allyFields.push(field)
            }
    }
    addTableLine(x, z, rotation) {
        const cube = new THREE.Mesh(game.tableLineGeo, game.tableLineMat);
        cube.position.set(x, 27, z)
        cube.rotation.y = rotation
        this.scene.add(cube);
    }
    loadSunlight(){
        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xc46c08, 0.6 );
        // hemiLight.color.setHSL( 0.6, 0.75, 0.5 );
        hemiLight.groundColor.setHSL( 0.095, 0.5, 0.5 );
        hemiLight.position.set( 1000, 500, 500 );
        hemiLight.intensity = 1
        this.scene.add( hemiLight );
        var dirLight = new THREE.DirectionalLight( 0xc46c08, 1);
        dirLight.position.set( 950, 350, 500 );
        dirLight.position.multiplyScalar( 150);
        this.scene.add( dirLight );
        dirLight.castShadow = true;
        let d = 1000;
        let r = 2;
        let mapSize = 8192;
        dirLight.castShadow = true;
        dirLight.shadow.radius = r;
        dirLight.shadow.mapSize.width = mapSize;
        dirLight.shadow.mapSize.height = mapSize;
        dirLight.shadow.camera.top = dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.bottom = dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 400000000;
    }
    sinkAll(){
        this.shipsObjects3D.map(element=>{
            sleep(100)
            element.idleShipAnimation()
        })
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }