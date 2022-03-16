import {
  Scene,
  WebGLRenderer,
  PointLight,
  Float32BufferAttribute,
  AudioListener,
  AudioAnalyser,
  Clock,
  BufferGeometry,
  Points,
  Color,
  PerspectiveCamera,
} from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { LoadModel } from "./model";
import { prng_alea } from "esm-seedrandom";
import parseSRT from "parse-srt";
import { Planets } from "./actors/Planets";
import { OrbitCamera } from "./actors/OrbitCamera";
import { Hand } from "./actors/Hand";
import { OrbitLight } from "./actors/OrbitLight";
import { Jukebox } from "./actors/Jukebox";

const CORE: CORE = {
  renderer: null,
  scene: null,
  clock: null,
  rng: prng_alea(
    "Polka-Jovial-Makeover-Wieldable-Spirited-Footprint-Recall-Handpick-Sacrifice-Jester"
  ),
  playing: false,
  audioListener: null,
};

let ORBIT_CAMERA: OrbitCamera;
let ORBIT_LIGHT: OrbitLight;
let HAND: Hand;
let PLANETS: Planets;
let JUKEBOX: Jukebox;

init().then(() => animate());

async function init() {
  const container = document.getElementById("container");

  CORE.scene = new Scene();
  ORBIT_CAMERA = new OrbitCamera(
    new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  );
  CORE.scene.add(ORBIT_CAMERA.camera);
  CORE.audioListener = new AudioListener();
  ORBIT_CAMERA.camera.add(CORE.audioListener);

  ORBIT_LIGHT = new OrbitLight(new PointLight(new Color(1, 1, 1), 2, 10));
  CORE.scene.add(ORBIT_LIGHT.light);

  CORE.renderer = new WebGLRenderer();
  CORE.renderer.setPixelRatio(window.devicePixelRatio);
  CORE.renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(CORE.renderer.domElement);
  window.addEventListener("resize", onWindowResize);

  CORE.clock = new Clock();

  try {
    JUKEBOX = new Jukebox(parseSRT, CORE.audioListener);
    const { music, musicAnalyser, poem, poemAnalyser } =
      await JUKEBOX.initializeAudio(() => {
        CORE.playing = true;
      });
    CORE.scene.add(poem);
    ORBIT_LIGHT.light.add(music);
    const model = await LoadModel();
    initializeModel(model, poemAnalyser);
    initializeStars();
    ORBIT_CAMERA.update(0, HAND.mesh.position);
    PLANETS = new Planets(musicAnalyser);
    PLANETS.meshes.forEach((planet) => CORE.scene.add(planet));
  } catch (err) {
    console.warn(err);
  }
}

function initializeModel(model: GLTF, analyser: AudioAnalyser) {
  // remove second hand with text above it
  const objToRemove = model.scene.getObjectByName("Object_3");
  objToRemove.parent.remove(objToRemove);

  HAND = new Hand(model.scene.getObjectByName("Object_4"));
  HAND.initialize(CORE.rng, analyser);
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
  render(delta);
}

function render(delta: number) {
  if (CORE.playing) {
    ORBIT_LIGHT.update(delta);
    HAND.update();
    JUKEBOX.update(delta);
    PLANETS.updatePlanets(delta);
  }

  CORE.renderer.render(CORE.scene, ORBIT_CAMERA.camera);
  ORBIT_CAMERA.update(delta, HAND.mesh.position);
}

function onWindowResize() {
  ORBIT_CAMERA.camera.aspect = window.innerWidth / window.innerHeight;
  ORBIT_CAMERA.camera.updateProjectionMatrix();

  CORE.renderer.setSize(window.innerWidth, window.innerHeight);
}

interface CORE {
  renderer: WebGLRenderer;
  scene: Scene;
  clock: Clock;
  rng: RandomNumberGenerator;
  playing: boolean;
  audioListener: AudioListener;
}

export type RandomNumberGenerator = {
  (): number;
};
