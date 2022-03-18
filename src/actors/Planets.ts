import {
  AudioAnalyser,
  Color,
  Mesh,
  MeshToonMaterial,
  SphereBufferGeometry,
  Vector3,
} from "three";
import { calculateSoundAverages } from "../utils/audioUtils";

export interface Planet extends Mesh {
  geometry: SphereBufferGeometry;
  material: MeshToonMaterial;
  originalPosition?: Vector3;
  offsetY?: number;
  angleSpeed?: number;
  angle?: number;
}
export class Planets {
  meshes: Array<Planet>;
  analyser: AudioAnalyser;

  constructor(analyser: AudioAnalyser) {
    this.meshes = this.initializePlanets();
    this.analyser = analyser;
  }

  initializePlanets() {
    const radius = 2;
    const geometry = new SphereBufferGeometry(0.2);
    const material = new MeshToonMaterial({
      color: new Color(0, 0.3, 0),
      wireframe: true,
    });

    return [...Array(8)].map((_, idx) => {
      const sphere = <Planet>new Mesh(geometry, material);
      const x = Math.sin((idx / 4) * Math.PI) * radius;
      const z = Math.cos((idx / 4) * Math.PI) * radius;
      sphere.position.set(x + 0.25, -1, z + 0.1);
      sphere.originalPosition = sphere.position.clone();
      sphere.offsetY = 0;
      sphere.angleSpeed = 2;
      sphere.angle = 0;
      return sphere;
    });
  }

  updatePlanets(delta: number) {
    const sounds = calculateSoundAverages(this.analyser, 12);
    const radius = 2;
    this.meshes.forEach((planet, idx) => {
      planet.offsetY = (sounds[idx] / 255) * 500 * (idx + 1);
      planet.position.setX(
        Math.cos(planet.angle + (idx / 4) * Math.PI) * radius + 0.25
      );
      planet.position.setY(
        planet.originalPosition.y + Math.max(planet.offsetY, -0.05)
      );
      planet.position.setZ(
        Math.sin(planet.angle + (idx / 4) * Math.PI) * radius + 0.1
      );
      planet.angle += delta * planet.angleSpeed;
    });
  }
}
