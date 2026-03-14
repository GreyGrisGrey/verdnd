import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { tempStore } from './serveInter.ts';
import { BoardObject } from './boardCanvas/boardObject.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { LayerState } from '../shared/objectEvents.ts';
const storedObjects: Map<number, BoardObject> = new Map();
const storedLayers: Map<number, BoardLayer> = new Map();
const storedLayerStates: Map<number, LayerState> = new Map();
const serveInter = new tempStore(
    storedObjects,
    storedLayers,
    storedLayerStates,
);
const loadWall = document.getElementById('loadBlock')!;
const board = new Board(serveInter, storedObjects, storedLayers);
const rightMan = new RightBarManager(serveInter, storedLayerStates);
const leftMan = new LeftBarManager(board);

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
    } else if (board.modeMan.sendLaser && serveInter.online && false) {
        serveInter.sendLaser(
            (board.mouseCoords.x - board.offset.x) / (5 * board.zoomVal),
            (board.mouseCoords.y - board.offset.y) / (5 * board.zoomVal),
            true,
        );
    } else if (serveInter.online && false) {
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
    if (counter === 5) {
        loadWall.style.visibility = 'hidden';
    }
    requestAnimationFrame(mainLoop);
}

let counter = 0;

setup();
