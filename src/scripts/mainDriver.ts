import { Board } from './boardCanvas/localBoard.ts';
import { LeftBarManager } from './leftBar/leftBarMain.ts';
import type { CreateObjectPayload } from './objectEvents.ts';
import { RightBarManager } from './rightBar/rightBarMain.ts';
import { Action, Shape } from '../scripts/objectEvents.ts';
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
const loadWall = document.getElementById('loadBlock')!;
const board = new Board(serveInter);
const rightMan = new RightBarManager(serveInter);
const leftMan = new LeftBarManager();

function payloadToBoardObject(p: CreateObjectPayload): BoardObject {
    switch (p.kind) {
        case Shape.Circle:
            return new Circle(p.objectId!, p.x, p.y, p.diameter, p.colour);
        case Shape.Rect:
            return new Rect(p.objectId!, p.x, p.y, p.width, p.height, p.colour);
        case Shape.Token:
            return new Token(
                p.objectId!,
                p.x,
                p.y,
                p.diameter,
                p.colour,
                p.name ?? '',
            );
        case Shape.Poly:
            return new Polyline(p.objectId!, p.x, p.y, p.points, p.colour);
        case Shape.Line:
            return new Line(p.objectId!, p.x, p.y, p.points, p.colour);
        default: {
            throw new Error('Unknown shape');
        }
    }
}

async function runBoardStep() {
    board.step();
}

async function syncServer() {
    const checkList: CreateObjectPayload[] = [];
    for (const [key, val] of board.objectMap) {
        checkList.push(val.payloadFromObject());
    }
    const data = serveInter.compareObjects(checkList);
    if (data) {
        for (const val of data) {
            if (val.action === Action.Create) {
                // note : not too sure about this "as any" chief
                board.objectMap
                    .get(val.object.objectId!)!
                    .updateFromPayload((val as any).object);
            } else if (val.action === Action.Destroy) {
                board.removeObject(val.objectId);
            }
        }
    }
    getRecent();
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

async function getRecent() {
    const data = serveInter.getNewObjects();
    if (data) {
        for (const obj of data) {
            if (!board.objectMap.has(obj.objectId)) {
                board.addObject(obj.layerId, payloadToBoardObject(obj));
            }
        }
    }
}

async function setUpLayers() {
    const data = serveInter.getLayers();
    if (data && data.size != 0) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    } else {
        rightMan.layerMan.createLayer();
        board.addLayer({gmVisible: true,
    playerVisible: true,
    zOrder: 0,
    id: 0});
    }
}

async function setUpObjects() {
    const data = serveInter.getObjects();
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

async function mainLoop() {
    if (counter % 25 === 0) {
        syncServer();
        board.modeMan.clearTemp();
    }
    if (counter % 25 === 0) {
        rightMan.step();
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

setUp();
let counter = 0;

requestAnimationFrame(mainLoop);
