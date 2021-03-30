import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";

class PlayerControls {
    public controls: PointerLockControls | DeviceOrientationControls;
    public isDevice: boolean;
    constructor(_camera: THREE.PerspectiveCamera, _domElement: HTMLElement) {
        if (window.innerWidth > 768) {
            this.controls = new PointerLockControls(_camera, _domElement);
            document.body.onclick = () => {
                (this.controls as PointerLockControls).lock();
            }
            this.isDevice = false;
        } else {
            this.controls = new DeviceOrientationControls(_camera);
            this.isDevice = true;
        }
    }

    getObject() {
        if (this.isDevice) {
            return (this.controls as DeviceOrientationControls).object;
        } else {
            return (this.controls as PointerLockControls).getObject();
        }
    }

    isLocked() {
        if (this.isDevice) {
            return true;
        } else {
            return (this.controls as PointerLockControls).isLocked;
        }
    }

    moveForward(distance: number) {
        if (this.isDevice) {
            return ((this
                .controls as DeviceOrientationControls).object.position.z = distance);
        } else {
            return (this.controls as PointerLockControls).moveForward(distance);
        }
    }

    moveRight(distance: number) {
        if (this.isDevice) {
            return ((this
                .controls as DeviceOrientationControls).object.position.x = distance);
        } else {
            return (this.controls as PointerLockControls).moveRight(distance);
        }
    }

    update() {
        if (this.isDevice) {
            (this.controls as DeviceOrientationControls).update();
        }
    }
}

export class Player {
    private _controls: PlayerControls;
    private _moveForward: boolean = false;
    private _moveBackward: boolean = false;
    private _moveLeft: boolean = false;
    private _moveRight: boolean = false;
    private _canJump: boolean = false;

    private _velocity: THREE.Vector3 = new THREE.Vector3();
    private _direction: THREE.Vector3 = new THREE.Vector3();

    private _entities: THREE.Mesh[];

    constructor(
        _camera: THREE.PerspectiveCamera,
        _domElement: HTMLElement,
        _scene: THREE.Scene,
        _entities: THREE.Mesh[]
    ) {
        this._init();

        this._controls = new PlayerControls(_camera, _domElement);

        if (!this._controls.isDevice) {
            _scene.add(this._controls as any);
        }

        this._keyboardControls();
        this._entities = _entities;
    }

    _init() {}

    _keyboardControls() {
        const onKeyDown = function (event: KeyboardEvent) {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    this._moveForward = true;
                    break;

                case "ArrowLeft":
                case "KeyA":
                    this._moveLeft = true;
                    break;

                case "ArrowDown":
                case "KeyS":
                    this._moveBackward = true;
                    break;

                case "ArrowRight":
                case "KeyD":
                    this._moveRight = true;
                    break;

                case "Space":
                    if (this._canJump === true) this._velocity.y += 350;
                    this._canJump = false;
                    break;
            }
        };

        const onKeyUp = function (event: KeyboardEvent) {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    this._moveForward = false;
                    break;

                case "ArrowLeft":
                case "KeyA":
                    this._moveLeft = false;
                    break;

                case "ArrowDown":
                case "KeyS":
                    this._moveBackward = false;
                    break;

                case "ArrowRight":
                case "KeyD":
                    this._moveRight = false;
                    break;
            }
        };

        document.addEventListener("keydown", onKeyDown.bind(this));
        document.addEventListener("keyup", onKeyUp.bind(this));
    }

    Update(delta: number) {
        if (this._controls.isDevice) {
            this._controls.update();
        }
        if (this._controls.isLocked) {
            this._velocity.x -= this._velocity.x * 10 * delta;
            this._velocity.z -= this._velocity.z * 10 * delta;
            this._velocity.y -= 9.8 * 100 * delta;

            this._direction.z =
                Number(this._moveForward) - Number(this._moveBackward);
            this._direction.x =
                Number(this._moveRight) - Number(this._moveLeft);
            this._direction.normalize();

            if (this._moveForward || this._moveBackward)
                this._velocity.z -= this._direction.z * 400 * delta;
            if (this._moveLeft || this._moveRight)
                this._velocity.x -= this._direction.x * 400 * delta;

            const pastPosition = new THREE.Vector3();
            pastPosition.copy(this._controls.getObject().position);

            this._controls.moveRight(-this._velocity.x * delta);
            this._controls.moveForward(-this._velocity.z * delta);

            this._controls.getObject().position.y += this._velocity.y * delta;

            const sphere = new THREE.Sphere(
                this._controls.getObject().position,
                10
            );
            const wallSphere = new THREE.Sphere(
                this._controls.getObject().position,
                1
            );

            const lightFilter = (o: THREE.Mesh) => !o.name.includes("light")

            const intersections = this._entities.filter(lightFilter).filter((floor: THREE.Mesh) => {
                const box = new THREE.Box3();
                floor.geometry.computeBoundingBox();
                box.copy(floor.geometry.boundingBox).applyMatrix4(
                    floor.matrixWorld
                );
                return sphere.intersectsBox(box);
            });

            const wallIntersections = this._entities.filter(lightFilter).filter(
                (floor: THREE.Mesh) => {
                    const box = new THREE.Box3();
                    floor.geometry.computeBoundingBox();
                    box.copy(floor.geometry.boundingBox).applyMatrix4(
                        floor.matrixWorld
                    );
                    return wallSphere.intersectsBox(box);
                }
            );
            // if (this._controls.getObject().position.y < 10) {
            if (intersections.length > 0) {
                const teemo = intersections.filter(
                    (inter) => inter.name === "hole"
                );
                if (teemo.length > 0) {
                    if (
                        teemo[0].position.distanceTo(
                            this._controls.getObject().position
                        ) < 19
                    ) {
                        return;
                    }
                }
                const walls = wallIntersections.filter((inter) =>
                    inter.name.includes("wall")
                );
                if (walls.length > 0) {
                    console.log("huh?");
                    this._controls.getObject().position.copy(pastPosition);
                }
                
                const floor = intersections.filter(inter => inter.name.includes("floor"))
               
                if (floor.length > 0) {
                this._velocity.y = 0;
                this._controls.getObject().position.y =
                    intersections[0].position.y + 10;
                this._canJump = true;
                }
            }
        }
    }
}
