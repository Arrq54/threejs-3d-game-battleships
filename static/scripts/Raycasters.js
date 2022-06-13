window.addEventListener("mousedown", (e) => {
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2()
    mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVector, game.camera);
    const intersects = raycaster.intersectObjects(game.scene.children);
    intersects.forEach(item => {
        if (item.object.name == "invisibleField")
            console.log(item.object.x + item.object.y)
    })
    if (!game.gameEnded) {
        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            // console.log(clickedObject)
            if (clickedObject.name == "select") {
                let clicked = game.fieldsToChoseObjects.find((element) => { return element.fieldId == clickedObject.fieldId })
                let removed = false;
                if (clicked.hasShip) {
                    //ODKYRWANIE
                    clickedObject.checked ? clicked.material = game.notClickedMat : clicked.material = game.clickedMat
                    clicked.checked = !clicked.checked;
                    clicked.hasShip = false;
                    if (clicked.shipType == "1") {
                        game.raftsLeft += 1;
                        ui.updateRaftsLeft()
                        let blockedFieldsArray = game.cantPlaceArray.find((element) => { return element.fieldId == clicked.fieldId })
                        blockedFieldsArray.fields.map((element) => {
                            help = game.cantPlaceArrayHelp.filter((item, index) => { return item.x == element.x && item.y == element.y })
                            if (help.length == 1) {
                                element.material = game.notClickedMat
                                element.canPutShip = true;
                            }
                            let stay = help[0]
                            game.cantPlaceArrayHelp = game.cantPlaceArrayHelp.filter((item, index) => { return item.fieldId != help[0].fieldId })
                            for (let h = 0; h < help.length - 1; h++) {
                                game.cantPlaceArrayHelp.push(stay)
                            }
                        })
                        game.cantPlaceArray = game.cantPlaceArray.filter((element) => { return element.fieldId != clicked.fieldId })
                        clickedObject.checked ? clicked.material = game.notClickedMat : clicked.material = game.clickedMat
                        clicked.checked = false
                    } else if (clicked.shipType == "2") {
                        game.smallShipsLeft += 1;
                        ui.updateRaftsLeft()
                        clicked.material = game.notClickedMat
                        clicked.checked = false
                        clicked.hasShip = false;
                        clicked.otherBlock.hasShip = false;
                        clicked.otherBlock.material = game.notClickedMat
                        clicked.otherBlock.checked = false
                        let temp = game.cantPlaceArray.find((element) => { return element.fieldId == clicked.fieldId })
                        let fromOther = false;
                        if (temp == undefined) {
                            temp = game.cantPlaceArray.find((element) => { return element.fieldId == clicked.otherBlock.fieldId })
                            fromOther = true;
                        }
                        temp.fields.map((element) => {
                            help = game.cantPlaceArrayHelp.filter((item, index) => { return item.x == element.x && item.y == element.y })
                            if (help.length == 1) {
                                element.material = game.notClickedMat
                                element.canPutShip = true;
                            }
                            let stay = help[0]
                            game.cantPlaceArrayHelp = game.cantPlaceArrayHelp.filter((item, index) => { return item.fieldId != help[0].fieldId })
                            for (let h = 0; h < help.length - 1; h++) {
                                game.cantPlaceArrayHelp.push(stay)
                            }
                        })
                        if (fromOther) {
                            game.cantPlaceArray = game.cantPlaceArray.filter((element) => { return element.fieldId != clicked.otherBlock.fieldId })
                        } else {
                            game.cantPlaceArray = game.cantPlaceArray.filter((element) => { return element.fieldId != clicked.fieldId })
                        }

                    }
                    else if (clicked.shipType == "3" || clicked.shipType == "4" || clicked.shipType == "9") {
                        (clicked.shipType == "3" || clicked.shipType == "9") ? game.mediumShipsLeft += 1 : game.largeShipsLeft += 1;

                        ui.updateRaftsLeft()
                        clicked.material = game.notClickedMat
                        clicked.checked = false
                        clicked.hasShip = false;
                        let temp = game.cantPlaceArray.find((item) => { return item.fieldId == clicked.fieldId })
                        let idtoDo = clicked.fieldId;
                        clicked.otherBlocks.map((element) => {
                            element.hasShip = false;
                            element.material = game.notClickedMat;
                            element.checked = false;
                            if (temp == undefined) {
                                temp = game.cantPlaceArray.find((item) => { return item.fieldId == element.fieldId })
                                idtoDo = element.fieldId
                            }
                        })
                        temp.fields.map((element) => {
                            help = game.cantPlaceArrayHelp.filter((item, index) => { return item.x == element.x && item.y == element.y })
                            if (help.length == 1) {
                                element.material = game.notClickedMat
                                element.canPutShip = true;
                            }
                            let stay = help[0]
                            game.cantPlaceArrayHelp = game.cantPlaceArrayHelp.filter((item, index) => { return item.fieldId != help[0].fieldId })
                            for (let h = 0; h < help.length - 1; h++) {
                                game.cantPlaceArrayHelp.push(stay)
                            }
                        })
                        game.cantPlaceArray = game.cantPlaceArray.filter((element) => { return element.fieldId != idtoDo })
                    }
                    removed = true;
                    let bugFix = game.fieldsToChoseObjects.filter((element) => { return element.hasShip == false && element.material == game.clickedMat })
                    bugFix.map((element) => { element.material = game.notClickedMat })
                }
                if (!removed) {
                    if (game.typeOfChosingShip == 1 && !clicked.checked && clicked.canPutShip && clicked.material != game.clickedMat) {
                        //WYBIERANIE STATKU - JEDYNKA
                        if (game.raftsLeft != 0) {
                            game.raftsLeft -= 1;
                            clicked.hasShip = true;
                            clicked.shipType = "1"
                            ui.updateRaftsLeft()
                            game.helpArrayForHover = []
                            let xs = [-1, -1, -1, 0, 0, 1, 1, 1]
                            let ys = [-1, 0, 1, -1, 1, -1, 0, 1]
                            let temp = []
                            xs.map((v, i) => {
                                obj = game.fieldsToChoseObjects.find((element) => { return (element.x == clicked.x + xs[i] && element.y == clicked.y + ys[i]) })
                                if (obj != undefined) {
                                    obj.material = game.cantPlaceMat
                                    obj.canPutShip = false;
                                    game.cantPlaceArrayHelp.push(obj)
                                    temp.push(obj)
                                }
                            })
                            game.cantPlaceArray.push({ fieldId: clicked.fieldId, fields: temp })
                            clicked.material = game.clickedMat
                            clicked.checked = true;
                        }
                    } else if (game.typeOfChosingShip == 2 && !clicked.checked && clicked.canPutShip && clicked.material != game.clickedMat && clicked.hasShip == false) {
                        //WYBIERANIE STATKU - DWÓJKA
                        let field1;
                        game.horizontal ? field1 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 1 && element.y == clickedObject.y }) : field1 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 1 })
                        if (field1) {
                            if (field1.canPutShip && !field1.hasShip) {
                                if (game.smallShipsLeft != 0) {
                                    game.smallShipsLeft -= 1;
                                    clicked.hasShip = true;
                                    ui.updateRaftsLeft()
                                    game.helpArrayForHover = []
                                    clicked.shipType = "2"
                                    let xs, ys;
                                    if (game.horizontal) {
                                        xs = [-1, -1, -1, 0, 0, 1, 1, 2, 2, 2]
                                        ys = [-1, 0, 1, -1, 1, -1, 1, -1, 0, 1]
                                    } else {
                                        xs = [-1, 0, 1, -1, 1, -1, 1, -1, 0, 1]
                                        ys = [1, 1, 1, 0, 0, -1, -1, -2, -2, -2]
                                    }
                                    clicked.shipOrientation = game.horizontal;
                                    let temp = []
                                    xs.map((v, i) => {
                                        obj = game.fieldsToChoseObjects.find((element) => { return (element.x == clicked.x + xs[i] && element.y == clicked.y + ys[i]) })
                                        if (obj != undefined) {
                                            obj.material = game.cantPlaceMat
                                            obj.canPutShip = false;
                                            game.cantPlaceArrayHelp.push(obj)
                                            temp.push(obj)
                                        }
                                    })
                                    game.cantPlaceArray.push({ fieldId: clicked.fieldId, fields: temp })
                                    field1.hasShip = true;
                                    field1.shipType = "2";
                                    field1.otherBlock = clicked;
                                    clicked.otherBlock = field1
                                    clicked.material = game.clickedMat
                                    field1.material = game.clickedMat
                                    field1.checked = true;
                                    clicked.checked = true;
                                    field1.shipOrientation = game.horizontal;
                                    clicked.order = 0;
                                    field1.order = 1;
                                }
                            }
                        }

                    }
                    else if (game.typeOfChosingShip == 3 && !clicked.checked && clicked.canPutShip && clicked.material != game.clickedMat && clicked.hasShip == false) {
                        //WYBIERANIE STATKU - TRÓJKA
                        if (game.mediumShipsLeft != 0) {
                            let field2, field3;
                            if (game.horizontal) {
                                field2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 1 && element.y == clickedObject.y })
                                field3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 2 && element.y == clickedObject.y })
                            } else {
                                field2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 1 })
                                field3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 2 })
                            }
                            if (field2 && field3) {

                                if (field2.canPutShip && !field2.hasShip && field3.canPutShip && !field3.hasShip) {
                                    game.mediumShipsLeft -= 1;
                                    ui.updateRaftsLeft()
                                    game.helpArrayForHover = []
                                    clicked.shipType = "3"
                                    field2.shipType = "3"
                                    field3.shipType = "3"
                                    if (game.mediumShipsLeft == 1) {
                                        clicked.shipType = "9"
                                        field2.shipType = "9"
                                        field3.shipType = "9"
                                    }

                                    clicked.material = game.clickedMat
                                    field2.material = game.clickedMat
                                    field3.material = game.clickedMat
                                    clicked.hasShip = true;
                                    field2.hasShip = true;
                                    field3.hasShip = true;
                                    clicked.otherBlocks = [field2, field3]
                                    field2.otherBlocks = [clicked, field3]
                                    field3.otherBlocks = [clicked, field2]
                                    field2.checked = true;
                                    field3.checked = true;
                                    clicked.checked = true;
                                    clicked.order = 0
                                    field2.order = 1
                                    field3.order = 2
                                    clicked.shipOrientation = game.horizontal
                                    field2.shipOrientation = game.horizontal
                                    field3.shipOrientation = game.horizontal
                                    let xs, ys;
                                    if (game.horizontal) {
                                        xs = [-1, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 3]
                                        ys = [-1, 0, 1, -1, 1, -1, 1, -1, 1, -1, 0, 1]
                                    } else {
                                        xs = [-1, 0, 1, -1, 1, -1, 1, -1, 1, -1, 0, 1]
                                        ys = [1, 1, 1, 0, 0, -1, -1, -2, -2, -3, -3, -3]
                                    }
                                    let temp = []
                                    xs.map((v, i) => {
                                        obj = game.fieldsToChoseObjects.find((element) => { return (element.x == clicked.x + xs[i] && element.y == clicked.y + ys[i]) })
                                        if (obj != undefined) {
                                            obj.material = game.cantPlaceMat
                                            obj.canPutShip = false;
                                            game.cantPlaceArrayHelp.push(obj)
                                            temp.push(obj)
                                        }
                                    })
                                    game.cantPlaceArray.push({ fieldId: clicked.fieldId, fields: temp })
                                }

                            }


                        }

                    } else if (game.typeOfChosingShip == 4 && !clicked.checked && clicked.canPutShip && clicked.material != game.clickedMat && clicked.hasShip == false) {
                        //WYBIERANIE STATKU - CZWÓRKA
                        if (game.largeShipsLeft != 0) {
                            let field2, field3, field4;
                            if (game.horizontal) {
                                field2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 1 && element.y == clickedObject.y })
                                field3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 2 && element.y == clickedObject.y })
                                field4 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 3 && element.y == clickedObject.y })
                            } else {
                                field2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 1 })
                                field3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 2 })
                                field4 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 3 })
                            }
                            if (field2 && field3 && field4) {
                                if (field2.canPutShip && !field2.hasShip && field3.canPutShip && !field3.hasShip && field4.canPutShip && !field4.hasShip) {
                                    game.largeShipsLeft -= 1;
                                    ui.updateRaftsLeft()
                                    game.helpArrayForHover = []
                                    clicked.shipType = "4"
                                    field2.shipType = "4"
                                    field3.shipType = "4"
                                    field4.shipType = "4"
                                    clicked.material = game.clickedMat
                                    field2.material = game.clickedMat
                                    field3.material = game.clickedMat
                                    field4.material = game.clickedMat
                                    clicked.hasShip = true;
                                    field2.hasShip = true;
                                    field3.hasShip = true;
                                    field4.hasShip = true;
                                    clicked.otherBlocks = [field2, field3, field4]
                                    field2.otherBlocks = [clicked, field3, field4]
                                    field3.otherBlocks = [clicked, field2, field4]
                                    field4.otherBlocks = [clicked, field2, field3]
                                    field2.checked = true;
                                    field3.checked = true;
                                    field4.checked = true;
                                    clicked.checked = true;
                                    clicked.shipOrientation = game.horizontal
                                    field2.shipOrientation = game.horizontal
                                    field3.shipOrientation = game.horizontal
                                    field4.shipOrientation = game.horizontal
                                    clicked.order = 0;
                                    field2.order = 1;
                                    field3.order = 2;
                                    field4.order = 3;
                                    let xs, ys;
                                    if (game.horizontal) {
                                        xs = [-1, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4]
                                        ys = [-1, 0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0, 1]
                                    } else {
                                        xs = [-1, 0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0, 1]
                                        ys = [1, 1, 1, 0, 0, -1, -1, -2, -2, -3, -3, -4, -4, -4]
                                    }
                                    let temp = []
                                    xs.map((v, i) => {
                                        obj = game.fieldsToChoseObjects.find((element) => { return (element.x == clicked.x + xs[i] && element.y == clicked.y + ys[i]) })
                                        if (obj != undefined) {
                                            obj.material = game.cantPlaceMat
                                            obj.canPutShip = false;
                                            game.cantPlaceArrayHelp.push(obj)
                                            temp.push(obj)
                                        }
                                    })
                                    game.cantPlaceArray.push({ fieldId: clicked.fieldId, fields: temp })
                                }
                            }
                        }

                    }
                }
            }
            else if (intersects.some(item => item.object.name == 'invisibleFieldOpp' && item.object.shot == false && game.yourTurn)) {
                let obj = intersects.find(item => item.object.name == 'invisibleFieldOpp').object
                console.log("FIELD Y = " + obj.y.toString() + " FIELD X = " + obj.x.toString())
                let data = {
                    from: sessionStorage.getItem('username'),
                    x: obj.x,
                    y: obj.y
                }
                ui.socket.emit('shot', data)
                game.changeTurn()
            }
        }
    }

})

