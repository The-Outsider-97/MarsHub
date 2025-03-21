  //3D Animation
  let scene, camera, renderer, mars, clock;

function initMars3D() {
  const container = document.getElementById('mars3DContainer');

  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Load Mars Model
  const loader = new THREE.GLTFLoader();
  loader.load('../models/mars.glb', function(gltf) {
    mars = gltf.scene;
    scene.add(mars);
  }, undefined, function(error) {
    console.error('An error happened while loading mars.glb', error);
  });

  camera.position.z = 3;
  clock = new THREE.Clock();

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (mars) {
    const elapsed = clock.getElapsedTime();
    mars.rotation.y = (elapsed / 60) * Math.PI * 2; // 360° in 60 seconds
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  const container = document.getElementById('mars3DContainer');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', initMars3D);
