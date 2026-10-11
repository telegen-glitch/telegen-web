import {
  context,
  fit,
  FULLSCREEN_VS,
  GRADE,
  KEY_LIGHT,
  program,
  release,
  rng,
  type Scene,
  type SceneOptions,
} from "./gl";

/**
 * Căderea părului: "falling, then growing back". A field of tapered hair strands
 * rising from the bottom edge, drawn as instanced ribbons. Each strand is built in
 * the vertex shader (no per-frame CPU work): a gently bent arc with a slight curl,
 * low-frequency wind with its own phase, and a Kajiya-Kay style anisotropic
 * highlight band that slides slowly. Three depth layers, the back ones lighter and
 * softer. Story: a few strands detach and drift down like feathers, then new
 * strands grow in the gaps until the field is fuller than at the start. After that
 * only the sway remains, with a rare single strand shed and regrown.
 */

const SEG = 18; // segments per strand
const STRIDE = 12; // floats per instance

const VS = /* glsl */ `#version 300 es
precision highp float;
layout(location=0) in vec4 aA; // rootX (0..1), length, curl, phase
layout(location=1) in vec4 aB; // layer, tone, width, tilt
layout(location=2) in vec4 aC; // detachAt, growAt, drift side, bend
uniform float uTime;
uniform float uAspect;
uniform float uPx;       // one device pixel in scene units
uniform vec3 uPointer;   // x, y (scene units), strength
uniform vec2 uShed;      // instance, start time
out float vT;
out float vSide;
out vec2 vTan;
out float vLayer;
out float vTone;
out float vAlpha;
out float vShift;
out float vFall;

const float SEG = ${SEG.toFixed(1)};

void main() {
  int i = gl_VertexID >> 1;
  float t = float(i) / SEG;
  float side = (gl_VertexID & 1) == 0 ? -1.0 : 1.0;

  float rootX = aA.x * uAspect;
  float len = aA.y;
  float phase = aA.w;
  float layer = aB.x;
  float tilt = aB.w;

  // Growth (new strands) and the rare shed-and-regrow strand.
  float grow = aC.y < 0.0 ? 1.0 : smoothstep(0.0, 1.0, clamp((uTime - aC.y) / 4.0, 0.0, 1.0));
  float detachAt = aC.x;
  if (gl_InstanceID == int(uShed.x)) {
    detachAt = uShed.y;
    float regrow = clamp((uTime - uShed.y - 6.0) / 4.0, 0.0, 1.0);
    if (regrow > 0.0) {
      detachAt = -1.0;
      grow = smoothstep(0.0, 1.0, regrow);
    }
  }
  len *= max(grow, 0.0001);

  // Wind: low-frequency, per-strand phase, stronger towards the tip.
  float wind = 0.10 * sin(uTime * 0.42 + rootX * 1.7 + phase)
             + 0.05 * sin(uTime * 0.77 + rootX * 3.1)
             + 0.025 * sin(uTime * 1.9 + phase * 1.7);

  // Pointer: strands near it lean away with a soft spring (strength eased on the CPU).
  vec2 mid = vec2(rootX, len * 0.5);
  vec2 dp = mid - uPointer.xy;
  float push = uPointer.z * exp(-dot(dp, dp) / 0.045);
  float a0 = tilt;
  float k = aC.w + wind * 1.4 + push * sign(dp.x) * 1.8;
  float a = a0 + k * t;

  // Arc integral of (sin a, cos a) along the strand.
  vec2 p;
  if (abs(k) < 1e-3) {
    p = vec2(sin(a0), cos(a0)) * len * t;
  } else {
    p = vec2(cos(a0) - cos(a), sin(a) - sin(a0)) * (len / k);
  }
  vec2 tangent = vec2(sin(a), cos(a));
  vec2 normal = vec2(-tangent.y, tangent.x);
  // Slight natural curl.
  p += normal * aA.z * sin(t * 7.0 + phase) * t * 0.6;
  vec2 pos = vec2(rootX, -0.02) + p;

  // Falling strands: rigid drift down like a feather, turning slowly, fading near the bottom.
  float alpha = 1.0;
  if (detachAt > 0.0 && uTime > detachAt) {
    float f = clamp((uTime - detachAt) / 6.5, 0.0, 1.0);
    float fe = f * f * (3.0 - 2.0 * f);
    vec2 pivot = vec2(rootX, -0.02) + vec2(0.0, len * 0.5);
    float rot = fe * 1.1 * (aC.z > 0.0 ? 1.0 : -1.0);
    vec2 r = pos - pivot;
    pos = pivot + vec2(r.x * cos(rot) - r.y * sin(rot), r.x * sin(rot) + r.y * cos(rot));
    tangent = vec2(tangent.x * cos(rot) - tangent.y * sin(rot), tangent.x * sin(rot) + tangent.y * cos(rot));
    normal = vec2(-tangent.y, tangent.x);
    pos += vec2(aC.z * 0.18 * fe + 0.03 * sin(f * 9.0 + phase), 0.06 * sin(f * 3.14) - fe * (len * 0.75 + 0.15));
    alpha = 1.0 - smoothstep(0.55, 1.0, f);
  }

  // Tapered width: thick at the root, fine at the tip. Back layers are wider and softer (depth of field).
  float layerScale = layer < 0.5 ? 1.6 : (layer < 1.5 ? 1.2 : 1.0);
  bool falling = detachAt > 0.0 && uTime > detachAt;
  float w = mix(2.6, 0.45, pow(t, 0.75)) * aB.z * layerScale * uPx * 0.5 * (falling ? 1.35 : 1.0);
  pos += normal * side * w;

  gl_Position = vec4(pos.x / uAspect * 2.0 - 1.0, pos.y * 2.0 - 1.0, 0.0, 1.0);
  vT = t;
  vSide = side;
  vTan = tangent;
  vLayer = layer;
  vTone = aB.y;
  vAlpha = alpha * (grow > 0.001 ? 1.0 : 0.0) * (layer < 0.5 ? 0.55 : (layer < 1.5 ? 0.8 : 1.0));
  // Highlight band position: slides slowly up and down the field.
  float band = 0.5 + 0.1 * sin(uTime * 0.11) + 0.03 * sin(uTime * 0.29 + 1.3);
  vShift = (pos.y - band) * 2.0 - 0.44 + (aB.y - 0.5) * 0.1;
  vFall = detachAt > 0.0 && uTime > detachAt ? 1.0 : 0.0;
}`;

