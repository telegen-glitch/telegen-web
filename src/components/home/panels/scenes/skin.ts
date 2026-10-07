import { context, fit, FULLSCREEN_VS, GRADE, program, release, type Scene, type SceneOptions } from "./gl";

/**
 * Acnee: "calming skin". A full-panel skin surface in one fragment shader:
 * procedural pores (cellular noise), fine micro-relief (fbm) and a soft
 * low-frequency undulation give a height field; its normal is lit with a wrapped
 * diffuse term (a cheap stand-in for subsurface softness) and a faint, broad
 * sheen, never a plastic highlight. Story: a few soft, slightly raised areas with
 * a restrained rose tint flatten and fade to an even tone while a light sweeps
 * across, over about 7 s. Afterwards the skin stays calm; only the light moves.
 */

const SPOTS = 6;

const FS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uKey;      // key light position (scene units) and height
uniform vec3 uSweep;    // sweep light x, y and intensity
uniform vec4 uSpots[${SPOTS}]; // x, y (scene units), radius, amplitude
out vec4 o;
${GRADE}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 19.19));
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), w.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), w.x), w.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 7.1;
    a *= 0.5;
  }
  return s;
}
// Cellular noise (pores): distances to the nearest and second-nearest feature points.
vec2 worley(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(x, y);
      vec2 c = g + 0.5 + 0.4 * sin(6.2831 * hash2(i + g)) - f;
      float d = dot(c, c);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return sqrt(vec2(d1, d2));
}

float spots(vec2 q, float spread) {
  float s = 0.0;
  for (int i = 0; i < ${SPOTS}; i++) {
    vec2 d = q - uSpots[i].xy;
    float r = uSpots[i].z * spread;
    s += exp(-dot(d, d) / (r * r)) * uSpots[i].w;
  }
  return s;
}

// Height field. Real skin microrelief is two families of fine, shallow furrows
// crossing at an angle (a soft rhomboid pattern), with pores where they meet,
// over a gentle undulation. Lines are warped and broken, never a crisp grid.
float furrows(vec2 q, vec2 dir, float freq, float seed) {
  float w = fbm(q * 5.0 + seed) * 1.4;
  float v = dot(q, dir) * freq + w;
  float line = 1.0 - smoothstep(0.0, 0.32, abs(fract(v) - 0.5) * 2.0 - 0.68);
  return line * smoothstep(0.3, 0.7, fbm(q * 7.0 + seed * 3.0));
}
float height(vec2 q, out float pore) {
  float f1 = furrows(q, normalize(vec2(0.82, 0.57)), 16.0, 1.3);
  float f2 = furrows(q, normalize(vec2(-0.6, 0.8)), 14.0, 4.1);
  vec2 pr = worley(q * 9.0 + 2.7);
  float poreMask = smoothstep(0.4, 0.65, vnoise(q * 7.0 + 9.3) + 0.2);
  pore = (1.0 - smoothstep(0.0, 0.12, pr.x)) * poreMask * 0.8;
  float soft = fbm(q * 2.5 + 3.1);
  float micro = fbm(q * 70.0);
  return soft * 0.3 - (f1 + f2) * 0.012 - pore * 0.045 + micro * 0.012 + spots(q, 1.0) * 0.3;
}

