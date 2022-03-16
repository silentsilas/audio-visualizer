import { Texture, TextureLoader } from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();

export function LoadModel(): Promise<GLTF> {
  const loadingDiv = document.getElementById("loader");
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      "/static/models/scene.gltf",
      (gltf: GLTF) => {
        loadingDiv.innerHTML = "";
        resolve(gltf);
      },
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

export function LoadTexture(url): Promise<Texture> {
  const loadingDiv = document.getElementById("loader");
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture: Texture) => resolve(texture),
      (progress) =>
        (loadingDiv.innerHTML = `Loading texture: ${
          (progress.loaded / progress.total) * 100
        }%`),
      (error: ErrorEvent) => {
        console.log(error.target);
        reject(error);
      }
    );
  });
}
