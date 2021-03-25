import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Player } from "./player";

document.body.style.margin = "0px";

class Main {
    previousRAF_: null | number;
    _renderer: THREE.WebGLRenderer;
    _scene: THREE.Scene;
    _camera: THREE.PerspectiveCamera;
    _controls: OrbitControls;
    _player: Player
    _entities: THREE.Mesh[] = []

    constructor() {
        this._initialize()
    }

    _initialize() {
        this.previousRAF_ = null;
        this._loadControllers()
        this._player = new Player(this._camera, this._renderer.domElement, this._scene, this._entities)
        this.RAF_()
    }

    _loadControllers() {
        this._renderer = new THREE.WebGLRenderer()
        this._renderer.setSize(window.innerWidth, window.innerHeight)
        this._scene = new THREE.Scene()
        this._camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 1000)
        this._camera.position.z = 4;
        this._camera.position.y = 1;

        // this._controls = new OrbitControls(this._camera, this._renderer.domElement)

        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);
        this._entities.push(plane)

        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        plane.position.x = 0;
        plane.position.y = -100;
        this._scene.add(plane);
        this._entities.push(plane)

        const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this._scene.add(light);

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({ color: "black" }))
        sphere.position.x = -30;
        sphere.position.y = -9
        sphere.name = "teemo"
        this._scene.add(sphere)
        this._entities.push(sphere)


        document.body.appendChild(this._renderer.domElement)
    }

    RAF_() {
        requestAnimationFrame(t => {
            if (this.previousRAF_ === null) {
                this.previousRAF_ = t;
            }
            this.Step_(t - this.previousRAF_)
            this._renderer.render(this._scene, this._camera)
            this.previousRAF_ = t
            setTimeout(() => this.RAF_(), 1)
        })
    }

    Step_(timeElapsed: number) {
        const timeElapsedS = Math.min(1.0 / 30., timeElapsed * .001)
        this._player.Update(timeElapsedS)
        // update entity manager
    }
}

new Main()  