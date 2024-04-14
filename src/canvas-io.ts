import { SimulationConfig } from "./config.js";
import { ix } from "./utils.js";

let omx: number;
let omy: number;
let mx: number;
let my: number;

let mouseLeftDown = false;
let mouseRightDown = false;

let canvasRect: DOMRect;

let win_x: number;
let win_y: number;

function handleMouseDown(e: MouseEvent) {
  if (e.button != 0 && e.button != 2) return;

  mouseLeftDown = e.button == 0;
  mouseRightDown = e.button == 2;

  mx = e.clientX - canvasRect.left;
  omx = mx;
  my = e.clientY - canvasRect.top;
  omy = my;

  // console.log(`mouse ${e.button} down at (${mx}, ${my})`);
}

function handleMouseMove(e: MouseEvent) {
  if (!mouseLeftDown && !mouseRightDown) return;

  mx = e.clientX - canvasRect.left;
  my = e.clientY - canvasRect.top;

  // console.log(`mouse ${e.button} move at (${mx}, ${my})`);
}

function handleMouseUp(e: MouseEvent) {
  if (!mouseLeftDown && !mouseRightDown) return;

  mouseLeftDown = false;
  mouseRightDown = false;

  // console.log(`mouse ${e.button} up`);
}

export function addIOtoCanvas(canvas: HTMLCanvasElement) {
  canvasRect = canvas.getBoundingClientRect();
  win_x = canvas.width;
  win_y = canvas.height;

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("contextmenu", function (e: Event) {
    e.preventDefault();
  });
}

export function get_from_UI(
  d: Float32Array,
  u: Float32Array,
  v: Float32Array,
  simconfig: SimulationConfig
) {
  if (!mouseLeftDown && !mouseRightDown) return;

  const i = Math.floor((mx / win_x) * simconfig.N) + 1;
  const j = Math.floor((my / win_y) * simconfig.N) + 1;

  if (mouseLeftDown) {
    u[ix(i, j, simconfig)] = simconfig.force * (mx - omx);
    v[ix(i, j, simconfig)] = simconfig.force * (my - omy);
  }

  if (mouseRightDown) {
    d[ix(i, j, simconfig)] = simconfig.source;
  }

  omx = mx;
  omy = my;
}
