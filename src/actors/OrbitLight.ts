import {
  MathUtils,
  Mesh,
  MeshToonMaterial,
  PointLight,
  SphereBufferGeometry,
} from "three";

export class OrbitLight {
  angle: number;
  angularSpeed: number;
  radius: number;
  light: PointLight;

  constructor(light: PointLight) {
    this.light = light;
    this.angle = 30;
    this.angularSpeed = MathUtils.degToRad(35);
    this.radius = 1.5;
    this.initialize();
  }

  initialize() {
    const geometry = new SphereBufferGeometry(0.1);
    const material = new MeshToonMaterial({ color: 0xffff00 });
    const sphere = new Mesh(geometry, material);
    this.light.add(sphere);
    this.update(0);
  }

  update(delta: number) {
    this.light.position.x = Math.cos(this.angle) * this.radius * 2;
    this.light.position.z = Math.sin(this.angle) * this.radius;
    this.light.position.y = Math.cos(this.angle) * 5;

    this.angle += this.angularSpeed * delta;
  }
}