//              HOVER - NAJEZDZANIE NA POLA I SIE ZMIENIAJA NA ZIELONE
window.addEventListener("mousemove", (e) => {
    if (game != null) {
        if (!game.gameEnded) {
            const raycaster = new THREE.Raycaster();
            const mouseVector = new THREE.Vector2()
            mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVector, game.camera);
            const intersects = raycaster.intersectObjects(game.scene.children);
            if (intersects.length > 0) {
                let clickedObject = intersects[0].object;
                game.helpArrayForHover.map((element) => {
                    element.material = game.notClickedMat;
                })
                game.helpArrayForHover = []
                if (clickedObject.name == "select") {
                    switch (game.typeOfChosingShip) {
                        case 1:
                            let clicked = game.fieldsToChoseObjects.find((element) => { return element.fieldId == clickedObject.fieldId })
                            if (clicked.hasShip == false && clicked.canPutShip == true && game.raftsLeft != 0) {
                                clicked.material = game.hoverMat
                                game.helpArrayForHover.push(clicked)
                            }
                            break;
                        case 2:
                            let field0, field1;
                            field0 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y })
                            game.horizontal ? field1 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 1 && element.y == clickedObject.y }) : field1 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 1 })
                            if (field0 && field1 && field0.hasShip == false && field0.canPutShip == true && game.smallShipsLeft != 0 && field1.hasShip == false && field1.canPutShip == true) {
                                field0.material = game.hoverMat
                                field1.material = game.hoverMat
                                game.helpArrayForHover.push(field0)
                                game.helpArrayForHover.push(field1)
                            }
                            break;
                        case 3:
                            let part0, part2, part3;
                            part0 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y })
                            if (game.horizontal) {
                                part2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 1 && element.y == clickedObject.y })
                                part3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 2 && element.y == clickedObject.y })
                            } else {
                                part2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 1 })
                                part3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 2 })
                            }
                            if (part0 && part2 && part3 && part0.hasShip == false && part0.canPutShip == true && game.mediumShipsLeft != 0 && part2.hasShip == false && part2.canPutShip == true && part3.hasShip == false && part3.canPutShip == true) {
                                part0.material = game.hoverMat
                                part2.material = game.hoverMat
                                part3.material = game.hoverMat
                                game.helpArrayForHover.push(part0)
                                game.helpArrayForHover.push(part2)
                                game.helpArrayForHover.push(part3)
                            }
                            break;
                        case 4:
                            let largeShipPart1, largeShipPart2, largeShipPart3, largeShipPart4;
                            largeShipPart1 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y })
                            if (game.horizontal) {
                                largeShipPart2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 1 && element.y == clickedObject.y })
                                largeShipPart3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 2 && element.y == clickedObject.y })
                                largeShipPart4 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x + 3 && element.y == clickedObject.y })
                            } else {
                                largeShipPart2 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 1 })
                                largeShipPart3 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 2 })
                                largeShipPart4 = game.fieldsToChoseObjects.find((element) => { return element.x == clickedObject.x && element.y == clickedObject.y - 3 })
                            }
                            if (largeShipPart1 && largeShipPart2 && largeShipPart3 && largeShipPart4 && largeShipPart1.hasShip == false && largeShipPart1.canPutShip == true && game.largeShipsLeft != 0 && largeShipPart2.hasShip == false && largeShipPart2.canPutShip == true && largeShipPart3.hasShip == false && largeShipPart3.canPutShip == true && largeShipPart4.hasShip == false && largeShipPart4.canPutShip == true) {
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
                } else if (intersects.some(item => item.object.name == 'invisibleFieldOpp' && item.object.shot == false)) {
                    let obj = intersects.find(item => item.object.name == 'invisibleFieldOpp').object
                    let material = new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.TextureLoader().load('../../textures/aim.png') })
                    if (game.helpforMichal != null && game.helpforMichal.shot == false) {
                        if (game.helpforMichal.position != obj.position) {
                            obj.changeMaterial(material)
                            game.helpforMichal.changeMaterial(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))
                        }
                    } else {
                        obj.changeMaterial(material)
                    }
                    game.helpforMichal = obj
                }
            }
        }

    }
})
document.addEventListener("keydown", (e) => {
    if (e.keyCode == 82) {
        game.helpArrayForHover.map((element) => {
            element.material = game.notClickedMat;
        })
        game.horizontal = !game.horizontal;
    }
});