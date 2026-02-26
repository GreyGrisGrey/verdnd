import { Board } from './boardCanvas/localBoard.ts';
import { getRequiredElement } from './dom.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import type { CreateObjectPayload, ObjectChangeEvent } from './objectEvents.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { ServerInterface } from './serverInterface.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { payloadToBoardObject } from './serverInterface.ts';
import { actions } from 'astro:actions';
import { Action, Entity, Shape } from '../scripts/objectEvents.ts';

const colorSquare = getRequiredElement('colourSquare', HTMLElement);

async function runBoardStep() {
    board.step();
}

async function syncServer() {
    const checkList: CreateObjectPayload[] = [];
    for (const [key, val] of board.objectMap) {
        checkList.push(val.payloadFromObject());
    }
    const { data, error } = await actions.boardActions.checkIds(checkList);
    if (data) {
        for (const val of data) {
            console.log(val);
            if (val.action === Action.Create) {
                board.objectMap
                    .get(val.object.objectId!)!
                    .updateFromPayload(val.object);
            } else {
                board.removeObject(val.objectId);
            }
        }
    }
    getRecent();
    updateLayers();
}

async function updateLayers() {
    const { data, error } = await actions.boardActions.getLayers();
    if (data) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    }
}

async function getRecent() {
    const { data, error } = await actions.boardActions.getRecents();
    if (data) {
        for (const obj of data) {
            if (!board.objectMap.has(obj.objectId)) {
                board.addObject(obj.layerId, payloadToBoardObject(obj));
            }
        }
    }
}

async function setUpLayers() {
    let { data, error } = await actions.boardActions.getLayers();
    if (data && data.size != 0) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    } else {
        rightMan.layerMan.createLayer();
        board.addLayer(new BoardLayer(0, true, true), 0);
    }
}

async function setUpObjects() {
    let { data, error } = await actions.boardActions.getObjects();
    if (data) {
        for (const [key, val] of data) {
            board.addObject(
                val.object.layerId!,
                payloadToBoardObject(val.object),
            );
        }
    }
}

async function setUp() {
    await setUpLayers();
    await setUpObjects();
}

function updateActiveLayer() {
    board.activeLayer = rightMan.layerMan.currSelect;
}

const board = new Board();
new LeftBarManager();
const rightMan = new RightBarManager();
const serveInter = new ServerInterface(board, rightMan);
await setUp();
let counter = 0;

async function mainLoop() {
    if (counter % 10 === 0) {
        syncServer();
        board.modeMan.clearTemp();
    }
    if (counter % 100 === 0) {
        rightMan.step();
        counter = 1;
    }
    updateActiveLayer();
    runBoardStep();
    counter++;

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
