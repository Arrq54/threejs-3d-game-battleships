class Ui {
    constructor() {
        document.getElementById('playButton').onclick = this.handleLogin
    }
    handleLogin = () => {
        let username = document.getElementsByName('username')[0].value
        document.getElementById('loginBox').style.display = 'none'
        document.body.style.background = 'none'
        document.getElementById('placeShips').style.display = 'block'
        ////do roboty
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
        this.switchDisplayById("shipsLeftBox", "block")
        this.updateRaftsLeft()
    }

    updateRaftsLeft() {
        switch (game.typeOfChosingShip) {
            case 1:
                this.setText("shipsLeft", String(game.raftsLeft))
                break;
            case 2:
                this.setText("shipsLeft", String(game.smallShipsLeft))
                break;
            case 3:
                this.setText("shipsLeft", String(game.mediumShipsLeft))
                break;
            case 4:
                this.setText("shipsLeft", String(game.largeShipsLeft))
                break;
            default:
                break;
        }
    }
}