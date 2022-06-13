
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
        this.gameEnded = false;
        this.helpArrayForHover = [];
        this.horizontal = true;
        this.ready = false;
        this.hoverMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('../../textures/hoverField.png') })
        this.tableLineGeo = new THREE.BoxGeometry(500, 3, 3);
        this.tableLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.socket.on('shotAnswer', async (data) => {
            data = data.find(item => {
                return item.for == sessionStorage.getItem('username')
            })
            if (data.type == 'answer') this.answerShot(data)
            else if (data.type == 'board') this.answerHit(data)
        })
        this.socket.on('gameStart', (data) => {
            (data.turn == sessionStorage.getItem('username') || data.turn.username == sessionStorage.getItem('username')) ? this.yourTurn = true : this.yourTurn = false
            animations.cameraToGameplay(this.camera)
            this.deleteAfterWait.parent.remove(this.deleteAfterWait)
            ui.switchDisplayById('wait', 'none')
            if (this.yourTurn) animations.cameraToOpponent()
            console.log("START")

            this.waitForOpponent = false;
            let turnInfo = document.getElementById('turn')
            if (this.yourTurn) {
                turnInfo.textContent = 'Your turn!'
                turnInfo.style.color = 'rgb(255, 189, 114)'
            } else {
                turnInfo.textContent = "Opponent's turn!"
                turnInfo.style.color = '#ff584d'
            }
            let k = 0
            let interv = setInterval(() => {
                turnInfo.style.opacity = k * 0.05
                k++
                if (k == 21) {
                    clearInterval(interv)
                }
            }, 40)

            //HIDE LOADING SCREEN, LOAD BOARD & MODELS  
        })
        this.socket.on('gameEnd', async (data) => {
            await new Promise(r => setTimeout(r, 3500));
            if (data.winner == sessionStorage.getItem('username')) this.win()
            else this.lose()
        })
        this.idleShips = []
        this.deleteAfterWait = new THREE.Object3D()
        this.socket.emit('getDatabaseContent', {})
        this.socket.on('databasedata', (data) => {
            console.log(data)
            this.idleShips = data.idleShips;
            this.myBoard = data.myBoard
        })
        this.shipsObjects3D = [];
        this.objectToExplode;
        this.explode = false;
        this.yourTurn = null;
        this.loadedModels = 0;
    }
    win = () => {
        ui.switchDisplayById('winner', 'block')
        ui.switchDisplayById('root', 'none')
        ui.switchDisplayById('turn', 'none')
        this.gameEnded = true;
    }
    lose = () => {
        this.gameEnded = true;
        ui.switchDisplayById('loser', 'block')
        ui.switchDisplayById('root', 'none')
        ui.switchDisplayById('turn', 'none')
    }
    answerShot = async (data) => {
        let field = this.opponentFields.find(item => item.x == data.cordinates.x && item.y == data.cordinates.y)
        if (data.answer == 'miss') {
            field.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
            this.popUp('Miss!')
        }
        else if (data.answer == 'hit') {
            (data.destroyed) ? this.popUp('Sunk!') : this.popUp('Hit!')
            field.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/hit.png') }))
        }
        field.gotShot()
        await new Promise(r => setTimeout(r, 250));
        data.answer == 'miss' ? animations.cannonBall(field.position.x, field.position.z, 0, 0.88, 0.47, field) : animations.cannonBall(field.position.x, field.position.z, 0.288, 0.88, 0.47, field)
        let turn = data.rotation
        console.log(data.ship)
        if (data.destroyed) {
            let x = data.cordinates.x
            let y = data.cordinates.y
            let bugfix = data.bugfix

            if (data.ship == 1) {
                this.opponentFields.forEach(item => {
                    if (Math.abs(item.x - x) < 2 && Math.abs(item.y - y) < 2
                        && !(item.x == x && item.y == y)) {
                        item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                        item.gotShot()
                    }
                })
            } else if (data.ship == 2) {
                this.opponentFields.forEach(item => {
                    if (turn.includes('x')) {
                        if ((Math.abs(item.x - x) < 2 || (turn == '-x' && Math.abs(item.x - (x - 1)) < 2) || (turn == 'x' && Math.abs(item.x - (x + 1)) < 2)) && (Math.abs(item.y - y) < 2)) {
                            item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                            item.gotShot()
                        }
                    } else if (turn.includes('y')) {
                        if ((Math.abs(item.y - y) < 2 || (turn == '-y' && Math.abs(item.y - (y - 1)) < 2) || (turn == 'y' && Math.abs(item.y - (y + 1)) < 2)) && (Math.abs(item.x - x) < 2)) {
                            item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                            item.gotShot()
                        }
                    }
                })
            }
            else if (data.ship == 3 || data.ship == 9) {
                this.opponentFields.forEach(item => {
                    if (turn.includes('x')) {
                        if ((Math.abs(item.x - x) < 2 || (bugfix[y][x - 1] != undefined && (bugfix[y][x - 1].toString().includes('3') || bugfix[y][x - 1].toString().includes('9')) && Math.abs(item.x - (x - 1)) < 2) ||
                            (bugfix[y][x - 2] != undefined && (bugfix[y][x - 2].toString().includes('3') || bugfix[y][x - 2].toString().includes('9')) && Math.abs(item.x - (x - 2)) < 2) ||
                            (bugfix[y][x + 1] != undefined && (bugfix[y][x + 1].toString().includes('3') || bugfix[y][x + 2].toString().includes('9')) && Math.abs(item.x - (x + 1)) < 2) ||
                            (bugfix[y][x + 2] != undefined && (bugfix[y][x + 2].toString().includes('3') || bugfix[y][x + 2].toString().includes('9')) && Math.abs(item.x - (x + 2)) < 2)) && Math.abs(item.y - y) < 2) {
                            item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                            item.gotShot()
                        }
                    }
                    if (turn.includes('y')) {
                        if ((Math.abs(item.y - y) < 2 || (bugfix[y - 1][x] != undefined && (bugfix[y - 1][x].toString().includes('3') || bugfix[y - 1][x].toString().includes('9')) && Math.abs(item.y - (y - 1)) < 2) ||
                            (bugfix[y - 2] != undefined && (bugfix[y - 2][x].toString().includes('3') || bugfix[y - 2][x].toString().includes('9')) && Math.abs(item.y - (y - 2)) < 2) ||
                            (bugfix[y + 1] != undefined && (bugfix[y + 1][x].toString().includes('3') || bugfix[y + 1][x].toString().includes('9')) && Math.abs(item.y - (y + 1)) < 2) ||
                            (bugfix[y + 2] != undefined && (bugfix[y + 2][x].toString().includes('3') || bugfix[y + 2][x].toString().includes('9')) && Math.abs(item.y - (y + 2)) < 2)) && Math.abs(item.x - x) < 2) {
                            item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                            item.gotShot()
                        }
                    }
                })
            } else if (data.ship == 4) {
                this.opponentFields.forEach(item => {
                    if (turn.includes('x')) {
                        if ((Math.abs(item.x - x) < 2 || (bugfix[y][x - 1] != undefined && (bugfix[y][x - 1].toString().includes('4')) && Math.abs(item.x - (x - 1)) < 2) ||
                            (bugfix[y][x - 2] != undefined && (bugfix[y][x - 2].toString().includes('4')) && Math.abs(item.x - (x - 2)) < 2) ||
                            (bugfix[y][x + 1] != undefined && (bugfix[y][x + 1].toString().includes('4')) && Math.abs(item.x - (x + 1)) < 2) ||
                            (bugfix[y][x + 2] != undefined && (bugfix[y][x + 2].toString().includes('4')) && Math.abs(item.x - (x + 2)) < 2) ||
                            (bugfix[y][x + 3] != undefined && (bugfix[y][x + 3].toString().includes('4')) && Math.abs(item.x - (x + 3)) < 2) ||
                            (bugfix[y][x - 3] != undefined && (bugfix[y][x - 3].toString().includes('4')) && Math.abs(item.x - (x - 3)) < 2)) && Math.abs(item.y - y) < 2) {
                            item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                            item.gotShot()
                        }
                    }
                    if (turn.includes('y')) {
                        if ((Math.abs(item.y - y) < 2 || (bugfix[y - 1][x] != undefined && (bugfix[y - 1][x].toString().includes('4')) && Math.abs(item.y - (y - 1)) < 2) ||
                            (bugfix[y - 2] != undefined && (bugfix[y - 2][x].toString().includes('4')) && Math.abs(item.y - (y - 2)) < 2) ||
                            (bugfix[y + 1] != undefined && (bugfix[y + 1][x].toString().includes('4')) && Math.abs(item.y - (y + 1)) < 2) ||
                            (bugfix[y + 2] != undefined && (bugfix[y + 2][x].toString().includes('4')) && Math.abs(item.y - (y + 2)) < 2) ||
                            (bugfix[y + 3] != undefined && (bugfix[y + 3][x].toString().includes('4')) && Math.abs(item.y - (y + 3)) < 2) ||
                            (bugfix[y - 3] != undefined && (bugfix[y - 3][x].toString().includes('4')) && Math.abs(item.y - (y - 3)) < 2)) && Math.abs(item.x - x) < 2) {
                            item.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
                            item.gotShot()
                        }
                    }
                })
            }
        }
    }



    changeTurn = async () => {
        let turnInfo = document.getElementById('turn')
        this.yourTurn = !this.yourTurn
        await new Promise(r => setTimeout(r, 4000));
        let k = 0
        turnInfo.style.opacity = 1
        let interv = setInterval(() => {
            turnInfo.style.opacity = 1 - ((k) * 0.05)
            k++
            if (k == 21) {
                clearInterval(interv)
            }
        }, 40)
        if (this.yourTurn) animations.cameraToOpponent()
        else animations.cameraToGameplaySlow()
        await new Promise(r => setTimeout(r, 750));
        if (this.yourTurn) {
            turnInfo.textContent = 'Your turn!'
            turnInfo.style.color = 'rgb(255, 189, 114)'
        } else {
            turnInfo.textContent = "Opponent's turn!"
            turnInfo.style.color = '#ff584d'
        }
        let z = 0
        turnInfo.style.opacity = 0
        let interv2 = setInterval(() => {
            turnInfo.style.opacity = z * 0.05
            z++
            if (z == 21) {
                clearInterval(interv2)
            }
        }, 40)
    }


    answerHit = async (data) => {
        this.changeTurn()
        console.log(data)
        this.fieldsToChose = data.board
        let field = this.allyFields.find(item => item.x == data.cordinates.x && item.y == data.cordinates.y)
        data.answer == "hit" ? field.changeMaterial(new THREE.MeshBasicMaterial({ color: "#ff1929", transparent: true, opacity: 0.8 })) : field.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/cantPlaceTransparent.png') }))
        field.gotShot()
        data.answer == "hit" ? animations.cannonBall(field.position.x, field.position.z, 0.0555, 0.6, 0.29, field, data.destroyed) : animations.cannonBall(field.position.x, field.position.z, 0.316, 0.53, 0.73, field, data.destroyed)
    }

    popUp = async (msg) => {
        await new Promise(r => setTimeout(r, 500));
        let popUp = document.getElementById('popUp')
        popUp.textContent = msg
        if (msg == 'Hit!') popUp.style.color = '#07940c'
        else if (msg == 'Miss!') popUp.style.color = '#ff143c'
        else if (msg == 'Sunk!') popUp.style.color = '#faff66'
        let k = 0
        let interv = setInterval(() => {
            popUp.style.opacity = (k) * 0.04
            k++
            if (k == 21) {
                this.clearUp()
                clearInterval(interv)
            }
        }, 40)
    }

    clearUp = async () => {
        await new Promise(r => setTimeout(r, 1500));
        let k = 0
        let interv = setInterval(() => {
            popUp.style.opacity = 0.8 - ((k) * 0.04)
            k++
            if (k == 21) {
                let popUp = document.getElementById('popUp')
                popUp.textContent = ''
                clearInterval(interv)
            }
        }, 40)

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
        const sandMaterial = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 50 });
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        this.scene.add(sand);
        const waterGeometry = new THREE.PlaneGeometry(7000, 7000, 100, 100);
        waterGeometry.rotateX(Math.PI / 2);
        const waterMaterial = new THREE.MeshPhongMaterial({ color: 0x46b9e3, side: THREE.DoubleSide, transparent: true, opacity: 0.6, shininess: 50 });
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
        let loadingManager = new THREE.LoadingManager();
        ui.switchDisplayById('loadingScreen', 'flex')
        this.idleShips.map(item => {
            switch (item.type) {
                case "small":
                    modelLoaders.loadSmallShipIdle(item.x, item.y, item.z, item.rotation, loadingManager)
                    break;
                case "medium":
                    modelLoaders.loadMediumShipIdle(item.x, item.y, item.z, item.rotation, loadingManager)
                    break;
                case "large":
                    modelLoaders.loadLargeShipIdle(item.x, item.y, item.z, item.rotation, loadingManager)
                    break;
                default:
                    break;
            }
        })
        ui.switchDisplayById("wait", "block")
        ui.switchDisplayById("shipTypeButtons", "none")
        ui.switchDisplayById("rotateInfo", "none")
        ui.switchDisplayById("ready", "none")
        this.waitForOpponent = true;
        modelLoaders.loadIsland(loadingManager)
        this.scene.add(this.deleteAfterWait)
        loadingManager.onLoad = () => {
            ui.switchDisplayById('loadingScreen', 'none')
        }
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
        if (this.explode) {
            uniforms.amplitude.value += 1.0;
            if (uniforms.amplitude.value == 50) {
                this.explode = false;
                sleep(100)
                this.objectToExplode.parent.remove(this.objectToExplode)
                this.objectToExplode = null;
                uniforms.amplitude.value = 0;
            }
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

    }
    generateGameplayModels() {
        ui.switchDisplayById('loadingScreen', 'flex')
        const color = 0xefece7;  // white
        const near = 50;
        const far = 2000;
        this.scene.fog = new THREE.Fog(color, near, far);
        this.camera.lookAt(1000, 0, 500)
        ui.switchDisplayById("shipTypeButtons", "none")
        ui.switchDisplayById("ready", "none")
        ui.switchDisplayById("rotateInfo", "none")
        let xs = this.myBoard.x;
        let zs = this.myBoard.z;
        let rotations = this.myBoard.rotations
        xs.map((e, i) => {
            this.addTableLine(xs[i], zs[i], rotations[i])
        })
        this.generateOpponentsBoard(xs, zs)
        //GENEROWANIE MODELI STATKOW NA PODSTAWIE TABELI WYBRANYCH PÓL
        console.log("GENEROWANIE STATKOW")
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
                    let raft = new Ship("raft", 1225 - x * 50, 725 - y * 50, raftRandomDirection[Math.floor(Math.random() * raftRandomDirection.length)], [x], [y])
                    this.scene.add(raft.getObj())
                    this.shipsObjects3D.push(raft)
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
                                        let smallShipObject = new Ship("smallShip", 1225 - ((x + x + xs[i]) / 2) * 50, 725 - ((y + y + ys[i]) / 2) * 50, randomOrient, [x, x + xs[i]], [y, y + ys[i]])
                                        this.scene.add(smallShipObject.getObj())
                                        this.shipsObjects3D.push(smallShipObject)
                                    }
                                }
                            }
                        })
                    }
                } else if (item == 3 || item == 9) {
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
                        let mediumShipObject = new Ship("mediumShip", 1225 - middleElementX * 50, 725 - middleElementY * 50, randomOrient, tabOfX, tabOfY)
                        this.scene.add(mediumShipObject.getObj())
                        this.shipsObjects3D.push(mediumShipObject)
                    }
                } else if (item == 4) {
                    let xs = [-3, -2, -1, 0, 0, 0, 0, 0, 0, 1, 2, 3]
                    let ys = [0, 0, 0, -3, -2, -1, 1, 2, 3, 0, 0, 0,]
                    let sumOfX = 0, sumOfY = 0;
                    let tabOfX = [], tabOfY = [];
                    if (largeShipsHelpArray.filter((element) => { return element.x == x && element.y == y }).length == 0) {
                        sumOfX += x;
                        sumOfY += y;
                        tabOfX.push(x)
                        tabOfY.push(y)
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
                        avgY != y ? randomOrient = largeShipRandomDirectionVertical[Math.floor(Math.random() * largeShipRandomDirectionVertical.length)] : randomOrient = largeShipRandomDirectionHorizontal[Math.floor(Math.random() * largeShipRandomDirectionHorizontal.length)]
                        // modelLoaders.loadLargeShip(1225 -avgX * 50, 725 - avgY * 50, randomOrient)
                        let largeShipObject = new Ship("largeShip", 1225 - avgX * 50, 725 - avgY * 50, randomOrient, tabOfX, tabOfY)
                        this.scene.add(largeShipObject.getObj())
                        this.shipsObjects3D.push(largeShipObject)
                    }
                }
            })
        })

    }
    generateOpponentsBoard = (xs, zs) => {
        let xs2 = xs.map(item => item - 1900)
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
                field.position.set(-675 - i * 50, 27, 725 - j * 50)
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
    loadSunlight() {
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xc46c08, 0.6);
        // hemiLight.color.setHSL( 0.6, 0.75, 0.5 );
        hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
        hemiLight.position.set(1000, 500, 500);
        hemiLight.intensity = 1
        this.scene.add(hemiLight);
        var dirLight = new THREE.DirectionalLight(0xc46c08, 1);
        dirLight.position.set(950, 350, 500);
        dirLight.position.multiplyScalar(150);
        this.scene.add(dirLight);
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
    sinkAll() {
        this.shipsObjects3D.map(element => {
            sleep(100)
            element.idleShipAnimation()
        })
    }
}
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}