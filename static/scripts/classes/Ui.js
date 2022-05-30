class Ui{
    switchDisplayById(id,display){
        document.querySelector(`#${id}`).style.display = display
    }
    selectShipType(button, type){
        this.clickedShipChosingButton!=null?  this.clickedShipChosingButton.classList.remove("clicked"):this.clickedShipChosingButton = button;
        button.classList.add("clicked")
        this.clickedShipChosingButton = button
    }
}