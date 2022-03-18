import { Audio, AudioListener, AudioLoader, PositionalAudio } from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new AudioLoader();
const gltfLoader = new GLTFLoader();

export function LoadAudio(
  listener: AudioListener,
  url: string,
  volume: number,
  type: string,
  positional?: boolean
): Promise<PositionalAudio | Audio> {
  const loadingDiv = document.getElementById("loader");
  loadingDiv.innerHTML = `Loading ${type}: 0.00%`;

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (audio) => {
        const sound = positional
          ? new PositionalAudio(listener)
          : new Audio(listener);
        sound.setBuffer(audio);
        sound.setLoop(false);
        sound.setVolume(volume);
        return resolve(sound);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        loadingDiv.innerHTML = `Loading ${type}: ${percent.toFixed(2)}%`;
      },
      (error: ErrorEvent) => {
        console.log(error.target);
        reject(error);
      }
    );
  });
}

export function LoadModel(): Promise<GLTF> {
  const loadingDiv = document.getElementById("loader");
  loadingDiv.innerHTML = `Loading model: 0.00%`;

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      "/static/models/scene.gltf",
      (gltf: GLTF) => {
        resolve(gltf);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        loadingDiv.innerHTML = `Loading model: ${percent.toFixed(2)}%`;
      },
      (error: ErrorEvent) => {
        console.log(error.target);
        reject(error);
      }
    );
  });
}
