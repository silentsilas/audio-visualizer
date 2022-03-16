import {
  Audio,
  AudioAnalyser,
  AudioListener,
  AudioLoader,
  PositionalAudio,
} from "three";
import { avg, chunk } from "./utils";

const loader = new AudioLoader();

export function LoadAudio(
  listener: AudioListener,
  url: string,
  volume: number,
  type: string,
  positional?: boolean
): Promise<PositionalAudio | Audio> {
  const loadingDiv = document.getElementById("loader");
  loadingDiv.innerHTML = `Loading ${type}: 0%`;

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

export function calculateSoundAverages(
  audioAnalyser: AudioAnalyser,
  chunkAmount: number
): number[] {
  const soundArray = audioAnalyser.getFrequencyData();
  const chunkedArray = chunk(soundArray, chunkAmount);
  const averages = chunkedArray.map((arr) => avg(arr) / 255);

  return averages;
}
