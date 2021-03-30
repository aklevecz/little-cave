import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Player } from "./player";
import "./index.css";

class Main {
    previousRAF_: null | number;
    _renderer: THREE.WebGLRenderer;
    _scene: THREE.Scene;
    _camera: THREE.PerspectiveCamera;
    _controls: OrbitControls;
    _player: Player;
    _entities: Array<THREE.Mesh> = [];
    _sceneLoaded = false;

    constructor() {
        this._initialize();
    }

    _initialize() {
        this.previousRAF_ = null;
        this._loadControllers();
        setTimeout(() => {
            this._player = new Player(
                this._camera,
                this._renderer.domElement,
                this._scene,
                this._entities
            );
        }),
            1000;

        this.RAF_();
    }

    _loadControllers() {
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.physicallyCorrectLights = true;
        this._renderer.outputEncoding = THREE.sRGBEncoding;

        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this._camera.position.z = 4;
        this._camera.position.y = 200;

        // this._controls = new OrbitControls(this._camera, this._renderer.domElement)

        // floors
        // var plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(100, 100, 10, 10),
        //     new THREE.MeshStandardMaterial({
        //         color: 0xFFFFFF,
        //     }));
        // plane.castShadow = false;
        // plane.receiveShadow = true;
        // plane.rotation.x = -Math.PI / 2;
        // this._scene.add(plane);
        // this._entities.push(plane)

        // var plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(100, 100, 10, 10),
        //     new THREE.MeshStandardMaterial({
        //         color: 0xFFFFFF,
        //     }));
        // plane.castShadow = false;
        // plane.receiveShadow = true;
        // plane.rotation.x = -Math.PI / 2;
        // plane.position.x = 0;
        // plane.position.y = -100;
        // this._scene.add(plane);
        // this._entities.push(plane)
        const geometry = new THREE.SphereGeometry(500, 60, 40);

        const texture = new THREE.TextureLoader().load(require("./equi.jpg"));
        this._scene.background = texture;
        // const material = new THREE.MeshBasicMaterial({ map: texture });
        // const mesh = new THREE.Mesh(geometry, material);
        //      geometry.scale(-1, 1, 1);

        // this._scene.add(mesh);
        // imported floors
        const texture2 = new THREE.TextureLoader().load(require("./equi.jpg"));
        texture2.format = THREE.RGBFormat;
        texture2.mapping = THREE.EquirectangularReflectionMapping;

        const asphalt = new THREE.TextureLoader().load(
            require("./asphalt.jpg")
        );
        const loader = new GLTFLoader();
        loader.load(require("./scene.glb"), (gltf) => {
            this._scene.add(gltf.scene);

            gltf.scene.children.map((c: THREE.Mesh) => {
                if (c.name === "hole") {
                    (c.material as any).envMap = texture2;
                    (c.material as any).envMapIntensity = 1;
                    (c.material as any).roughness = 0;
                }

                if (c.name.includes("floor")) {
                    (c.material as any).map = asphalt;
                    console.log(c.material);
                }

                this._entities.push(c);
                this._sceneLoaded = true;
            });
        });
        //**floors */

        const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this._scene.add(light);

        // const sphere = new THREE.Mesh(
        //     new THREE.SphereGeometry(10),
        //     new THREE.MeshBasicMaterial({ color: "black" })
        // );
        // sphere.position.x = -30;
        // sphere.position.y = -9;
        // sphere.name = "teemo";
        // this._scene.add(sphere);
        // this._entities.push(sphere);

        document.body.appendChild(this._renderer.domElement);
    }

    RAF_() {
        requestAnimationFrame((t) => {
            if (this._sceneLoaded) {
                if (this.previousRAF_ === null) {
                    this.previousRAF_ = t;
                }
                this.Step_(t - this.previousRAF_);
                this._renderer.render(this._scene, this._camera);
                this.previousRAF_ = t;
            }
            setTimeout(() => this.RAF_(), 1);
        });
    }

    Step_(timeElapsed: number) {
        const timeElapsedS = Math.min(1.0 / 30, timeElapsed * 0.001);
        if (this._player) {
            this._player.Update(timeElapsedS);
        }
        // update entity manager
    }
}
const button = document.createElement("button");
button.innerText = "Start";
button.className = "start-button";
document.body.appendChild(button);
button.onclick = () => {
    new Main();
    button.remove();
};
