class Ui {
    constructor() {
        document.getElementById('playButton').onclick = this.handleLogin
    }
    handleLogin = () => {
        let username = document.getElementsByName('username')[0].value
        if(username.length < 1 || username.trim().length < 1){
            document.getElementsByName('username')[0].style.borderTop = '2px solid rgba(115, 13, 13, 0.6)'
            document.getElementsByName('username')[0].style.borderBottom = '2px solid rgba(115, 13, 13, 0.6)'
            document.getElementsByName('username')[0].style.transform = 'scale(1.2)'
            document.getElementsByName('username')[0].style.color = '#ff2d2dd8'
            document.getElementsByName('username')[0].value = "You must have a name!"
            document.getElementsByName('username')[0].style.fontSize = '19px'
            document.getElementsByName('username')[0].onclick = this.switchStylesBack
            return;
        }
            document.getElementById('loginBox').style.display = 'none'
            document.body.style.background = 'none'
            document.getElementById('placeShips').style.display = 'block'
            socket.emit('loginSuccess', username);
            game.pickShips()
    }

    switchStylesBack = () => {
        document.getElementsByName('username')[0].style.borderTop = '1px solid rgba(255, 255, 255, 0.5)'
        document.getElementsByName('username')[0].style.borderBottom = '1px solid rgba(255, 255, 255, 0.5)'
        document.getElementsByName('username')[0].style.transform = 'scale(1.0)'
        document.getElementsByName('username')[0].placeholder = "Username"
        document.getElementsByName('username')[0].style.fontSize = '20px'
        document.getElementsByName('username')[0].style.color = 'whitesmoke'
        document.getElementsByName('username')[0].value= ''
    }


    switchDisplayById(id, display) {
        document.querySelector(`#${id}`).style.display = display
    }
    setText(id, text) {
        document.querySelector(`#${id}`).textContent = text
    }
    selectShipType(button, type) {
        this.clickedShipChosingButton != null ? this.clickedShipChosingButton.classList.remove("clicked") : this.clickedShipChosingButton = button;
        button.classList.add("clicked")
        this.clickedShipChosingButton = button
        game.typeOfChosingShip = type;
        this.updateRaftsLeft()
    }
    updateRaftsLeft() {
        this.setText("r1", String(game.raftsLeft)+"x")
        this.setText("r2", String(game.smallShipsLeft)+"x")
        this.setText("r3", String(game.mediumShipsLeft)+"x")
        this.setText("r4", String(game.largeShipsLeft)+"x")
    }
    ready(){
        if(game.raftsLeft!=0 || game.smallShipsLeft!=0 || game.mediumShipsLeft!=0 || game.largeShipsLeft!=0)return;
        game.gatherInfoAboutShips()
    }
}