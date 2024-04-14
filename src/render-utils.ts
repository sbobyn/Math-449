import { SimulationConfig } from "./config.js";
import { FluidSolver } from "./solver.js";
import { ix, forEachCell, clamp01 } from "./utils.js";

let simconfig: SimulationConfig;
let solver: FluidSolver;
let ctx: CanvasRenderingContext2D;

let win_x: number, win_y: number, h: number;

function draw_velocity() {}

function drawVector(i: number, j: number) {}

export function draw_density() {
  forEachCell(simconfig, (i, j) => drawCell(i - 1, j - 1));
}

function drawCell(i: number, j: number) {
  let r = clamp01(solver.r_dens[ix(i, j, simconfig)]);
  r = Math.floor(255 * r);
  let g = clamp01(solver.g_dens[ix(i, j, simconfig)]);
  g = Math.floor(255 * g);
  let b = clamp01(solver.b_dens[ix(i, j, simconfig)]);
  b = Math.floor(255 * b);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(i * h, j * h, h, h);
}

export function draw_density_grayscale() {
  forEachCell(simconfig, (i, j) => drawcell_grayscale(i - 1, j - 1));
}

function drawcell_grayscale(i: number, j: number) {
  let r = clamp01(solver.r_dens[ix(i, j, simconfig)]);
  r = Math.floor(255 * r);
  ctx.fillStyle = `rgb(${r}, ${r}, ${r})`;
  ctx.fillRect(i * h, j * h, h, h);
}

export function drawLine(x0: number, y0: number, x1: number, y1: number) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function drawGrid() {
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 2;
  for (let i = 1; i < simconfig.N; i++) {
    drawLine(0, i * h, win_x, i * h);
    drawLine(i * h, 0, i * h, win_y);
  }
}

export function clearCanvas() {
  ctx.clearRect(0, 0, win_x, win_y);
}

export function drawFPS(fps: number) {
  ctx.fillStyle = "green";
  ctx.fillText("fps: " + fps.toFixed(2), 5, 15);
}

export function initRenderSettings(
  canvas: HTMLCanvasElement,
  fluidsolver: FluidSolver
) {
  solver = fluidsolver;
  simconfig = solver.config;
  ctx = canvas.getContext("2d", {
    alpha: false,
  })!;
  ctx.font = "15px sans-serif";
  win_x = canvas.width;
  win_y = canvas.height;
  h = win_x / simconfig.N;
}
