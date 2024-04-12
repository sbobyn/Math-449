import { dens_step, vel_step } from "./solver.js";

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
const diff = 0.0;
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

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

const win_x = canvas.width;
const win_y = canvas.height;

const h = win_x / N;

let omx: number;
let omy: number;
let mx: number;
let my: number;

function get_from_UI(d: Float32Array, u: Float32Array, v: Float32Array) {}

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
  vel_step(N, u, v, u_prev, v_prev, visc, dt);
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

forEachCell((i, j) => {
  dens[ix(i, j)] = Math.random();
});

ctx.font = "15px sans-serif";
let prevTime = performance.now();
main(prevTime);
