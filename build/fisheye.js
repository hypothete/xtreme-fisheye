export default {
  uniforms: {
    cubemap: {value: null},
    fov: {value: 90},
    aspect: {value: 1}
  },
  vertexShader: `
  varying vec2 vUV;

  void main() {
    vUV = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `,
  fragmentShader: `
  #define PI 3.14159

  uniform samplerCube cubemap;
  varying vec2 vUV;
  uniform float fov;
  uniform float aspect;

  void main() {
    vec2 ndc = 2.0 * (vUV - 0.5); // -1 to 1
    float fovy = PI * (fov / 180.0) / 4.0;
    float fovx = fovy * aspect;
    ndc *= vec2(fovx, fovy);

    // ported from blinky's latlon_to_ray method
    float clat = cos(ndc.y);
    vec3 rd = normalize(vec3(
      sin(ndc.x) * clat,
      sin(ndc.y),
      cos(ndc.x) * clat
    ));

    gl_FragColor = vec4(textureCube(cubemap, rd).rgb, 1.0);
  }
  `
};