const FS = /* glsl */ `#version 300 es
precision highp float;
in float vT;
in float vSide;
in vec2 vTan;
in float vLayer;
in float vTone;
in float vAlpha;
in float vShift;
in float vFall;
uniform vec3 uLight;
out vec4 o;
${GRADE}
void main() {
  float fw = max(fwidth(vSide), 1e-3);
  float edge = 1.0 - smoothstep(1.0 - fw * 1.6, 1.0, abs(vSide));
  vec3 T = normalize(vec3(vTan, 0.0));
  vec3 across = vec3(-vTan.y, vTan.x, 0.0) * vSide;
  vec3 N = normalize(across + vec3(0.0, 0.0, sqrt(max(0.0, 1.0 - vSide * vSide))));
  vec3 L = normalize(uLight);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  // Kajiya-Kay: diffuse from the tangent, two shifted specular lobes.
  float tl = dot(T, L);
  float diff = sqrt(max(0.0, 1.0 - tl * tl));
  vec3 t1 = normalize(T + N * vShift);
  vec3 t2 = normalize(T + N * (vShift - 0.22));
  float h1 = dot(t1, H);
  float h2 = dot(t2, H);
  float spec = pow(sqrt(max(0.0, 1.0 - h1 * h1)), 40.0) * 0.42
             + pow(sqrt(max(0.0, 1.0 - h2 * h2)), 12.0) * 0.14;
  float base = mix(0.1, 0.5, smoothstep(0.0, 0.9, vT)) + vTone * 0.08;
  float s = base * (0.62 + 0.38 * diff) * (0.75 + 0.25 * N.z) + spec + vFall * 0.2;
  float haze = vLayer < 0.5 ? 0.55 : (vLayer < 1.5 ? 0.26 : 0.0);
  s = mix(s, 0.84, haze);
  float a = vAlpha * edge * (1.0 - smoothstep(0.8, 1.0, vT));
  o = vec4(grade(s) * a, a);
}`;

