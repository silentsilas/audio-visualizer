import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function LoadModel(): Promise<GLTF> {
  const loadingDiv = document.getElementById("loader");
  return new Promise((resolve, reject) => {
    loader.load(
      "/static/scene.gltf",
      (gltf: GLTF) => resolve(gltf),
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
