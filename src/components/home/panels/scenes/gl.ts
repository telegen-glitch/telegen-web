/**
 * Minimal WebGL2 helpers shared by the hero panel scenes. No library: each scene
 * is a few kilobytes of plain WebGL2 and is loaded on demand (see SceneArt).
 */

export type Quality = "high" | "mobile" | "low";

export interface SceneOptions {
  quality: Quality;
  /** devicePixelRatio cap (2 desktop, 1.5 mobile). */
  dprCap: number;
  /** Keep the drawing buffer (poster rendering only). */
  preserve?: boolean;
  /**
   * Allow a software renderer (SwiftShader, llvmpipe…). Off on the site: without
   * a GPU the scene would block the main thread, so the poster stays instead.
   * On for poster rendering and opt-in for tests.
   */
  allowSoftware?: boolean;
}

export interface Scene {
  /** Draw the frame for story time `t` (seconds since the panel opened). */
  render(t: number): void;
  /** Pointer in canvas space, 0..1 with y pointing down; `active` false when it leaves. */
  setPointer(x: number, y: number, active: boolean): void;
  resize(): void;
  dispose(): void;
}

export function context(canvas: HTMLCanvasElement, opts: SceneOptions): WebGL2RenderingContext | null {
  const gl = canvas.getContext("webgl2", {
    antialias: opts.quality !== "low",
    alpha: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: Boolean(opts.preserve),
  });
  if (!gl) return null;
  if (!opts.allowSoftware && isSoftware(gl)) {
    release(gl);
    return null;
  }
  return gl;
}

/** True when WebGL runs on the CPU (no GPU acceleration). */
export function isSoftware(gl: WebGL2RenderingContext): boolean {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
}

export function program(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

/** Match the drawing buffer to the element size (capped DPR). Returns true when it changed. */
export function fit(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, dprCap: number): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width === w && canvas.height === h) return false;
  canvas.width = w;
  canvas.height = h;
  gl.viewport(0, 0, w, h);
  return true;
}

export function release(gl: WebGL2RenderingContext): void {
  gl.getExtension("WEBGL_lose_context")?.loseContext();
}

/** Deterministic PRNG (mulberry32): the scene looks the same on every load. */
export function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shared duotone grade in brand tokens: shadows navy-950 → navy-800, midtones
 * blue-600, highlights mist → white. Both scenes shade in luminance and map it
 * through this ramp, so they read as one family with the ED line.
 */
export const GRADE = /* glsl */ `
vec3 grade(float s) {
  s = clamp(s, 0.0, 1.0);
  vec3 c0 = vec3(0.039, 0.086, 0.192);
  vec3 c1 = vec3(0.106, 0.180, 0.369);
  vec3 c2 = vec3(0.165, 0.361, 0.784);
  vec3 c3 = vec3(0.949, 0.961, 0.980);
  if (s < 0.25) return mix(c0, c1, s / 0.25);
  if (s < 0.55) return mix(c1, c2, (s - 0.25) / 0.30);
  if (s < 0.92) return mix(c2, c3, (s - 0.55) / 0.37);
  return mix(c3, vec3(1.0), (s - 0.92) / 0.08);
}`;

/** The same soft key light (top left, towards the viewer) in both scenes. */
export const KEY_LIGHT: [number, number, number] = [-0.55, 0.65, 0.55];

/** Full-screen triangle (no buffers needed). */
export const FULLSCREEN_VS = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
