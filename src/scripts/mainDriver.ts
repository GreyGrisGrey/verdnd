import Color from 'color';

import { Board } from './boardCanvas/localBoard.ts';
import { getRequiredElement } from './dom.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import type { CreateObjectPayload } from './objectEvents.ts';
import { Shape } from './objectEvents.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { ServerInterface } from './serverInterface.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { payloadToBoardObject } from './serverInterface.ts';
import { actions } from 'astro:actions';

const colorSquare = getRequiredElement('colourSquare', HTMLElement);

async function runBoardStep() {
    serveInter.clearQueue();
    rightMan.step();
    board.step();
}

async function syncServer() {
    const checkMap: Map<number, CreateObjectPayload> = new Map()
    for (const [key, val] of board.objectMap) {
        checkMap.set(key, val.payloadFromObject())
    }
    const {data, error} = await actions.boardActions.checkIds(Object.fromEntries(checkMap))
    if (data) {
        const map = new Map(Object.entries(data))
        for (const [key, val] of map) {
            if (val) {
                board.objectMap.get(Number(key))!.updateFromPayload(val)
            } else {
                board.removeObject(Number(key))
            }
        }
    }
    getRecent()
}

async function getRecent() {
    const {data, error} = await actions.boardActions.getRecents()
    if (data) {
        for (const obj of data) {
            if (!board.objectMap.has(obj[0])) {
                board.addObject(obj[0], 0, payloadToBoardObject(obj[1]))
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
            board.addObject(val.object.objectId!, 0, payloadToBoardObject(val.object));
        }
    }
}

async function setUp() {
    setUpLayers()
    setUpObjects()
}

const board = new Board();
new LeftBarManager();
const rightMan = new RightBarManager();
const serveInter = new ServerInterface(board, rightMan);
setUp();
let counter = 0;


async function mainLoop() {
    if (counter == 3) {
        counter = 0;
        await syncServer()
    }
    runBoardStep();
    rightMan.step();
    counter++;

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
