 class Game {
    constructor() {
        console.log("construct")
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x333333);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);
        this.chessboard = []
        this.pawns = []
        this.camera.position.set(250, 131, 250)
        this.camera.lookAt(this.scene.position)
        this.axes = new THREE.AxesHelper(1000)
        this.scene.add(this.axes)
        this.render() // wywołanie metody render
        this.setup()
        this.ships = []
    }
    setup = ()=>{
        let sandGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
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
        const waterGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
        waterGeometry.rotateX(Math.PI / 2 );
        const waterMaterial = new THREE.MeshBasicMaterial( {color: 0x46b7e3, side: THREE.DoubleSide,transparent: true, opacity: 0.6} );
        const water = new THREE.Mesh( waterGeometry, waterMaterial );
        water.position.y = 30
        this.scene.add( water );
        const light = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(light);
        // modelLoaders.loadRaft()
        // modelLoaders.loadSmallShip()
        modelLoaders.loadMediumShip()
        // modelLoaders.loadLargeShip()
        }

    render = () => {
        requestAnimationFrame(this.render);
        TWEEN.update();
        this.renderer.render(this.scene, this.camera);
    }

}

