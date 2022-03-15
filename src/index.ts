import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PointLight,
  Float32BufferAttribute,
  AudioListener,
  AudioAnalyser,
  Clock,
  Mesh,
  MeshBasicMaterial,
  MathUtils,
  BufferGeometry,
  Points,
  SphereGeometry,
} from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { calculateSoundAverages, LoadAudio } from "./audio";
import { LoadModel } from "./model";
import { SETTINGS } from "./settings";
import { CORE, DISTORTION, DistortionMesh, SoundAverages, SRT } from "./types";
import { prng_alea } from "esm-seedrandom";
import parseSRT from "parse-srt";

const CORE: CORE = {
  renderer: null,
  scene: null,
  camera: null,
  clock: null,
  rng: prng_alea(
    "Polka-Jovial-Makeover-Wieldable-Spirited-Footprint-Recall-Handpick-Sacrifice-Jester"
  ),
  avgs: null,
  subtitleDiv: document.getElementById("subtitles"),
  parser: parseSRT,
  srt: null,
  elapsedTime: 0,
  playing: false,
};

const DISTORTION: DISTORTION = {
  light: null,
  hand: null,
  positions: null,
  audioListener: null,
  audioAnalyser: null,
};

const ROTATION = {
  cam: {
    angle: 0,
    angularSpeed: MathUtils.degToRad(20),
    radius: 5,
  },
  light: {
    angle: 30,
    angularSpeed: MathUtils.degToRad(40),
    radius: 2,
  },
};

init().then(() => animate());

async function init() {
  const container = document.getElementById("container");

  CORE.scene = new Scene();
  CORE.camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  CORE.scene.add(CORE.camera);

  DISTORTION.light = new PointLight(0x119911, 1);
  DISTORTION.light.counter = 0;

  const geometry = new SphereGeometry(0.2);
  const material = new MeshBasicMaterial({ color: 0xcccc00 });
  const sphere = new Mesh(geometry, material);
  DISTORTION.light.add(sphere);
  CORE.scene.add(DISTORTION.light);

  CORE.renderer = new WebGLRenderer();
  CORE.renderer.setPixelRatio(window.devicePixelRatio);
  CORE.renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(CORE.renderer.domElement);
  window.addEventListener("resize", onWindowResize);

  DISTORTION.audioListener = new AudioListener();
  CORE.scene.add(DISTORTION.audioListener);

  CORE.clock = new Clock();

  try {
    const model = await LoadModel();
    initializeModel(model);
    updateRotations(0);
    initializeStars();

    const audio = await LoadAudio(
      DISTORTION.audioListener,
      "/static/who_am_i_with_music.mp3",
      1
    );
    audio.onEnded = () => {
      document.getElementById("credits").style.display = "block";
    };
    CORE.srt = await loadSRT();
    DISTORTION.audioAnalyser = new AudioAnalyser(audio, 512);

    const startButton = document.getElementById("startButton");
    startButton.style.display = "block";
    startButton.addEventListener("click", () => {
      audio.play();
      CORE.playing = true;
      startButton.remove();
    });
  } catch (err) {
    console.warn(err);
  }
}

async function loadSRT(): Promise<SRT[]> {
  const response = await fetch("static/who_am_i_with_music.srt");
  const responseText = await response.text();
  return CORE.parser(responseText);
}

function initializeModel(model: GLTF) {
  // remove second hand with text above it
  const objToRemove = model.scene.getObjectByName("Object_3");
  objToRemove.parent.remove(objToRemove);

  // turn remaining hand into wireframe
  DISTORTION.hand = <DistortionMesh>model.scene.getObjectByName("Object_4");
  DISTORTION.hand.material.wireframe = true;

  // set up distortion for each vertex
  DISTORTION.hand.originalPositions =
    DISTORTION.hand.geometry.getAttribute("position");
  DISTORTION.hand.distortions = (
    DISTORTION.hand.originalPositions.array as Array<number>
  )
    .slice(0)
    .map(() => CORE.rng() * 2 - 1);
  DISTORTION.positions = DISTORTION.hand.geometry.getAttribute("position");
  DISTORTION.hand.parent.position.x = DISTORTION.hand.parent.position.x + 2.8;
  DISTORTION.hand.parent.position.y = DISTORTION.hand.parent.position.y + 0;
  DISTORTION.hand.parent.position.z = DISTORTION.hand.parent.position.z + 2.2;
  DISTORTION.hand.parent.rotateZ(Math.PI / 2);
  DISTORTION.hand.geometry.center();

  CORE.scene.add(model.scene);
}

function initializeStars() {
  const geometry = new BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = CORE.rng() * 2000 - 1000;
    const y = CORE.rng() * 2000 - 1000;
    const z = CORE.rng() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  const points = new Points(geometry);
  CORE.scene.add(points);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = CORE.clock.getDelta();
  CORE.avgs = calculateSoundAverages(DISTORTION.audioAnalyser);

  render(delta, CORE.avgs);
}

function render(delta: number, soundAvg: SoundAverages) {
  // modulate light intensity
  DISTORTION.light.counter += delta + SETTINGS.lightSpeed;
  DISTORTION.light.intensity =
    Math.sin(DISTORTION.light.counter) / 2 + SETTINGS.lightMin;

  const sound = Math.pow(
    soundAvg.soundAvg * SETTINGS.distortionMax,
    SETTINGS.distortionPower
  );

  if (CORE.playing) {
    updateRotations(delta);
    updateSubtitles(delta);
  }
  const newPositions = new Float32BufferAttribute(
    (DISTORTION.positions.array as Array<number>).map((_position, index) => {
      const distortion = DISTORTION.hand.distortions[index] * sound;
      return distortion / 10 + DISTORTION.hand.originalPositions.array[index];
    }),
    3
  );

  DISTORTION.hand.geometry.setAttribute("position", newPositions);
  CORE.camera.lookAt(DISTORTION.hand.position);
  CORE.renderer.render(CORE.scene, CORE.camera);
}

function updateRotations(delta: number) {
  DISTORTION.hand.parent.rotateZ(3 / 1000);

  CORE.camera.position.x = Math.sin(ROTATION.cam.angle) * ROTATION.cam.radius;
  CORE.camera.position.z = Math.cos(ROTATION.cam.angle) * ROTATION.cam.radius;
  CORE.camera.position.y = Math.cos(ROTATION.cam.angle) * 1.5;
  ROTATION.cam.angle += ROTATION.cam.angularSpeed * delta;

  DISTORTION.light.position.x =
    Math.cos(ROTATION.light.angle) * ROTATION.light.radius;
  DISTORTION.light.position.z =
    Math.sin(ROTATION.light.angle) * ROTATION.light.radius;
  DISTORTION.light.position.y = Math.cos(ROTATION.light.angle) * 5;

  ROTATION.light.angle += ROTATION.light.angularSpeed * delta;
}

function updateSubtitles(delta: number) {
  CORE.elapsedTime += delta;
  let found = false;
  CORE.srt.forEach((srt) => {
    if (CORE.elapsedTime > srt.start && CORE.elapsedTime < srt.end) {
      found = true;
      CORE.subtitleDiv.innerHTML = srt.text;
    }
  });

  if (!found) CORE.subtitleDiv.innerHTML = "";
}

function onWindowResize() {
  CORE.camera.aspect = window.innerWidth / window.innerHeight;
  CORE.camera.updateProjectionMatrix();

  CORE.renderer.setSize(window.innerWidth, window.innerHeight);
}
