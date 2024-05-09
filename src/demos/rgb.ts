import {
  addIOtoCanvas,
  get_RGB_from_UI,
  get_vel_from_UI,
} from "../canvas-io.js";
import { BoundaryConditions, SimulationConfig } from "../config.js";
import {
  clearCanvas,
  drawFPS,
  draw_density,
  initRenderSettings,
} from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, updateAvgFPS } from "../utils.js";

const numIterSlider = document.getElementById(
  "numIterations"
) as HTMLInputElement;
const numIterSpan = document.getElementById(
  "numIterationsValue"
) as HTMLSpanElement;
const dissipationSlider = document.getElementById(
  "dissipation"
) as HTMLInputElement;
const dissipationSpan = document.getElementById(
  "dissipationValue"
) as HTMLSpanElement;

const boundarySelect = document.getElementById(
  "boundarySelect"
) as HTMLSelectElement;

numIterSlider.oninput = function () {
  simconfig.numIterations = parseInt(numIterSlider.value);
  numIterSpan.textContent = numIterSlider.value;
};
dissipationSlider.oninput = function () {
  simconfig.density_dissipation = parseFloat(dissipationSlider.value);
  dissipationSpan.textContent = simconfig.density_dissipation.toFixed(3);
};
boundarySelect.oninput = function () {
  switch (boundarySelect.value) {
    case "box":
      simconfig.boundaryConditions = BoundaryConditions.BOX;
      break;
    case "periodic":
      simconfig.boundaryConditions = BoundaryConditions.PERIODIC;
      break;
  }
};

// global vars
let prevTime: number;
let simconfig: SimulationConfig;
let solver: FluidSolver;
let canvas: HTMLCanvasElement;

let t = 0;
type Color = {
  r: number;
  g: number;
  b: number;
};
let a: Color = { r: 0, g: 0, b: 0 };

function draw() {
  clearCanvas();
  draw_density();
  drawFPS(avgFPS);
}

function step() {
  solver.u_prev.fill(0);
  solver.v_prev.fill(0);
  solver.r_dens_prev.fill(0);
  solver.g_dens_prev.fill(0);
  solver.b_dens_prev.fill(0);

  get_vel_from_UI(solver.u_prev, solver.v_prev, simconfig);
  get_RGB_from_UI(
    solver.r_dens_prev,
    solver.g_dens_prev,
    solver.b_dens_prev,
    a.r,
    a.g,
    a.b,
    simconfig
  );

  solver.velStep();
  solver.densSteps();

  // update colors
  t += 0.05;
  a.r = Math.sin(t) * 0.5 + 0.5;
  a.g = Math.sin(t + 2) * 0.5 + 0.5;
  a.b = Math.sin(t + 4) * 0.5 + 0.5;
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
  simconfig = new SimulationConfig(83, 64);
  // call input handlers to init values
  numIterSlider.dispatchEvent(new Event("input"));
  dissipationSlider.dispatchEvent(new Event("input"));
  boundarySelect.dispatchEvent(new Event("input"));

  solver = new FluidSolver(simconfig);

  // init canvas
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  addIOtoCanvas(canvas);
  initRenderSettings(canvas, solver);

  // begin sim
  run(performance.now());
}
