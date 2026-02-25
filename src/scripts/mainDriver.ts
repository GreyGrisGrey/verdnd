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

const colorSquare = getRequiredElement('colourSquare', HTMLElement);

function checkDeletion() {
    const deletions = board.getDeletion();
    if (deletions !== undefined) {
        for (const obj of deletions) {
            serveInter.destroyObj(obj.ID);
        }
        board.modeMan.clearSelected();
    }
}

function constructObject(newObj: CreateObjectPayload) {
    if (newObj.kind === Shape.Poly) {
        
    }
}

async function runBoardStep() {
    if (board.modeMan.moveFlag) {
        const toChange = board.modeMan.getSelected();
        const valChange = board.determineTile(
            board.modeMan.selectMan.thirdOffset.x + board.originCoords.x,
            board.modeMan.selectMan.thirdOffset.y + board.originCoords.y,
            true,
        );
        for (const obj of toChange) {
            serveInter.moveObj(obj.ID, valChange.x, valChange.y);
        }
        board.modeMan.selectMan.piecesMoved();
    }
    if (board.modeMan.recolourFlag) {
        const toChange = board.modeMan.getSelected();
        for (const obj of toChange) {
            serveInter.changeObjColour(
                obj.ID,
                Color(colorSquare.style.background),
            );
        }
    }
    
    const { data, error } = await serveInter.getObjects()
    if (data) {
        for (const [key, val] of data) {
            const res = board.getLayer(val.layerId)
            if (res && !res.heldMap.has(key)) {
                res.addObject(payloadToBoardObject(val, key), key)
            }
        }
    }
    
    serveInter.clearQueue();
    rightMan.step();
    board.step();
    checkDeletion();
}

async function setUp() {
    const { data, error } = await serveInter.getAllLayers();
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

const board = new Board();
new LeftBarManager();
const rightMan = new RightBarManager();
const serveInter = new ServerInterface(board);
let counter = 0;
setUp();


async function mainLoop() {
    runBoardStep();
    rightMan.step();
    if (counter == 10) {
        const { data, error } = await serveInter.getAllLayers();
        if (data) {
            rightMan.layerMan.handleNewLayers(data);
            for (const [key, val] of data) {
                if (!board.layerMap.has(key)) {
                    board.addLayer(
                        new BoardLayer(
                            val.zOrder,
                            val.gmVisible,
                            val.playerVisible,
                        ),
                        key,
                    );
                }
            }
        }
        counter = 0;
    }
    counter++;

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
