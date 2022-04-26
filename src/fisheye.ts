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
    float fovx = PI * (fov / 360.0);
    float fovy = fovx / aspect;

    ndc *= vec2(fovx, fovy);
    ndc.y = clamp(ndc.y, -PI / 2.0, PI / 2.0);

    // ported from blinky's latlon_to_ray method
    float clat = cos(ndc.y);
    vec3 rd = normalize(vec3(
      sin(ndc.x) * clat,
      sin(ndc.y),
      cos(ndc.x) * clat
    ));

    gl_FragColor = vec4(textureCube(cubemap, rd).rgb, 1.0);
  }
  `,
}