/** Mist background with the scalp shadow at the bottom, a soft key light and vignette. */
const BG_FS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
out vec4 o;
${GRADE}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float light = 1.0 - length((uv - vec2(0.15, 1.05)) * vec2(0.7, 1.0)) * 0.35;
  float vig = smoothstep(1.15, 0.35, length((uv - vec2(0.5, 0.55)) * vec2(0.9, 1.3)));
  float scalp = 1.0 - smoothstep(0.0, 0.22, uv.y);
  float s = 0.9 + 0.06 * light - (1.0 - vig) * 0.06 - scalp * 0.22;
  o = vec4(grade(s), 1.0);
}`;

const COUNTS = { high: 1240, mobile: 620, low: 420 } as const;

function instances(quality: SceneOptions["quality"]) {
  const rand = rng(1907);
  const n = COUNTS[quality];
  const growers = Math.round(n * 0.14);
  const rows: number[][] = [];
  // Combed flow shared by neighbouring strands: lean and bend vary slowly across the field.
  const flow = (x: number) => [0.22 + 0.14 * Math.sin(x * 2.1 + 0.7), 0.62 + 0.22 * Math.sin(x * 1.3 + 2.0)];
  let cluster = 0;
  let clusterX = 0;
  for (let i = 0; i < n + growers; i++) {
    const grower = i >= n;
    // Hair grows in small follicular units of 1 to 3 strands.
    if (cluster <= 0) {
      clusterX = -0.06 + rand() * 1.12;
      cluster = 1 + Math.floor(rand() * 3);
    }
    cluster--;
    const x = clusterX + (rand() - 0.5) * 0.006;
    const r = rand();
    const layer = grower ? (rand() < 0.5 ? 1 : 2) : r < 0.42 ? 0 : r < 0.76 ? 1 : 2;
    const len = layer === 0 ? 1.05 + rand() * 0.45 : layer === 1 ? 0.95 + rand() * 0.45 : 0.85 + rand() * 0.5;
    const [lean, bend] = flow(x);
    rows.push([
      x,
      grower ? 0.75 + rand() * 0.45 : len,
      (rand() - 0.5) * 0.05,
      rand() * Math.PI * 2,
      layer,
      rand(),
      0.75 + rand() * 0.5,
      lean + (rand() - 0.5) * 0.12,
      -1,
      grower ? 4.4 + rand() * 4.6 : -1,
      rand() < 0.35 ? -1 : 1,
      bend + (rand() - 0.5) * 0.16,
    ]);
  }
  // A few front strands detach early in the story; drawn last so they read as they drift.
  const fallers = rows.filter((row) => row[4] === 2 && row[9] < 0).slice(0, 6);
  fallers.forEach((row, i) => {
    row[8] = 0.6 + i * 0.45;
    row[4] = 2.5;
  });
  rows.sort((a, b) => a[4] - b[4]); // back layers first, fallers on top
  rows.forEach((row) => (row[4] = Math.min(row[4], 2)));
  const shedPool = rows
    .map((row, i) => (row[4] === 2 && row[8] < 0 && row[9] < 0 ? i : -1))
    .filter((i) => i >= 0);
  return { data: new Float32Array(rows.flat()), count: rows.length, shedPool };
}

/** Rare shedding after the story: one strand every 24 s, regrown 6–10 s later. */
function shed(t: number, pool: number[]): [number, number] {
  if (t < 20 || pool.length === 0) return [-1, -100];
  const k = Math.floor((t - 20) / 24);
  return [pool[(k * 7919) % pool.length], 20 + k * 24];
}

export function create(canvas: HTMLCanvasElement, opts: SceneOptions): Scene | null {
  const gl = context(canvas, opts);
  if (!gl) return null;
  const strands = program(gl, VS, FS);
  const bg = program(gl, FULLSCREEN_VS, BG_FS);
  const { data, count, shedPool } = instances(opts.quality);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  for (let loc = 0; loc < 3; loc++) {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, STRIDE * 4, loc * 16);
    gl.vertexAttribDivisor(loc, 1);
  }
  gl.bindVertexArray(null);

  const u = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
  const loc = {
    time: u(strands, "uTime"),
    aspect: u(strands, "uAspect"),
    px: u(strands, "uPx"),
    pointer: u(strands, "uPointer"),
    shed: u(strands, "uShed"),
    light: u(strands, "uLight"),
    res: u(bg, "uRes"),
  };

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, s: 0, active: false };
  fit(gl, canvas, opts.dprCap);

  return {
    render(t) {
      fit(gl, canvas, opts.dprCap);
      const w = canvas.width;
      const h = canvas.height;
      const aspect = w / h;
      // Soft spring towards the pointer, easing in and out.
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      pointer.s += ((pointer.active ? 1 : 0) - pointer.s) * 0.06;

      gl.disable(gl.BLEND);
      gl.useProgram(bg);
      gl.uniform2f(loc.res, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(strands);
      gl.uniform1f(loc.time, t);
      gl.uniform1f(loc.aspect, aspect);
      gl.uniform1f(loc.px, 1 / h);
      gl.uniform3f(loc.pointer, pointer.x * aspect, pointer.y, pointer.s);
      const [idx, start] = shed(t, shedPool);
      gl.uniform2f(loc.shed, idx, start);
      gl.uniform3f(loc.light, KEY_LIGHT[0], KEY_LIGHT[1], KEY_LIGHT[2]);
      gl.bindVertexArray(vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (SEG + 1) * 2, count);
      gl.bindVertexArray(null);
    },
    setPointer(x, y, active) {
      pointer.tx = x;
      pointer.ty = 1 - y;
      if (active && !pointer.active && pointer.s < 0.01) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.active = active;
    },
    resize() {
      fit(gl, canvas, opts.dprCap);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(strands);
      gl.deleteProgram(bg);
      release(gl);
    },
  };
}
