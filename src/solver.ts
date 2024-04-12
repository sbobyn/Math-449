// function ix(i: number, j: number): number {
//   return i + (N + 2) * j;
// }

let tmp: Float32Array;

function swap(x0: Float32Array, x: Float32Array) {
  tmp = x0;
  x0 = x;
  x = tmp;
}

function forEachCell(N: number, action: (i: number, j: number) => void): void {
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      action(i, j);
    }
  }
}

function add_source(N: number, x: Float32Array, s: Float32Array, dt: number) {}

function set_bnd(N: number, b: number, x: Float32Array) {}

function lin_solve(
  N: number,
  b: number,
  x: Float32Array,
  x0: Float32Array,
  a: number,
  c: number
) {}

function diffuse(
  N: number,
  b: number,
  x: Float32Array,
  x0: Float32Array,
  diff: number,
  dt: number
) {}

function advect(
  N: number,
  b: number,
  d: Float32Array,
  d0: Float32Array,
  u: Float32Array,
  v: Float32Array,
  dt: number
) {}

function project(
  N: number,
  u: Float32Array,
  v: Float32Array,
  p: Float32Array,
  div: Float32Array
) {}

export function dens_step(
  N: number,
  x: Float32Array,
  x0: Float32Array,
  u: Float32Array,
  v: Float32Array,
  diff: number,
  dt: number
) {}

export function vel_step(
  N: number,
  u: Float32Array,
  v: Float32Array,
  u0: Float32Array,
  v0: Float32Array,
  visc: number,
  dt: number
) {}
