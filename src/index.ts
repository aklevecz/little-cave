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
    this._camera.position.z = 400;
    this._camera.position.y = 500;

    const texture = new THREE.TextureLoader().load(require("./assets/bg.jpg"));
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.encoding = THREE.sRGBEncoding;
    this._scene.background = texture;

    const texture2 = new THREE.TextureLoader().load(require("./assets/bg.jpg"));
    texture2.format = THREE.RGBFormat;
    texture2.mapping = THREE.EquirectangularReflectionMapping;

    const asphalt = new THREE.TextureLoader().load(
      require("./assets/asphalt.jpg")
    );
    const loader = new GLTFLoader();
    loader.load(require("./assets/lil-cave.glb"), (gltf) => {
      this._scene.add(gltf.scene);

      gltf.scene.children.map((c: THREE.Mesh) => {
        if (c.name === "hole") {
          (c.material as any).envMap = texture2;
          (c.material as any).envMapIntensity = 1;
          (c.material as any).roughness = 0;
        }

        if (c.name.includes("floor")) {
          (c.material as any).map = asphalt;
        }

        if (c.name === "comeback") {
          const alphaMap = new THREE.TextureLoader().load(
            require("./assets/youwillbecontacted.png")
          ) as any;
          (c.material as any).alphaMap = alphaMap;
          (c.material as any).transparent = true;
        }

        this._entities.push(c);
        this._sceneLoaded = true;
      });
    });

    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this._scene.add(light);

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
// const button = document.createElement("button");
// button.innerText = "Enter";
// button.className = "start-button";
// document.body.appendChild(button);
createForm();
// button.onclick = () => {
//   new Main();
//   button.remove();
// };

const fields: any = {
  name: "",
  email: "",
};

let button: HTMLButtonElement;

function createField(name: string) {
  const fieldContainer = document.createElement("div");
  fieldContainer.className = "field-container";
  const input = document.createElement("input");
  input.name = name;
  input.type = name;
  const label = document.createElement("div");
  label.className = `field-label`;
  label.innerText = name;
  fieldContainer.appendChild(label);
  fieldContainer.appendChild(input);

  input.addEventListener("input", (e: any) => {
    fields[name] = e.target.value;

    if (fields.email && fields.name) {
      button.disabled = false;
      button.innerText = "Enter";
    }
  });

  return fieldContainer;
}

const SIGNUP_ENDPOINT =
  "https://us-central1-eggsvp.cloudfunctions.net/caveSignup";

function createForm() {
  const container = document.createElement("form");
  container.id = "form-container";
  const nameInput = createField("name");
  const emailInput = createField("email");
  container.appendChild(nameInput);
  container.appendChild(emailInput);
  document.body.appendChild(container);

  button = document.createElement("button");
  button.innerText = "...";
  button.className = "start-button";
  button.disabled = true;
  container.appendChild(button);
  button.onclick = () => {
    const { name, email } = fields;
    fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ name, email }),
    });
    new Main();
    container.remove();
  };
}
