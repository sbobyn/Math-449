import {
  addIOtoCanvas,
  get_RGB_from_UI,
  get_from_UI,
  get_vel_from_UI,
} from "../canvas-io.js";
import { BoundaryConditions, SimulationConfig } from "../config.js";
import { Obstacle } from "../obstacle.js";
import {
  clearCanvas,
  drawFPS,
  drawObstacle,
  draw_density,
  initRenderSettings,
} from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, ix, updateAvgFPS } from "../utils.js";

const numIterSlider = document.getElementById(
  "numIterations"
) as HTMLInputElement;
const numIterSpan = document.getElementById(
  "numIterationsValue"
) as HTMLSpanElement;

numIterSlider.oninput = function () {
  simconfig.numIterations = parseInt(numIterSlider.value);
  numIterSpan.textContent = numIterSlider.value;
};

// global vars
let prevTime: number;
let simconfig: SimulationConfig;
let solver: FluidSolver;
let canvas: HTMLCanvasElement;
let obstacle: Obstacle;

function draw() {
  clearCanvas();
  draw_density();
  drawObstacle(obstacle);
  drawFPS(avgFPS);
}

function setInflow() {
  // set velocity inflow
  for (let i = 1; i < simconfig.H - 1; i++) {
    solver.u_prev[ix(0, i, simconfig)] = simconfig.inflowVelocity;
  }
  // set inflow density
  const start = 12;
  for (let i = start; i < simconfig.H - start - 1; i++) {
    solver.r_dens_prev[ix(0, i, simconfig)] = simconfig.source;
    i += 2;
    solver.g_dens_prev[ix(0, i, simconfig)] = simconfig.source;
    i += 2;
    solver.b_dens_prev[ix(0, i, simconfig)] = simconfig.source;
    i += 4;
  }
}

function step() {
  solver.u_prev.fill(0);
  solver.v_prev.fill(0);
  solver.r_dens_prev.fill(0);
  solver.g_dens_prev.fill(0);
  solver.b_dens_prev.fill(0);

  setInflow();

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
  simconfig = new SimulationConfig(128, 64);
  simconfig.boundaryConditions = BoundaryConditions.WINDTUNNEL;
  simconfig.density_dissipation = 1.0;
  simconfig.inflowVelocity = 0.004;
  simconfig.source = 3.0;

  // call input handlers to init values
  numIterSlider.dispatchEvent(new Event("input"));

  obstacle = new Obstacle(16, 32, 4);
  solver = new FluidSolver(simconfig);
  solver.setObstacle(obstacle);

  // init canvas
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  addIOtoCanvas(canvas);
  initRenderSettings(canvas, solver);

  // begin sim
  run(performance.now());
}
