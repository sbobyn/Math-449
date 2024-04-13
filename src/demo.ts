function ix(i: number, j: number): number {
  return i + (N + 2) * j;
}

function forEachCell(action: (i: number, j: number) => void): void {
  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      action(i, j);
    }
  }
}

let lastFPSValues = new Float32Array(60);
let numFPSValues = 0;
let avgFPS = 0;

const N = 16;
const size = (N + 2) * (N + 2);
const dt = 1 / 60.0;
const diff = 0.1;
const visc = 0.0;
const force = 5.0;
const source = 100.0;
let drawVel = false;

let u = new Float32Array(size);
let v = new Float32Array(size);
let u_prev = new Float32Array(size);
let v_prev = new Float32Array(size);
let dens = new Float32Array(size);
let dens_prev = new Float32Array(size);
let tmp = new Float32Array(size);

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
const canvasRect = canvas.getBoundingClientRect();
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("contextmenu", function (e: Event) {
  e.preventDefault();
});

const win_x = canvas.width;
const win_y = canvas.height;

const h = win_x / N;

let omx: number;
let omy: number;
let mx: number;
let my: number;

let mouseLeftDown = false;
let mouseRightDown = false;

function handleMouseDown(e: MouseEvent) {
  if (e.button != 0 && e.button != 2) return;

  mouseLeftDown = e.button == 0;
  mouseRightDown = e.button == 2;

  mx = e.clientX - canvasRect.left;
  omx = mx;
  my = e.clientY - canvasRect.top;
  omy = my;

  console.log(`mouse ${e.button} down at (${mx}, ${my})`);
}

function handleMouseMove(e: MouseEvent) {
  if (!mouseLeftDown && !mouseRightDown) return;

  mx = e.clientX - canvasRect.left;
  my = e.clientY - canvasRect.top;

  console.log(`mouse ${e.button} move at (${mx}, ${my})`);
}

function handleMouseUp(e: MouseEvent) {
  if (!mouseLeftDown && !mouseRightDown) return;

  mouseLeftDown = false;
  mouseRightDown = false;

  console.log(`mouse ${e.button} up`);
}

function swap(x0: Float32Array, x: Float32Array) {
  tmp.set(x0);
  x0.set(x);
  x.set(tmp);
}

function add_source(N: number, x: Float32Array, s: Float32Array, dt: number) {
  for (let i = 0; i < size; i++) x[i] += dt * s[i];
}

function set_bnd(N: number, b: number, x: Float32Array) {
  for (let i = 1; i <= N; i++) {
    x[ix(0, i)] = b == 1 ? -x[ix(1, i)] : x[ix(1, i)];
    x[ix(N + 1, i)] = b == 1 ? -x[ix(N, i)] : x[ix(N, i)];
    x[ix(i, 0)] = b == 2 ? -x[ix(i, 1)] : x[ix(i, 1)];
    x[ix(i, N + 1)] = b == 2 ? -x[ix(i, N)] : x[ix(i, N)];
  }
  x[ix(0, 0)] = 0.5 * (x[ix(1, 0)] + x[ix(0, 1)]);
  x[ix(0, N + 1)] = 0.5 * (x[ix(1, N + 1)] + x[ix(0, N)]);
  x[ix(N + 1, 0)] = 0.5 * (x[ix(N, 0)] + x[ix(N + 1, 1)]);
  x[ix(N + 1, N + 1)] = 0.5 * (x[ix(N, N + 1)] + x[ix(N + 1, N)]);
}

function lin_solve(
  N: number,
  b: number,
  x: Float32Array,
  x0: Float32Array,
  a: number,
  c: number
) {
  for (let k = 0; k < 20; k++) {
    forEachCell((i, j) => {
      x[ix(i, j)] =
        (x0[ix(i, j)] +
          a *
            (x[ix(i - 1, j)] +
              x[ix(i + 1, j)] +
              x[ix(i, j - 1)] +
              x[ix(i, j + 1)])) /
        c;
    });
    set_bnd(N, b, x);
  }
}

function diffuse(
  N: number,
  b: number,
  x: Float32Array,
  x0: Float32Array,
  diff: number,
  dt: number
) {
  let a = dt * diff * N * N;
  lin_solve(N, b, x, x0, a, 1 + 4 * a);
}

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
) {
  add_source(N, x, x0, dt);
  swap(x0, x);
  diffuse(N, 0, x, x0, diff, dt);
  // swap(x0, x);
  // advect(N, 0, x, x0, u, v, dt);
}

export function vel_step(
  N: number,
  u: Float32Array,
  v: Float32Array,
  u0: Float32Array,
  v0: Float32Array,
  visc: number,
  dt: number
) {}

function get_from_UI(d: Float32Array, u: Float32Array, v: Float32Array) {
  d.fill(0);
  u.fill(0);
  v.fill(0);

  if (!mouseLeftDown && !mouseRightDown) return;

  const i = Math.floor((mx / win_x) * N) + 1;
  const j = Math.floor((my / win_y) * N) + 1;

  if (mouseRightDown) {
    d[ix(i, j)] = 100;
    console.log(i, j);
  }
}

function draw_velocity() {}

function draw_density() {
  forEachCell((i, j) => drawCell(i - 1, j - 1));
}

function linearToGamma(linearValue: number): number {
  return Math.sqrt(linearValue);
}

function drawCell(i: number, j: number) {
  let d = linearToGamma(dens[ix(i + 1, j + 1)]);
  d = Math.floor(255 * d);
  ctx.fillStyle = `rgb(${d}, ${d}, ${d})`;
  ctx.fillRect(i * h, j * h, h, h);
}

function drawLine(x0: number, y0: number, x1: number, y1: number) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function drawGrid() {
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 2;
  for (let i = 1; i < N; i++) {
    drawLine(0, i * h, win_x, i * h);
    drawLine(i * h, 0, i * h, win_y);
  }
}

function draw() {
  ctx.clearRect(0, 0, win_x, win_y);

  if (drawVel) draw_velocity();
  else draw_density();

  drawGrid();

  ctx.fillStyle = "green";
  ctx.fillText("fps: " + avgFPS.toFixed(2), 5, 15);
}

function step() {
  get_from_UI(dens_prev, u_prev, v_prev);
  // vel_step(N, u, v, u_prev, v_prev, visc, dt);
  dens_step(N, dens, dens_prev, u, v, diff, dt);
}

function updateAvgFPS(currFPS: number) {
  if (numFPSValues < 60) {
    lastFPSValues[numFPSValues++] = currFPS;
  } else {
    numFPSValues = 0;
    avgFPS = lastFPSValues.reduce((acc, curr) => acc + curr, 0) / 60;
  }
}

function main(now: number) {
  const deltaTime = (now - prevTime) / 1000;
  prevTime = now;
  updateAvgFPS(1 / deltaTime);
  step();
  draw();
  requestAnimationFrame(main);
}

ctx.font = "15px sans-serif";
let prevTime = performance.now();
main(prevTime);
