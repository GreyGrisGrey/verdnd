import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import type { CreateObjectPayload } from './objectEvents.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { Action, Shape } from './objectEvents.ts';
import type { BoardObject } from './boardCanvas/boardObject.ts';
import {
    Circle,
    Line,
    Polyline,
    Rect,
    Token,
} from './boardCanvas/boardObject.ts';
import { tempStore } from "./serveInter.ts"
const serveInter = new tempStore();
await new Promise<void>(resolve => setTimeout(resolve, 1000));
const loadWall = document.getElementById('loadBlock')!;
const board = new Board(serveInter);
const rightMan = new RightBarManager(serveInter);
const leftMan = new LeftBarManager();

async function runBoardStep() {
    board.step();
}

async function syncServer() {
    const data = serveInter.getObjects();
    if (data) {
        for (const [key, val] of data) {
            board.addObject(val.layerId, val);
        }
    }
    updateLayers();
}

async function updateLayers() {
    const data = serveInter.getLayers();
    if (data) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    }
}

function updateActiveLayer() {
    board.activeLayer = rightMan.layerMan.currSelect;
}

async function mainLoop() {
    if (board.layerMap.size === 0) {
        counter = 0
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
    updateActiveLayer();
    runBoardStep();
    counter++;
    if (counter === 2) {
        loadWall.style.visibility = 'hidden';
    }
    requestAnimationFrame(mainLoop);
}

let counter = 0;

requestAnimationFrame(mainLoop);
