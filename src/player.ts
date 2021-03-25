import * as THREE from "three"
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"

export class Player {
    private _controls: PointerLockControls
    private _moveForward: boolean = false;
    private _moveBackward: boolean = false;
    private _moveLeft: boolean = false;
    private _moveRight: boolean = false;
    private _canJump: boolean = false;

    private _velocity: THREE.Vector3 = new THREE.Vector3();
    private _direction: THREE.Vector3 = new THREE.Vector3();

    private _entities: THREE.Mesh[]

    constructor(_camera: THREE.PerspectiveCamera, _domElement: HTMLElement, _scene: THREE.Scene, _entities: THREE.Mesh[]) {
        this._controls = new PointerLockControls(_camera, _domElement)
        this._init()

        _scene.add(this._controls.getObject())

        this._entities = _entities;

        document.body.onclick = () => this._controls.lock()
    }

    _init() {
        const onKeyDown = function (event: KeyboardEvent) {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this._moveForward = true;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this._moveLeft = true;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this._moveBackward = true;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this._moveRight = true;
                    break;

                case 'Space':
                    if (this._canJump === true) this._velocity.y += 350;
                    this._canJump = false;
                    break;

            }

        };

        const onKeyUp = function (event: KeyboardEvent) {

            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this._moveForward = false;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this._moveLeft = false;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this._moveBackward = false;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this._moveRight = false;
                    break;

            }

        };

        document.addEventListener('keydown', onKeyDown.bind(this));
        document.addEventListener('keyup', onKeyUp.bind(this));
    }

    Update(delta: number) {
        if (this._controls.isLocked) {
            this._velocity.x -= this._velocity.x * 10 * delta;
            this._velocity.z -= this._velocity.z * 10 * delta;
            this._velocity.y -= 9.8 * 100 * delta;

            this._direction.z = Number(this._moveForward) - Number(this._moveBackward);
            this._direction.x = Number(this._moveRight) - Number(this._moveLeft)
            this._direction.normalize();

            if (this._moveForward || this._moveBackward) this._velocity.z -= this._direction.z * 400 * delta;
            if (this._moveLeft || this._moveRight) this._velocity.x -= this._direction.x * 400 * delta

            this._controls.moveRight(-this._velocity.x * delta);
            this._controls.moveForward(-this._velocity.z * delta)

            this._controls.getObject().position.y += (this._velocity.y * delta);

            const sphere = new THREE.Sphere(this._controls.getObject().position, 10);
            const intersections = this._entities.filter((floor: THREE.Mesh) => {
                const box = new THREE.Box3()
                floor.geometry.computeBoundingBox()
                box.copy(floor.geometry.boundingBox).applyMatrix4(floor.matrixWorld)
                return sphere.intersectsBox(box);
            })

            // if (this._controls.getObject().position.y < 10) {
            if (intersections.length > 0) {
                const teemo = intersections.filter(inter => inter.name === "teemo")
                if (teemo.length > 0) {
                    if (teemo[0].position.distanceTo(this._controls.getObject().position) < 19) {
                        return
                    }
                }
                this._velocity.y = 0;
                this._controls.getObject().position.y = intersections[0].position.y + 10
                this._canJump = true
            }

        }
    }
}