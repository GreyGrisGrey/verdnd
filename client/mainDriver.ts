import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { tempStore } from './serveInter.ts';
const serveInter = new tempStore();
const loadWall = document.getElementById('loadBlock')!;
const board = new Board(serveInter);
const rightMan = new RightBarManager(serveInter);
const leftMan = new LeftBarManager();

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
    }
    if (counter % 25 === 0) {
        syncServer();
        board.modeMan.clearTemp();
    }
    if (counter % 25 === 0) {
        rightMan.step();
        if (board.layerMap.size !== 0) {
            serveInter.ping();
        }
        counter = 1;
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
