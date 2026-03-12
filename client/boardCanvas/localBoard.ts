import { BoardLayer } from './boardLayer.ts';
import type { BoardObject } from './boardObject.ts';
import { Box, Polyline } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import { GetObjectReason, ModeManager } from './modeManager.ts';
import { BLUE, RED, WHITE } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import { Shape } from '../objectEvents.ts';
import { tempStore } from '../serveInter.ts';
import { ObjectCreatePayload, LayerState } from '../objectEvents.ts';
import { BoardToken } from './boardToken.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;

function payloadToBoardObject(p: ObjectCreatePayload): BoardObject {
    switch (p.kind) {
        case Shape.Ellipse:
        case Shape.Rect:
            return new Box(
                p.objectId,
                p.x,
                p.y,
                p.width,
                p.height,
                p.colour,
                p.kind,
            );
        case Shape.Line:
        case Shape.Polyline:
            return new Polyline(
                p.objectId,
                p.x,
                p.y,
                p.points,
                p.colour,
                p.kind,
            );
        default: {
            throw new Error('Unknown shape');
        }
    }
}

// Main class controlling the state of the canvas.
// Somewhat oversized, may be split up eventually.
export class Board {
    zoomGlobal: number;
    zoomLevels: number[];
    zoomVal: number;
    offset: Vec2;
    mouseCoords: Vec2;
    leftMouseDown: boolean;
    rightMouseDown: boolean;
    boardLayers: BoardLayer[];
    layerMap: Map<number, BoardLayer>;
    objectMap: Map<number, BoardObject>;
    modeMan: ModeManager;
    activeLayer: number;
    serveInter: tempStore;
    laserCol: string;
    defaultToken: BoardToken;

    constructor(server: tempStore) {
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
        this.layerMap = new Map();
        this.objectMap = new Map();
        this.modeMan = new ModeManager(this);
        this.activeLayer = 0;
        this.serveInter = server;
        this.laserCol = BLUE;
        this.defaultToken = new BoardToken(
            'squonk',
            'skibidi',
            '#cc0000',
            true,
        );
    }

    recolourLaser(newCol: string) {
        this.laserCol = newCol;
    }

    // Test function for pointer drawing.
    // Will be removed when a proper laser tool is added.
    // oh no its part of the proper laser tool's functionality it's stuck here forever
    drawMousePointer() {
        ctx.beginPath();
        ctx.arc(
            this.mouseCoords.x,
            this.mouseCoords.y,
            1 * this.zoomVal,
            0,
            2 * Math.PI,
            false,
        );
        ctx.fillStyle = this.leftMouseDown ? RED.toString() : this.laserCol;
        ctx.fill();
        ctx.closePath();
    }

    drawLaser(x: number, y: number, col: string) {
        ctx.beginPath();
        ctx.arc(
            x * 5 * this.zoomVal + this.offset.x,
            y * 5 * this.zoomVal + this.offset.y,
            1 * this.zoomVal,
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

    // Adds a new board layer, then sorts the layers.
    addLayer(newLayer: LayerState) {
        if (newLayer.id === undefined) {
            return;
        }
        const currLayer = this.layerMap.get(newLayer.id!);
        if (currLayer) {
            currLayer.updateVis(newLayer.playerVisible, newLayer.gmVisible);
        } else {
            const toAdd = new BoardLayer(
                newLayer.zOrder,
                newLayer.gmVisible,
                newLayer.playerVisible,
            );
            this.layerMap.set(newLayer.id!, toAdd);
            this.boardLayers.push(toAdd);
            this.boardLayers.sort();
        }
    }

    // Returns the layer corresponding to a layerId.
    getLayer(layerId: number) {
        return this.layerMap.get(layerId);
    }

    // Returns the object corresponding to an objectId.
    getObjectById(objectId: number) {
        return this.objectMap.get(objectId);
    }

    // Removes a new board layer, then sorts the layers.
    // Returns false if the provided layer is not found.
    removeLayer(removeId: number) {
        const layer = this.layerMap.get(removeId);
        if (!layer) {
            return false;
        }
        const removeIndex = this.boardLayers.indexOf(layer);
        if (!this.layerMap.delete(removeId)) {
            return false;
        }
        this.boardLayers.splice(removeIndex, 1);
        this.sortLayers();
        return true;
    }

    // Deletes an object based on the Id of the object and the layer it belongs on.
    removeObject(objectId: number, layerId: number = -1) {
        this.objectMap.delete(objectId);
        if (layerId === -1) {
            for (const layer of this.boardLayers) {
                if (layer.removeObject(objectId)) {
                    return true;
                }
            }
            return false;
        } else {
            const layer = this.layerMap.get(layerId);
            if (layer) {
                layer.removeObject(objectId);
            }
            return true;
        }
    }

    // Adds an object to a specified layer. Updates object if it already exists.
    addObject(layerId: number, newObject: ObjectCreatePayload) {
        const layer = this.layerMap.get(layerId);
        const currObj = this.objectMap.get(newObject.objectId!);
        if (!layer) {
            return;
        } else if (currObj) {
            currObj.updateFromPayload(newObject as any);
            return;
        }
        const addObj = payloadToBoardObject(newObject);
        addObj.setToken(this.defaultToken, 1);
        this.objectMap.set(addObj.objectId, addObj);
        if (layer) {
            layer.addObject(addObj, addObj.objectId);
        }
    }

    // Changes the offset of specified layer.
    moveLayer(moveId: number, moveX: number, moveY: number) {
        const layer = this.layerMap.get(moveId);
        if (layer) {
            layer.shiftLayer({ x: moveX, y: moveY });
        }
    }

    // Retrieves objects corresponding to set of coordinates
    selectObjects(
        targetType: string = 'any',
        coords: Vec2[] = this.modeMan.getSelectCoords(),
    ) {
        const layer = this.layerMap.get(this.activeLayer);
        if (layer) {
            return layer.selectObjects(coords, targetType);
        }
        return [];
    }

    // Selects a single token.
    selectToken(fixedPoint: Vec2[]) {
        const layer = this.layerMap.get(this.activeLayer);
        let newSelected = undefined;
        if (layer) {
            const selected = layer.selectObjects(fixedPoint, Shape.Token)[0];
            return selected;
        }
        return newSelected;
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
    determineTile(x: number, y: number, vertex: boolean) {
        const squareSize = 5 * this.zoomVal;
        if (vertex) {
            return {
                x: Math.round((x - this.offset.x) / squareSize),
                y: Math.round((y - this.offset.y) / squareSize),
            };
        } else {
            return {
                x: Math.floor((x - this.offset.x) / squareSize),
                y: Math.floor((y - this.offset.y) / squareSize),
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
        const newLasers = this.serveInter.getLasers();
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
