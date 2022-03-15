import { Audio, AudioAnalyser, AudioListener, AudioLoader } from "three";
import { SoundAverages } from "./types";
import { avg } from "./utils";

const loader = new AudioLoader();

export function LoadAudio(
  listener: AudioListener,
  url: string,
  volume: number
): Promise<Audio> {
  const loadingDiv = document.getElementById("loader");
  loadingDiv.innerHTML = "Loading audio: 0%";

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (audio) => {
        const sound = new Audio(listener);
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
  audioAnalyser: AudioAnalyser
): SoundAverages {
  const soundArray = audioAnalyser.getFrequencyData();
  const soundAvg = avg(soundArray) / soundArray.length;

  const lowArray = soundArray.slice(0, soundArray.length / 5 - 1);

  const lowMidArray = soundArray.slice(
    soundArray.length / 5 - 1,
    2 * (soundArray.length / 5) - 1
  );

  const midArray = soundArray.slice(
    (2 * soundArray.length) / 5 - 1,
    3 * (soundArray.length / 5) - 1
  );

  const highMidArray = soundArray.slice(
    (3 * soundArray.length) / 5 - 1,
    4 * (soundArray.length / 5) - 1
  );

  const highArray = soundArray.slice(
    4 * (soundArray.length / 5) - 1,
    soundArray.length - 1
  );

  const lowAvg = avg(lowArray) / lowArray.length;
  const lowMidAvg = avg(lowMidArray) / lowMidArray.length;
  const midAvg = avg(midArray) / midArray.length;
  const highMidAvg = avg(highMidArray) / highMidArray.length;
  const highAvg = avg(highArray) / highArray.length;

  document.getElementById("debug").innerHTML = `lows: ${lowAvg.toFixed(
    2
  )}, low mids: ${lowMidAvg.toFixed(2)}, mids: ${midAvg.toFixed(
    2
  )}, high mids: ${highMidAvg.toFixed(2)}, highs: ${highAvg.toFixed(2)}`;

  return {
    soundAvg,
    lowAvg,
    lowMidAvg,
    midAvg,
    highMidAvg,
    highAvg,
  };
}
