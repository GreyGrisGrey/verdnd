import { BoardLayer } from './boardLayer.ts';
import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { GetObjectReason, ModeManager } from './modeManager.ts';
import { BLUE, GREY } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { ImageObject } from './imageObject.ts';
import { LayerMenu } from '../rightBar/layerBarMenu.ts';
const layerMan = new LayerMenu();
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;
const storedObjects: Map<number, BoardObject> = new Map();
const storedLayers: Map<number, BoardLayer> = new Map();
const serveInter = new TempStore();
const modeMan = new ModeManager();

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
    midMouseDown: boolean;
    rightMouseDown: boolean;
    laserCol: string;
    zLayers: Map<number, BoardLayer>;
    bgImage: ImageObject;

    constructor() {
        this.zoomGlobal = 5;
        this.zoomLevels = [
            2, 3, 4, 6, 8, 10, 13, 16, 20, 24, 28, 32, 38, 44, 50,
        ];
        this.zoomVal = this.zoomLevels[this.zoomGlobal];
        this.offset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.mouseCoords = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        this.leftMouseDown = false;
        this.midMouseDown = false;
        this.rightMouseDown = false;
        this.laserCol = BLUE;
        this.zLayers = new Map();
        this.bgImage = new ImageObject();
    }

    // Changes the current laser colour.
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

    // Creats a new z layer map.
    updateZLayers() {
        this.zLayers = new Map();
        for (const [key, val] of storedLayers) {
            this.zLayers.set(val.zOrder, val);
        }
    }

    // Test function for pointer drawing.
    // Will be removed when a proper laser tool is added.
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
        ctx.fillStyle = this.laserCol;
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

    // Deletes an object based on the Id of the object and the layer it belongs on.
    removeObject(objectId: number, layerId: number = -1) {
        storedObjects.delete(objectId);
        if (layerId === -1) {
            for (const [key, val] of storedLayers) {
                if (val.removeObject(objectId)) {
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
        coords: Vec2[] = modeMan.getSelectCoords(),
    ) {
        const layer = storedLayers.get(layerMan.currSelect);
        if (layer) {
            return layer.selectObjects(coords, targetType);
        }
        return [];
    }

    // Selects a single token.
    selectToken(fixedPoint: Vec2[], matchType: string = 'any') {
        for (const [key, val] of storedLayers) {
            const selected = val.selectObjects(fixedPoint, matchType)[0];
            if (selected) {
                return selected;
            }
        }
        return undefined;
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
                    ctx.fillStyle = GREY.toString();
                } else {
                    ctx.fillStyle = GREY.toString();
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

    // Updates the background image of the board.
    updateImage(addImage: boolean) {
        if (addImage) {
            this.bgImage.updateImage(
                can.width,
                can.height,
                -1,
                Number(window.location.pathname.split('/')[2]) | 0,
                true,
            );
        } else {
            this.bgImage.disableImage();
        }
    }

    // Draws the board.
    draw() {
        const squareSize = 5 * this.zoomVal;
        this.bgImage.draw();
        for (let i = 0; i < this.zLayers.size; i++) {
            const layer = this.zLayers.get(i);
            if (layer) {
                layer.drawLayer(
                    ctx,
                    squareSize,
                    this.offset,
                    modeMan.selectMan.thirdOffset,
                    serveInter.isGm,
                );
                if (layer.id === layerMan.currSelect) {
                    const tempObj = modeMan.getObject(GetObjectReason.Draw) as
                        | BoardObject
                        | undefined;
                    if (tempObj) {
                        tempObj.draw(ctx, squareSize, this.offset);
                    }
                }
            }
        }
        this.drawPointGrid(squareSize);
        if (modeMan.sendLaser) {
            this.drawMousePointer();
        }
        modeMan.step();
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
