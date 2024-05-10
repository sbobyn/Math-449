import { SimulationConfig } from "./config.js";
import { Obstacle } from "./obstacle.js";
import { FluidSolver } from "./solver.js";
import { ix, forEachCell, clamp01 } from "./utils.js";

let simconfig: SimulationConfig;
let solver: FluidSolver;
let ctx: CanvasRenderingContext2D;

let win_x: number, win_y: number, h: number;

export function drawVelocityField() {
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";
  ctx.lineWidth = 1;

  forEachCell(simconfig, (i, j) => drawVector(i, j));
}

function drawVector(i: number, j: number) {
  const x0 = (i - 0.5) * h;
  const y0 = (j - 0.5) * h;

  const u = solver.u[ix(i, j, simconfig)] * h;
  const v = solver.v[ix(i, j, simconfig)] * h;

  drawArrow(x0, y0, x0 + u, y0 + v);
}

function drawArrow(x0: number, y0: number, x1: number, y1: number) {
  drawLine(x0, y0, x1, y1);

  const mag = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

  const arrowHeadLength = Math.min(mag / 3, h / 3);

  const angle = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(
    x1 - arrowHeadLength * Math.cos(angle - Math.PI / 8),
    y1 - arrowHeadLength * Math.sin(angle - Math.PI / 8)
  );
  ctx.lineTo(
    x1 - arrowHeadLength * Math.cos(angle + Math.PI / 8),
    y1 - arrowHeadLength * Math.sin(angle + Math.PI / 8)
  );
  ctx.fill();
}

export function draw_density() {
  forEachCell(simconfig, (i, j) => drawCell(i, j));
}

function drawCell(i: number, j: number) {
  let r = clamp01(solver.r_dens[ix(i, j, simconfig)]);
  r = Math.floor(255 * r);
  let g = clamp01(solver.g_dens[ix(i, j, simconfig)]);
  g = Math.floor(255 * g);
  let b = clamp01(solver.b_dens[ix(i, j, simconfig)]);
  b = Math.floor(255 * b);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect((i - 1) * h, (j - 1) * h, h, h);
}

export function draw_density_grayscale() {
  forEachCell(simconfig, (i, j) => drawcell_grayscale(i, j));
}

function drawcell_grayscale(i: number, j: number) {
  let r = clamp01(solver.r_dens[ix(i, j, simconfig)]);
  r = Math.floor(255 * r);
  ctx.fillStyle = `rgb(${r}, ${r}, ${r})`;
  ctx.fillRect((i - 1) * h, (j - 1) * h, h, h);
}

export function drawLine(x0: number, y0: number, x1: number, y1: number) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function drawGrid() {
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  // vertical lines
  for (let i = 1; i < simconfig.W; i++) {
    drawLine(i * h, 0, i * h, win_y);
  }
  // horizontal lines
  for (let j = 1; j < simconfig.H; j++) {
    drawLine(0, j * h, win_x, j * h);
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
  h = win_x / simconfig.W;
}

export function drawObstacle(obstacle: Obstacle) {
  ctx.fillStyle = "grey";
  ctx.strokeStyle = "white";
  ctx.beginPath();
  // convert from grid to pixel coordinates
  const x = (obstacle.x - 0.5) * h;
  const y = (obstacle.y - 0.5) * h;
  const radius = obstacle.radius * h;
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}
