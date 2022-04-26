export default {
  uniforms: {
    'cubemap': { value: null },
    'fov': { value: 90.0 },
    'aspect': { value: 1.0 },
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
    float fovy = PI * (fov / 180.0) / 2.0;
    float fovx = fovy * aspect;

    // ported from https://github.com/shaunlebron/blinky/blob/master/engine/NQ/fisheye.c
    float clat = cos(ndc.y * fovy);
    vec3 rd = normalize(vec3(
      sin(ndc.x * fovx) * clat,
      sin(ndc.y * fovy),
      cos(ndc.x * fovx) * clat
    ));

    gl_FragColor = vec4(rd, 1.0);
    gl_FragColor = vec4(textureCube(cubemap, rd).rgb, 1.0);
  }
  `,
}