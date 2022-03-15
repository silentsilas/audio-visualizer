import {
  AudioAnalyser,
  AudioListener,
  BufferAttribute,
  Clock,
  InterleavedBufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";

export interface CORE {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  clock: Clock;
  rng: RandomNumberGenerator;
  avgs: SoundAverages;
  subtitleDiv: HTMLElement;
  parser: SRTParser;
  srt: SRT[];
  elapsedTime: number;
  playing: boolean;
}

export interface DISTORTION {
  light: CountingLight;
  hand: DistortionMesh;
  positions: BufferAttribute | InterleavedBufferAttribute;
  audioListener: AudioListener;
  audioAnalyser: AudioAnalyser;
}

export interface CountingLight extends PointLight {
  counter?: number;
}

export interface DistortionMesh extends Mesh {
  material: MeshBasicMaterial;
  originalPositions: BufferAttribute | InterleavedBufferAttribute;
  distortions: Array<number>;
}

export type SoundAverages = {
  soundAvg: number;
  lowAvg: number;
  lowMidAvg: number;
  midAvg: number;
  highMidAvg: number;
  highAvg: number;
};

type RandomNumberGenerator = {
  (): number;
};

type SRTParser = {
  (srt: string): SRT[];
};

export type SRT = {
  id: number;
  start: number;
  end: number;
  text: string;
};
