import { addIOtoCanvas, get_from_UI } from "../canvas-io.js";
import { SimulationConfig } from "../config.js";
import {
  clearCanvas,
  drawFPS,
  drawGrid,
  draw_density_grayscale,
  drawVelocityField,
  initRenderSettings,
} from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, updateAvgFPS } from "../utils.js";

// global vars
let prevTime: number;
let simconfig: SimulationConfig;
let solver: FluidSolver;
let canvas: HTMLCanvasElement;

function draw() {
  clearCanvas();
  draw_density_grayscale();
  drawGrid();
  drawVelocityField();
  drawFPS(avgFPS);
}

function step() {
  solver.u_prev.fill(0);
  solver.v_prev.fill(0);
  solver.r_dens_prev.fill(0);

  get_from_UI(solver.r_dens_prev, solver.u_prev, solver.v_prev, simconfig);

  solver.velStep();
  solver.densSteps();
}

function run(now: number) {
  const deltaTime = (now - prevTime) / 1000;
  prevTime = now;
  updateAvgFPS(1 / deltaTime);
  step();
  draw();
  requestAnimationFrame(run);
}

export function main() {
  prevTime = performance.now();

  // init simulator
  simconfig = new SimulationConfig(24, 16);
  solver = new FluidSolver(simconfig);

  // init canvas
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  addIOtoCanvas(canvas);
  initRenderSettings(canvas, solver);

  // begin sim
  run(performance.now());
}
