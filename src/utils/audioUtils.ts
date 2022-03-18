import { AudioAnalyser } from "three";
import { avg, chunk } from "./arrayUtils";

export function calculateSoundAverages(
  audioAnalyser: AudioAnalyser,
  chunkAmount: number
): number[] {
  const soundArray = audioAnalyser.getFrequencyData();
  const chunkedArray = chunk(soundArray, chunkAmount);
  const averages = chunkedArray.map((arr) => avg(arr) / 255);

  return averages;
}
