import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { tempStore } from './serveInter.ts';
import { BoardObject } from './boardCanvas/boardObject.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { LayerState } from '../shared/objectEvents.ts';
import { getRequiredElement } from './dom.ts';
import { TooltipManager } from './tooltips.ts';
import { TopBarManager } from './topBarMain.ts';
const storedObjects: Map<number, BoardObject> = new Map();
const storedLayers: Map<number, BoardLayer> = new Map();
const storedLayerStates: Map<number, LayerState> = new Map();
const serveInter = new tempStore(
    storedObjects,
    storedLayers,
    storedLayerStates,
);
const board = new Board(serveInter, storedObjects, storedLayers);
const rightMan = new RightBarManager(serveInter, storedLayerStates);
const leftMan = new LeftBarManager(board);
const topMan = new TopBarManager();
const tooltips = new TooltipManager();
let prevLaser = 0;

serveInter.setBoard(board);
serveInter.setMan(rightMan.layerMan);
// The order of events up there is unfortunately quite important.
// Try not to poke it too much.

function setup() {
    serveInter.setup();
    requestAnimationFrame(mainLoop);
}

async function mainLoop() {
    if (board.layerMap.size === 0) {
        counter = 0;
    } else if (board.modeMan.sendLaser && Date.now() - prevLaser > 30) {
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
        board.modeMan.clearTemp();
    }
    if (counter % 25 === 0) {
        rightMan.step();
    }
    board.activeLayer = rightMan.layerMan.currSelect;
    board.step();
    counter++;
    requestAnimationFrame(mainLoop);
}

let counter = 0;

setup();
