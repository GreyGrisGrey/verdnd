import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { tempStore } from './serveInter.ts';
import { BoardObject } from './boardCanvas/boardObject.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
const storedObjects: Map<number, BoardObject> = new Map();
const storedLayers: Map<number, BoardLayer> = new Map();
const serveInter = new tempStore(storedObjects, storedLayers);
const loadWall = document.getElementById('loadBlock')!;
const board = new Board(serveInter, storedObjects, storedLayers);
const rightMan = new RightBarManager(serveInter);
const leftMan = new LeftBarManager(board);

serveInter.setBoard(board);
// The order of events up there is unfortunately quite important.
// Try not to poke it too much.

// Updates the board and right menu based on the server interface.
function syncServer() {
    updateLayers();
    updateObjects();
}

function updateObjects() {
    const data = serveInter.getObjects();
    if (data) {
        for (const [key, val] of data) {
            board.addObject(val.layerId, val);
        }
    }
}

function updateLayers() {
    const data = serveInter.getLayers();
    if (data) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    }
}

async function mainLoop() {
    if (board.layerMap.size === 0) {
        counter = 0;
    } else if (board.modeMan.sendLaser) {
        serveInter.sendLaser(
            (board.mouseCoords.x - board.offset.x) / (5 * board.zoomVal),
            (board.mouseCoords.y - board.offset.y) / (5 * board.zoomVal),
            true,
        );
    } else {
        serveInter.sendLaser(0, 0, false);
    }
    if (counter % 25 === 0) {
        syncServer();
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

requestAnimationFrame(mainLoop);
