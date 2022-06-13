class Ui {
    constructor() {
        this.socket = io();
        this.logged = false;
        document.getElementById('playButton').onclick = this.handleLogin
        // window.addEventListener("keydown", (e) => {
        //     switch (e.keyCode) {
        //         case 38:
        //             game.cameraDown = true;
        //             break;
        //         case 40:
        //             game.cameraUp = true;
        //             break;
        //         case 37:
        //             game.cameraLeft = true;
        //             break;
        //         case 39:
        //             game.cameraRight = true;
        //             break;
        //     }
        // });
        // window.addEventListener("keyup", (e) => {
        //     switch (e.keyCode) {
        //         case 38:
        //             game.cameraDown = false;
        //             break;

        //         case 40:
        //             game.cameraUp = false;
        //             break;
        //         case 37:
        //             game.cameraLeft = false;
        //             break;
        //         case 39:
        //             game.cameraRight = false;
        //             break;
        //     }
        // });
    }

    handleLogin = () => {
        let username = document.getElementsByName('username')[0].value
        if (username.length < 1 || username.trim().length < 1) {
            document.getElementsByName('username')[0].style.borderTop = '2px solid rgba(115, 13, 13, 0.6)'
            document.getElementsByName('username')[0].style.borderBottom = '2px solid rgba(115, 13, 13, 0.6)'
            document.getElementsByName('username')[0].style.transform = 'scale(1.2)'
            document.getElementsByName('username')[0].style.color = '#ff2d2dd8'
            document.getElementsByName('username')[0].value = "You must have a name!"
            document.getElementsByName('username')[0].style.fontSize = '19px'
            document.getElementsByName('username')[0].onclick = this.switchStylesBack
            return;
        }
        this.socket.emit('loginSuccess', username);
        this.socket.on("loginStatus", (data) => {
            if (!this.logged) {
                if (data.success) {
                    document.getElementById('loginBox').style.display = 'none'
                    document.body.style.background = 'none'
                    document.getElementById('placeShips').style.display = 'block'
                    this.logged = true;
                    sessionStorage.setItem('username', username);
                    game.pickShips()
                } else {
                    document.getElementById('loginStatus').innerText = data.errorMessage;
                }
            }
        })
    }
    switchStylesBack = () => {
        document.getElementsByName('username')[0].style.borderTop = '1px solid rgba(255, 255, 255, 0.5)'
        document.getElementsByName('username')[0].style.borderBottom = '1px solid rgba(255, 255, 255, 0.5)'
        document.getElementsByName('username')[0].style.transform = 'scale(1.0)'
        document.getElementsByName('username')[0].placeholder = "Username"
        document.getElementsByName('username')[0].style.fontSize = '20px'
        document.getElementsByName('username')[0].style.color = 'whitesmoke'
        document.getElementsByName('username')[0].value = ''
    }

    switchDisplayById(id, display) {
        document.querySelector(`#${id}`).style.display = display
    }
    setText(id, text) {
        if (document.querySelector(`#${id}`).textContent.includes('0') && text.includes('1'))
            document.getElementById('b' + id[1]).classList.remove('empty')
        document.querySelector(`#${id}`).textContent = text
        if (text.includes('0')) {
            document.getElementById('b' + id[1]).classList.add('empty')
        }
    }
    selectShipType(button, type) {
        if (document.querySelector('#errShips').style.display == 'block') document.querySelector('#errShips').style.display = 'none'
        this.clickedShipChosingButton != null ? this.clickedShipChosingButton.classList.remove("clicked") : this.clickedShipChosingButton = button;
        button.classList.add("clicked")
        this.clickedShipChosingButton = button
        game.typeOfChosingShip = type;
        this.updateRaftsLeft()
    }
    updateRaftsLeft() {
        this.setText("r1", String(game.raftsLeft) + "x")
        this.setText("r2", String(game.smallShipsLeft) + "x")
        this.setText("r3", String(game.mediumShipsLeft) + "x")
        this.setText("r4", String(game.largeShipsLeft) + "x")
    }
    ready() {
        if (game.raftsLeft != 0 || game.smallShipsLeft != 0 || game.mediumShipsLeft != 0 || game.largeShipsLeft != 0) {
            document.querySelector('#errShips').style.display = 'block'
            return
        }
        game.gatherInfoAboutShips()
        game.loadWaitingScreen()
        let board = game.fieldsToChose
        let data = {
            username: sessionStorage.getItem('username'),
            board: board
        }
        game.ready = true;
        this.socket.emit('shipsReady', data)
    }
    playAgain() {
        reset();
        document.location.reload()
    }
}