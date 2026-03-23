import { BoardLayer } from './boardLayer.ts';
import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { GetObjectReason, ModeManager } from './modeManager.ts';
import { BLUE, RED, WHITE } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;
const storedObjects: Map<number, BoardObject> = new Map();
const storedLayers: Map<number, BoardLayer> = new Map();
const serveInter = new tempStore();

export enum CoordModes {
    Vertex = 0,
    Center = 1,
    None = 2,
}

// Main class controlling the state of the canvas.
export class Board {
    zoomGlobal: number;
    zoomLevels: number[];
    zoomVal: number;
    offset: Vec2;
    mouseCoords: Vec2;
    leftMouseDown: boolean;
    rightMouseDown: boolean;
    boardLayers: BoardLayer[];
    modeMan: ModeManager;
    activeLayer: number;
    laserCol: string;

    constructor() {
        this.zoomGlobal = 5;
        this.zoomLevels = [
            2, 3, 4, 6, 8, 10, 13, 16, 20, 24, 28, 32, 38, 44, 50,
        ];
        this.zoomVal = this.zoomLevels[this.zoomGlobal];
        this.offset = { x: 0, y: 0 };
        this.mouseCoords = { x: 0, y: 0 };
        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.boardLayers = [];
        this.modeMan = new ModeManager(this);
        this.activeLayer = 0;
        this.laserCol = BLUE;
    }

    recolourLaser(newCol: string) {
        this.laserCol = newCol;
    }

    // Clears a layer of all of its objects, and tells the server to do the same.
    clearLayer(layerId: number) {
        const layer = storedLayers.get(layerId);
        if (layer) {
            const destroyItems = [];
            for (const [key, val] of layer.heldMap) {
                destroyItems.push(key);
            }
            serveInter.destroyObjects(destroyItems, true);
        }
    }

    // Test function for pointer drawing.
    // Will be removed when a proper laser tool is added.
    // oh no its part of the proper laser tool's functionality it's stuck here forever
    drawMousePointer() {
        ctx.beginPath();
        ctx.arc(
            this.mouseCoords.x,
            this.mouseCoords.y,
            5,
            0,
            2 * Math.PI,
            false,
        );
        ctx.fillStyle = this.leftMouseDown ? RED.toString() : this.laserCol;
        ctx.fill();
        ctx.closePath();
    }

    // Draws a laser from the details of a laser event.
    drawLaser(x: number, y: number, col: string) {
        ctx.beginPath();
        ctx.arc(
            x * 5 * this.zoomVal + this.offset.x,
            y * 5 * this.zoomVal + this.offset.y,
            5,
            0,
            2 * Math.PI,
            false,
        );
        ctx.fillStyle = col;
        ctx.fill();
        ctx.closePath();
    }

    // Updates the center of the camera, subject to the boundaries of the board.
    moveCamera(xMod: number, yMod: number) {
        this.offset.x -= xMod;
        this.offset.y -= yMod;
    }

    // Sorts held board layers by zOrder.
    sortLayers() {
        this.boardLayers = this.boardLayers.sort((n1, n2) => {
            if (n1.zOrder > n2.zOrder) {
                return 1;
            }
            if (n1.zOrder < n2.zOrder) {
                return -1;
            }
            return 0;
        });
    }

    // Deletes an object based on the Id of the object and the layer it belongs on.
    removeObject(objectId: number, layerId: number = -1) {
        storedObjects.delete(objectId);
        if (layerId === -1) {
            for (const layer of this.boardLayers) {
                if (layer.removeObject(objectId)) {
                    return true;
                }
            }
            return false;
        } else {
            const layer = storedLayers.get(layerId);
            if (layer) {
                layer.removeObject(objectId);
            }
            return true;
        }
    }

    // Changes the offset of specified layer.
    moveLayer(moveId: number, moveX: number, moveY: number) {
        const layer = storedLayers.get(moveId);
        if (layer) {
            layer.shiftLayer({ x: moveX, y: moveY });
        }
    }

    // Retrieves objects corresponding to set of coordinates
    selectObjects(
        targetType: string = 'any',
        coords: Vec2[] = this.modeMan.getSelectCoords(),
    ) {
        const layer = storedLayers.get(this.activeLayer);
        if (layer) {
            return layer.selectObjects(coords, targetType);
        }
        return [];
    }

    // Selects a single token.
    selectToken(fixedPoint: Vec2[], matchType: string = 'any') {
        if (serveInter.isGm) {
            const layer = storedLayers.get(this.activeLayer);
            let newSelected = undefined;
            if (layer) {
                const selected = layer.selectObjects(fixedPoint, matchType)[0];
                return selected;
            }
            return newSelected;
        } else {
            for (const [key, val] of storedLayers) {
                const selected = val.selectObjects(fixedPoint, matchType)[0];
                if (selected) {
                    return selected;
                }
            }
            return undefined;
        }
    }

    // Draws points at the vertices of the tiles for.
    drawPointGrid(squareSize: number) {
        let currX = this.offset.x;
        while (currX + squareSize > 0) {
            currX -= squareSize;
        }
        while (currX < can.width + 100) {
            let currY = this.offset.y;
            while (currY + squareSize > 0) {
                currY -= squareSize;
            }
            while (currY < can.height + 100) {
                if (
                    currX <= this.offset.x &&
                    currX + squareSize >= this.offset.x
                ) {
                    ctx.fillStyle = WHITE.toString();
                } else {
                    ctx.fillStyle = WHITE.toString();
                }
                ctx.fillRect(currX - 1, currY - 1, 2, 2);
                currY += squareSize;
            }
            currX += squareSize;
        }
    }

    // Determines which tile/vertex a coordinate pair is located on.
    determineTile(x: number, y: number, type: CoordModes) {
        const squareSize = 5 * this.zoomVal;
        if (type === CoordModes.Vertex) {
            return {
                x: Math.round((x - this.offset.x) / squareSize),
                y: Math.round((y - this.offset.y) / squareSize),
            };
        } else if (type === CoordModes.Center) {
            return {
                x: Math.floor((x - this.offset.x) / squareSize),
                y: Math.floor((y - this.offset.y) / squareSize),
            };
        } else {
            return {
                x: (x - this.offset.x) / squareSize,
                y: (y - this.offset.y) / squareSize,
            };
        }
    }

    // Draws the board.
    draw() {
        const squareSize = 5 * this.zoomVal;
        for (const [i, layer] of this.boardLayers.entries()) {
            layer.drawLayer(
                ctx,
                squareSize,
                this.offset,
                this.modeMan.selectMan.thirdOffset,
                serveInter.isGm,
            );
            if (i === this.activeLayer) {
                const tempObj = this.modeMan.getObject(GetObjectReason.Draw) as
                    | BoardObject
                    | undefined;
                if (tempObj) {
                    tempObj.draw(ctx, squareSize, this.offset);
                }
            }
        }
        this.drawPointGrid(squareSize);
        if (this.modeMan.sendLaser) {
            this.drawMousePointer();
        }
        this.modeMan.step();
    }

    // Performs a single drawing step.
    step() {
        if (can.width !== window.innerWidth) {
            can.width = window.innerWidth;
            can.height = window.innerHeight;
        }
        ctx.clearRect(0, 0, can.width, can.height);
        this.draw();
        const newLasers = serveInter.getLasers();
        for (const [key, val] of newLasers) {
            if (Date.now() - val.time < 1500) {
                this.drawLaser(
                    val.coords.x,
                    val.coords.y,
                    val.colour.toString(),
                );
            }
        }
    }
}
