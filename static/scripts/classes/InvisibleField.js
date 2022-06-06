class InvisibleField extends THREE.Mesh {
    constructor(geometry, material, x, y, name) {
        super()
        this.geometry = geometry
        this.material = material
        this.x = x
        this.y = y
        this.name = name
        this.shot = false
    }
    changeMaterial = (value) => {
        if (!this.shot)
            this.material = value
    }
    gotShot = () => {
        this.shot = true
    }
}