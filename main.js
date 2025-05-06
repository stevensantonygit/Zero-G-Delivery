import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

let scene, camera, renderer;
let player, velocity;
let keys = {};

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  const geometry = new THREE.BoxGeometry(1, 1, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
  player = new THREE.Mesh(geometry, material);
  player.position.z = -5;
  scene.add(player);

  velocity = new THREE.Vector3();

  window.addEventListener('resize', onWindowResize);

  document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  handleMovement();

  camera.position.copy(player.position).add(new THREE.Vector3(0, 2, 5));
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

function handleMovement() {
  const acceleration = 0.02;

  if (keys['w']) velocity.z -= acceleration;
  if (keys['s']) velocity.z += acceleration;
  if (keys['a']) velocity.x -= acceleration;
  if (keys['d']) velocity.x += acceleration;
  if (keys[' ']) velocity.y += acceleration;
  if (keys['shift']) velocity.y -= acceleration;

  velocity.multiplyScalar(0.98); // damping

  player.position.add(velocity);
}
