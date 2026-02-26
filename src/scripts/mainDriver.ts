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
    rightMan.step();
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
}

async function getRecent() {
    const { data, error } = await actions.boardActions.getRecents();
    if (data) {
        for (const obj of data) {
            if (!board.objectMap.has(obj.objectId)) {
                board.addObject(obj.objectId, 0, payloadToBoardObject(obj));
            }
        }
    }
}

async function setUpLayers() {
    let { data, error } = await actions.boardActions.getLayers();
    if (data && data.size != 0) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(
                new BoardLayer(val.zOrder, val.gmVisible, val.playerVisible),
                key,
            );
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
                val.object.objectId!,
                0,
                payloadToBoardObject(val.object),
            );
        }
    }
}

async function setUp() {
    setUpLayers();
    setUpObjects();
}

const board = new Board();
new LeftBarManager();
const rightMan = new RightBarManager();
const serveInter = new ServerInterface(board, rightMan);
setUp();
let counter = 0;

async function mainLoop() {
    if (counter == 10) {
        counter = 0;
        await syncServer();
        board.modeMan.clearTemp();
    }
    runBoardStep();
    rightMan.step();
    counter++;

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
