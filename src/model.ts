import { AnimationClip, Scene, Camera } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export interface GLTF {
  animations: AnimationClip[];
  scene: Scene;
  scenes: Scene[];
  cameras: Camera[];
  asset: object;
}

export function LoadModel(): Promise<GLTF> {
  const loadingDiv = document.getElementById("loader");
  return new Promise((resolve, reject) => {
    loader.load(
      "/static/scene.gltf",
      (object: GLTF) => resolve(object),
      (progress) =>
        (loadingDiv.innerHTML = `Loading model: ${
          (progress.loaded / progress.total) * 100
        }%`),
      (error: ErrorEvent) => {
        console.log(error.target);
        reject(error);
      }
    );
  });
}
