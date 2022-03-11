import { Scene, PerspectiveCamera, WebGLRenderer, PointLight } from "three";
import { Load } from "./model";

let renderer, scene, camera, light;
init().then(() => animate());

async function init() {
  const container = document.getElementById("container");

  scene = new Scene();
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 5;

  light = new PointLight(0x119911, 0);
  light.counter = 0;
  light.position.set(0, 0.2, 0.2);
  scene.add(light);

  renderer = new WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize);

  try {
    const gltf = await Load();
    document.getElementById("loader").innerHTML = "";

    // remove second hand with text above it
    const objToRemove = gltf.scene.getObjectByName("Object_3");
    objToRemove.parent.remove(objToRemove);

    // turn remaining hand into wireframe
    const hand = gltf.scene.getObjectByName("Object_4");
    hand.material.wireframe = true;

    // center hand in scene
    hand.position.x = hand.position.x + 1.5;

    scene.add(gltf.scene);
  } catch (err) {
    console.warn(err);
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  // modulate light intensity between 0.5 and 1.5
  light.counter += 0.01;
  light.intensity = Math.sin(light.counter) / 2 + 1;
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
