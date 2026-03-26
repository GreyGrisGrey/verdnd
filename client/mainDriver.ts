import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { tempStore } from './serveInter.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { TooltipManager } from './tooltips.ts';
import { LayerMenu } from './rightBar/layerBarMenu.ts';
import { TopBarManager } from './topBarMain.ts';
import { ModeManager } from './boardCanvas/modeManager.ts';
const storedLayers: Map<number, BoardLayer> = new Map();
const modeMan = new ModeManager();
const rightMan = new RightBarManager();
const serveInter = new tempStore();
const board = new Board();
const leftMan = new LeftBarManager();
const topMan = new TopBarManager();
const tooltips = new TooltipManager();
const layerMan = new LayerMenu();
let prevLaser = 0;
// The order of events up there is unfortunately quite important.
// Try not to poke it too much.

function setup() {
    serveInter.setup();
    requestAnimationFrame(mainLoop);
}

async function mainLoop() {
    if (storedLayers.size === 0) {
        counter = 0;
    } else if (modeMan.sendLaser && Date.now() - prevLaser > 30) {
        serveInter.sendLaser(
            Math.round(
                ((board.mouseCoords.x - board.offset.x) / (5 * board.zoomVal)) *
                    200,
            ) / 200,
            Math.round(
                ((board.mouseCoords.y - board.offset.y) / (5 * board.zoomVal)) *
                    200,
            ) / 200,
            true,
        );
        prevLaser = Date.now();
    } else if (Date.now() - prevLaser > 40) {
        serveInter.sendLaser(0, 0, false);
    }
    if (counter % 25 === 0) {
        rightMan.step();
        tooltips.step();
        modeMan.clearTemp();
    }
    if (serveInter.isDone) {
        board.activeLayer = layerMan.currSelect;
        board.step();
    }
    counter++;
    requestAnimationFrame(mainLoop);
}

let counter = 0;

setup();
