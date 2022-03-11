import { Audio, AudioLoader } from "three";

const loader = new AudioLoader();

export function LoadAudio(listener): Promise<Audio> {
  const loadingDiv = document.getElementById("loader");
  loadingDiv.innerHTML = "Loading audio: 0%";

  return new Promise((resolve, reject) => {
    loader.load(
      "/static/audio.mp3",
      (audio) => {
        const sound = new Audio(listener);
        sound.setBuffer(audio);
        sound.setLoop(false);
        sound.setVolume(0.1);
        loadingDiv.innerHTML = "";
        return resolve(sound);
      },
      (progress) =>
        (loadingDiv.innerHTML = `Loading audio: ${
          (progress.loaded / progress.total) * 100
        }%`),
      (error: ErrorEvent) => {
        console.log(error.target);
        reject(error);
      }
    );
  });
}
