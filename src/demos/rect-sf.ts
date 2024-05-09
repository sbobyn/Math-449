import { addIOtoCanvas, get_from_UI } from "../canvas-io.js";
import { SimulationConfig } from "../config.js";
import {
  clearCanvas,
  drawFPS,
  draw_density,
  initRenderSettings,
} from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, updateAvgFPS } from "../utils.js";

// global vars
let prevTime: number;
let simconfig: SimulationConfig;
let solver: FluidSolver;
let selectedSmokeColor: SMOKE_COLOR;
let canvas: HTMLCanvasElement;
let colorMenu: HTMLSelectElement;

enum SMOKE_COLOR {
  RED,
  GREEN,
  BLUE,
}

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

  switch (selectedSmokeColor) {
    case SMOKE_COLOR.RED:
      get_from_UI(solver.r_dens_prev, solver.u_prev, solver.v_prev, simconfig);
      break;
    case SMOKE_COLOR.GREEN:
      get_from_UI(solver.g_dens_prev, solver.u_prev, solver.v_prev, simconfig);
      break;
    case SMOKE_COLOR.BLUE:
      get_from_UI(solver.b_dens_prev, solver.u_prev, solver.v_prev, simconfig);
      break;
    default:
      get_from_UI(solver.r_dens_prev, solver.u_prev, solver.v_prev, simconfig);
      break;
  }
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

function handleColorChange() {
  switch (colorMenu.value) {
    case "red":
      selectedSmokeColor = SMOKE_COLOR.RED;
      break;
    case "blue":
      selectedSmokeColor = SMOKE_COLOR.BLUE;
      break;
    case "green":
      selectedSmokeColor = SMOKE_COLOR.GREEN;
      break;
    default:
      break;
  }
}

export function main() {
  prevTime = performance.now();
  selectedSmokeColor = SMOKE_COLOR.RED;

  // init simulator
  simconfig = new SimulationConfig(128, 64);
  solver = new FluidSolver(simconfig);

  // init canvas
  canvas = <HTMLCanvasElement>document.getElementById("canvas");
  addIOtoCanvas(canvas);
  initRenderSettings(canvas, solver);

  // init IO
  colorMenu = <HTMLSelectElement>document.getElementById("color-select");
  colorMenu.onchange = handleColorChange;

  // begin sim
  run(performance.now());
}
