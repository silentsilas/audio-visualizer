import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PointLight,
  Float32BufferAttribute,
  AudioListener,
  AudioAnalyser,
  Clock,
} from "three";
import { LoadAudio } from "./audio";
import { LoadModel } from "./model";

const GLOBAL = {
  renderer: null,
  scene: null,
  camera: null,
  light: null,
  hand: null,
  positions: null,
  distortionLevel: null,
  audioListener: null,
  audioAnalyser: null,
  clock: null,
};
const avg = (list) => list.reduce((prev, curr) => prev + curr) / list.length;

init().then(() => animate());

async function init() {
  const container = document.getElementById("container");

  GLOBAL.scene = new Scene();
  GLOBAL.camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  GLOBAL.camera.position.z = 3;

  GLOBAL.light = new PointLight(0x119911, 1);
  GLOBAL.light.counter = 0;
  GLOBAL.light.position.set(0, 0.15, 0.15);
  GLOBAL.scene.add(GLOBAL.light);

  GLOBAL.renderer = new WebGLRenderer();
  GLOBAL.renderer.setPixelRatio(window.devicePixelRatio);
  GLOBAL.renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(GLOBAL.renderer.domElement);
  window.addEventListener("resize", onWindowResize);

  GLOBAL.audioListener = new AudioListener();
  GLOBAL.scene.add(GLOBAL.audioListener);

  GLOBAL.clock = new Clock();

  try {
    const model = await LoadModel();
    initializeModel(model);

    const audio = await LoadAudio(GLOBAL.audioListener);
    initializeAudio(audio);

    const startButton = document.getElementById("startButton");
    startButton.style.display = "block";
    startButton.addEventListener("click", () => {
      audio.play();
      startButton.remove();
    });
  } catch (err) {
    console.warn(err);
  }
}

function initializeAudio(audio) {
  GLOBAL.audioAnalyser = new AudioAnalyser(audio, 512);
}

function initializeModel(model) {
  // remove second hand with text above it
  const objToRemove = model.scene.getObjectByName("Object_3");
  objToRemove.parent.remove(objToRemove);

  // turn remaining hand into wireframe
  GLOBAL.hand = model.scene.getObjectByName("Object_4");
  GLOBAL.hand.material.wireframe = true;

  // set up distortion for each vertex
  GLOBAL.hand.originalPositions = GLOBAL.hand.geometry.getAttribute("position");
  GLOBAL.hand.distortions = GLOBAL.hand.originalPositions.array
    .slice(0)
    .map(() => Math.random() * 2 - 1);
  GLOBAL.positions = GLOBAL.hand.geometry.getAttribute("position");

  // center hand in scene
  GLOBAL.hand.position.x = GLOBAL.hand.position.x + 1.5;

  GLOBAL.scene.add(model.scene);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = GLOBAL.clock.getDelta();

  const soundArray = GLOBAL.audioAnalyser.getFrequencyData();
  const soundAvg = avg(soundArray) / soundArray.length;

  render(delta, Math.pow(soundAvg * 5, 5));
}

function render(delta, soundAvg) {
  // modulate light intensity between 0.5 and 1.5
  GLOBAL.light.counter += delta + 0.02;
  GLOBAL.light.intensity = Math.sin(GLOBAL.light.counter) / 2 + 1;

  const newPositions = new Float32BufferAttribute(
    GLOBAL.positions.array.map((_position, index) => {
      const distortion = GLOBAL.hand.distortions[index] * soundAvg;
      return distortion / 10 + GLOBAL.hand.originalPositions.array[index];
    }),
    3
  );

  GLOBAL.hand.geometry.setAttribute("position", newPositions);
  GLOBAL.renderer.render(GLOBAL.scene, GLOBAL.camera);
}

function onWindowResize() {
  GLOBAL.camera.aspect = window.innerWidth / window.innerHeight;
  GLOBAL.camera.updateProjectionMatrix();

  GLOBAL.renderer.setSize(window.innerWidth, window.innerHeight);
}
