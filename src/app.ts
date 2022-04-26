import { WebGL1Renderer, Scene, PerspectiveCamera, BoxBufferGeometry, MeshLambertMaterial, Color, HemisphereLight, Mesh, WebGLCubeRenderTarget, CubeCamera, LinearMipmapLinearFilter, Object3D, Vector3, BackSide, PointLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// https://github.com/FredKSchott/snowpack/issues/3867#issuecomment-1064298483


import fisheyeShader from './fisheye';

const canvas = document.querySelector('canvas');
const keys: Record<string, boolean> = {};
const FOV = 180;

start();

async function start() {
  if (!canvas) {
    throw new Error('Canvas could not be found');  
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scene = new Scene();
  const player = new Object3D();
  player.position.set(0, 0, -3);
  scene.add(player);

  const cubeRenderTarget = new WebGLCubeRenderTarget(
    1024,
    { generateMipmaps: true, minFilter: LinearMipmapLinearFilter }
  );
  const cubeCamera = new CubeCamera( 0.01, 100, cubeRenderTarget );
  player.add(cubeCamera);

  const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.rotateY(Math.PI);
  player.add(camera);

  const useCube = true;

  const sceneLight = new PointLight(0xffffff, 1.0);
  sceneLight.position.set(0, 3, 0);
  player.add(sceneLight);

  const roomGeo = new BoxBufferGeometry(20, 20, 20);
  const roomMat = new MeshLambertMaterial({ color: new Color(0x0000ff), side: BackSide });
  const roomMesh = new Mesh(roomGeo, roomMat);
  scene.add(roomMesh);

  const cubeGeo = new BoxBufferGeometry();
  const cubeMat = new MeshLambertMaterial({ color: new Color(0xff0000)});
  for (let i=0; i<10; i++) {
    const cubeMesh = new Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(2 * (i - 5) + 0.5, 0, 0);
    scene.add(cubeMesh);
  }

  const renderer = new WebGL1Renderer({ canvas });
  let composer: EffectComposer | undefined;
  let fisheyePass: ShaderPass | undefined;

  if (useCube) {
    composer = new EffectComposer(renderer);
    fisheyePass = new ShaderPass(fisheyeShader);
    fisheyePass.uniforms.fov.value = FOV;
    fisheyePass.uniforms.aspect.value = window.innerWidth / window.innerHeight;
    fisheyePass.uniforms.cubemap.value = cubeRenderTarget.texture;
    composer.addPass(fisheyePass);
  }
  
  window.addEventListener( 'resize', onWindowResize );
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  console.log('Starting scene...')
  animate();

  function animate () {
    requestAnimationFrame(animate);
    movePlayer();
    cubeCamera.update(renderer, scene);
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  function onWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    if (composer && fisheyePass) {
      fisheyePass.uniforms.aspect.value = window.innerWidth / window.innerHeight;
      composer.setSize( window.innerWidth, window.innerHeight );
    } else {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  }

  function onKeyDown(evt: KeyboardEvent) {
    keys[evt.key] = true;
  }

  function onKeyUp(evt: KeyboardEvent) {
    keys[evt.key] = false;
  }

  function movePlayer() {
    if (keys['a']) {
      player.position.add(new Vector3(-0.1, 0, 0));
    }
    if (keys['d']) {
      player.position.add(new Vector3(0.1, 0, 0));
    }
    if (keys['w']) {
      player.position.add(new Vector3(0, 0.1, 0));
    }
    if (keys['s']) {
      player.position.add(new Vector3(0, -0.1, 0));
    }
  }
}