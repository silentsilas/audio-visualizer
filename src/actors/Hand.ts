import {
  AudioAnalyser,
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InterleavedBufferAttribute,
  Mesh,
  MeshToonMaterial,
} from "three";
import { RandomNumberGenerator } from "..";

export class Hand {
  mesh: Mesh<BufferGeometry, MeshToonMaterial>;
  originalPositions?: BufferAttribute | InterleavedBufferAttribute;
  distortions?: Array<number>;
  analyser?: AudioAnalyser;
  positions?: BufferAttribute | InterleavedBufferAttribute;
  distortionMax: number;
  distortionPower: number;

  constructor(mesh) {
    this.mesh = mesh;
    this.distortionMax = 4;
    this.distortionPower = 3;
  }

  initialize(rng: RandomNumberGenerator, analyser: AudioAnalyser) {
    this.analyser = analyser;
    // set up distortion for each vertex
    this.originalPositions = this.mesh.geometry.getAttribute("position");
    this.distortions = (this.originalPositions.array as Array<number>)
      .slice(0)
      .map(() => rng() * 2 - 1);
    this.positions = this.mesh.geometry.getAttribute("position");
    this.mesh.parent.position.x = this.mesh.parent.position.x + 2.8;
    this.mesh.parent.position.y = this.mesh.parent.position.y + 0;
    this.mesh.parent.position.z = this.mesh.parent.position.z + 2.2;
    this.mesh.parent.rotateZ(Math.PI / 2);
    this.mesh.geometry.center();

    this.mesh.material = new MeshToonMaterial({
      color: new Color(0, 0.3, 0),
    });
    this.mesh.material.wireframe = true;
  }

  update() {
    const sound = Math.pow(
      (this.analyser.getAverageFrequency() / 255) * this.distortionMax,
      this.distortionPower
    );

    const newPositions = new Float32BufferAttribute(
      (this.positions.array as Array<number>).map((_position, index) => {
        const distortion = this.distortions[index] * sound;
        return distortion / 10 + this.originalPositions.array[index];
      }),
      3
    );

    this.mesh.geometry.setAttribute("position", newPositions);
  }
}
