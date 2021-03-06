import { WebGL1Renderer, Scene, BoxBufferGeometry, MeshLambertMaterial, Color, Mesh, WebGLCubeRenderTarget, CubeCamera, LinearMipmapLinearFilter, Object3D, Vector3, BackSide, PointLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import fisheyeShader from './fisheye';

const canvas = document.querySelector('canvas');
const fovInput: HTMLInputElement | null = document.querySelector('#fov');
const keys: Record<string, boolean> = {};

start();

async function start() {
  if (!canvas) {
    throw new Error('Canvas could not be found');  
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scene = new Scene();
  const player = new Object3D();
  player.position.set(0, 0, -2);
  scene.add(player);

  const cubeRenderTarget = new WebGLCubeRenderTarget(
    1024,
    { generateMipmaps: true, minFilter: LinearMipmapLinearFilter }
  );
  const cubeCamera = new CubeCamera( 0.01, 100, cubeRenderTarget );
  player.add(cubeCamera);

  const sceneLight = new PointLight(0xffffff, 1.0);
  sceneLight.position.set(0, 3, 0);
  player.add(sceneLight);

  const roomGeo = new BoxBufferGeometry(20, 20, 20);
  const roomMat = new MeshLambertMaterial({ color: new Color(0x0000ff), side: BackSide });
  const roomMesh = new Mesh(roomGeo, roomMat);
  scene.add(roomMesh);

  const cubeGeo = new BoxBufferGeometry();
  const cubeMat = new MeshLambertMaterial({ color: new Color(0xff0000)});
  for (let i=0; i<30; i++) {
    const cubeMesh = new Mesh(cubeGeo, cubeMat);
    const scale = Math.random() * 3 + 0.5;
    cubeMesh.scale.set(scale, scale, scale);
    cubeMesh.position.set(
      Math.random() * 20 - 10,
      Math.random() * 20 - 10,
      Math.random() * 20 - 10,
    );
    scene.add(cubeMesh);
  }

  const renderer = new WebGL1Renderer({ canvas });
  const composer = new EffectComposer(renderer);
  const fisheyePass = new ShaderPass(fisheyeShader);
  fisheyePass.uniforms.fov.value = Number(fovInput?.value || 90);
  fisheyePass.uniforms.aspect.value = window.innerWidth / window.innerHeight;
  fisheyePass.uniforms.cubemap.value = cubeRenderTarget.texture;
  composer.addPass(fisheyePass);
  
  window.addEventListener( 'resize', onWindowResize );
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  fovInput?.addEventListener('input', onFOVInput)
  console.log('Starting scene...')
  animate();

  function animate () {
    requestAnimationFrame(animate);
    movePlayer();
    cubeCamera.update(renderer, scene);
    composer.render();
  }

  function onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    fisheyePass.uniforms.aspect.value = window.innerWidth / window.innerHeight;
    composer.setSize( window.innerWidth, window.innerHeight );
  }

  function onKeyDown(evt: KeyboardEvent) {
    keys[evt.key] = true;
  }

  function onKeyUp(evt: KeyboardEvent) {
    keys[evt.key] = false;
  }

  function onFOVInput () {
    fisheyePass.uniforms.fov.value = Number(fovInput?.value || 90);
  }

  function movePlayer() {
    const playerDir = player.getWorldDirection(new Vector3());
    if (keys['a']) {
      player.rotateY(-0.05);
    }
    if (keys['d']) {
      player.rotateY(0.05);
    }
    if (keys['w']) {
      player.position.add(playerDir.multiplyScalar(0.05));
    }
    if (keys['s']) {
      player.position.add(playerDir.multiplyScalar(-0.05));
    }
    if (keys['q']) {
      player.position.add(new Vector3(0, 0.1, 0));
    }
    if (keys['z']) {
      player.position.add(new Vector3(0, -0.1, 0));
    }
  }
}