void main() {
  vec2 q = gl_FragCoord.xy / uRes.y;
  float e = 1.0 / uRes.y;
  float pore;
  float tmp;
  float h = height(q, pore);
  float hx = height(q + vec2(e, 0.0), tmp);
  float hy = height(q + vec2(0.0, e), tmp);
  vec3 n = normalize(vec3((h - hx) / e * 0.075, (h - hy) / e * 0.075, 1.0));

  vec3 L = normalize(vec3(uKey.xy - q, uKey.z));
  float wrap = 0.45;
  float diff = clamp((dot(n, L) + wrap) / (1.0 + wrap), 0.0, 1.0);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float sheen = pow(max(dot(n, H), 0.0), 18.0) * 0.06;

  vec3 L2 = normalize(vec3(uSweep.xy - q, 0.32));
  float sweep = clamp((dot(n, L2) + 0.3) / 1.3, 0.0, 1.0) * exp(-pow((q.x - uSweep.x) * 2.2, 2.0)) * uSweep.z;

  vec2 uv = gl_FragCoord.xy / uRes;
  float vig = smoothstep(1.2, 0.35, length((uv - vec2(0.45, 0.6)) * vec2(0.9, 1.25)));
  float s = 0.56 + 0.3 * diff + sheen + sweep * 0.07 - pore * 0.05 - (1.0 - vig) * 0.06;
  vec3 col = grade(s);

  // Restrained warm rose on the raised areas: low saturation, the only warm colour.
  float tint = clamp(spots(q, 1.35), 0.0, 1.0);
  vec3 rose = vec3(0.86, 0.64, 0.68);
  col = mix(col, col * rose * 1.1, tint * 0.6);

  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  o = vec4(col, 1.0);
}`;

/** Raised areas: [x (0..1 of width), y (0..1 of height), radius, start fading, end fading]. */
const AREAS: [number, number, number, number, number][] = [
  [0.18, 0.62, 0.075, 0.6, 6.4],
  [0.31, 0.3, 0.06, 1.0, 6.9],
  [0.47, 0.7, 0.07, 1.4, 7.2],
  [0.58, 0.36, 0.055, 1.8, 7.5],
  [0.72, 0.6, 0.065, 2.1, 7.8],
  [0.86, 0.32, 0.05, 2.4, 8.0],
];

export function create(canvas: HTMLCanvasElement, opts: SceneOptions): Scene | null {
  const gl = context(canvas, opts);
  if (!gl) return null;
  const prog = program(gl, FULLSCREEN_VS, FS);
  const vao = gl.createVertexArray();
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const loc = { res: u("uRes"), time: u("uTime"), key: u("uKey"), sweep: u("uSweep"), spots: u("uSpots") };
  const spots = new Float32Array(SPOTS * 4);
  const pointer = { x: 0, y: 0, s: 0, active: false };
  // Key light from the top left (same as the hair scene), drifting very slowly.
  const key = { x: 0, y: 0 };
  fit(gl, canvas, opts.dprCap);

  return {
    render(t) {
      fit(gl, canvas, opts.dprCap);
      const w = canvas.width;
      const h = canvas.height;
      const aspect = w / h;
      AREAS.forEach(([x, y, r, a, b], i) => {
        const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
        spots[i * 4] = x * aspect;
        spots[i * 4 + 1] = y;
        spots[i * 4 + 2] = r;
        spots[i * 4 + 3] = 1 - k * k * (3 - 2 * k);
      });
      const baseX = aspect * (0.22 + 0.06 * Math.sin(t * 0.07));
      const baseY = 1.15 + 0.05 * Math.sin(t * 0.05 + 1);
      pointer.s += ((pointer.active ? 1 : 0) - pointer.s) * 0.05;
      const tx = baseX + (pointer.x * aspect - baseX) * pointer.s;
      const ty = baseY + (pointer.y + 0.35 - baseY) * pointer.s;
      key.x = key.x ? key.x + (tx - key.x) * 0.08 : tx;
      key.y = key.y ? key.y + (ty - key.y) * 0.08 : ty;
      // The sweep crosses during the story, then fades out.
      const sweepX = aspect * (-0.1 + 1.2 * Math.min(1, t / 8));
      const sweepI = Math.sin(Math.min(1, t / 8.5) * Math.PI);

      gl.useProgram(prog);
      gl.uniform2f(loc.res, w, h);
      gl.uniform1f(loc.time, t);
      gl.uniform3f(loc.key, key.x, key.y, 1.3);
      gl.uniform3f(loc.sweep, sweepX, 0.55, sweepI);
      gl.uniform4fv(loc.spots, spots);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    setPointer(x, y, active) {
      pointer.x = x;
      pointer.y = 1 - y;
      pointer.active = active;
    },
    resize() {
      fit(gl, canvas, opts.dprCap);
    },
    dispose() {
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      release(gl);
    },
  };
}
