import { MathUtils, PerspectiveCamera, Vector3 } from "three";

export class OrbitCamera {
  angle: number;
  angularSpeed: number;
  radius: number;
  camera: PerspectiveCamera;

  constructor(camera: PerspectiveCamera) {
    this.camera = camera;
    this.angularSpeed = MathUtils.degToRad(20);
    this.angle = 0;
    this.radius = 5;
  }

  update(delta: number, lookAt: Vector3) {
    this.camera.position.x = Math.sin(this.angle) * this.radius;
    this.camera.position.z = Math.cos(this.angle) * this.radius;
    this.camera.position.y = Math.cos(this.angle) * 1.5 + 1;
    this.angle += this.angularSpeed * delta;
    this.camera.lookAt(lookAt);
  }
}
