import type * as BoardLayer from './boardLayer.ts';
import { ObjType, Token } from './boardObject.ts';
import type { BoardBounds, Vec2 } from './coords.ts';
import { GetObjectReason, ModeManager } from './modeManager.ts';
import { BLUE, RED, WHITE } from '../colors.ts';
import { getRequiredElement } from '../dom.ts';

const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;

// Main class controlling the state of the canvas.
// Somewhat oversized, may be split up eventually.
export class Board {
  zoomGlobal: number;
  zoomLevels: number[];
  zoomVal: number;
  originCoords: Vec2;
  mouseCoords: Vec2;
  boardBounds: BoardBounds;
  leftMouseDown: boolean;
  boardLayers: BoardLayer.BoardLayer[];
  layerMap: Map<number, BoardLayer.BoardLayer>;
  modeMan: ModeManager;
  activeLayer: number;

  constructor() {
    this.zoomGlobal = 3;
    this.zoomLevels = [4, 6, 8, 10, 13, 16, 20, 24, 28, 32];
    this.zoomVal = this.zoomLevels[this.zoomGlobal];
    this.originCoords = { x: 0, y: 0 };
    this.mouseCoords = { x: 0, y: 0 };
    this.boardBounds = { minX: -200, maxX: 200, minY: -200, maxY: 200 };
    this.leftMouseDown = false;
    this.boardLayers = [];
    this.layerMap = new Map();
    this.modeMan = new ModeManager(this);
    this.activeLayer = 0;
  }

  // Test function for pointer drawing.
  // Will be removed when a proper laser tool is added.
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
    ctx.fillStyle = BLUE.toString();
    if (this.leftMouseDown) {
      ctx.fillStyle = RED.toString();
    }
    ctx.fill();
    ctx.closePath();
  }

  // Ensures camera is kept within the board boundaries.
  bindCamera() {
    if (this.originCoords.x < (this.boardBounds.minX - 100) * this.zoomVal) {
      this.originCoords.x = (this.boardBounds.minX - 100) * this.zoomVal;
    } else if (
      this.originCoords.x >
      (this.boardBounds.maxX + 100) * this.zoomVal
    ) {
      this.originCoords.x = (this.boardBounds.maxX + 100) * this.zoomVal;
    }
    if (this.originCoords.y < (this.boardBounds.minY - 100) * this.zoomVal) {
      this.originCoords.y = (this.boardBounds.minY - 100) * this.zoomVal;
    } else if (
      this.originCoords.y >
      (this.boardBounds.maxY + 100) * this.zoomVal
    ) {
      this.originCoords.y = (this.boardBounds.maxY + 100) * this.zoomVal;
    }
  }

  // Updates the center of the camera, subject to the boundaries of the board.
  moveCamera(xMod: number, yMod: number) {
    this.originCoords.x -= xMod;
    this.originCoords.y -= yMod;
    this.bindCamera();
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
  addLayer(newLayer: BoardLayer.BoardLayer, newID: number) {
    this.boardLayers.push(newLayer);
    this.layerMap.set(newID, newLayer);
    this.sortLayers();
  }

  // Removes a new board layer, then sorts the layers.
  // Returns false if the provided layer is not found.
  removeLayer(removeID: number) {
    const layer = this.layerMap.get(removeID);
    if (!layer) {
      return false;
    }
    const removeIndex = this.boardLayers.indexOf(layer);
    if (!this.layerMap.delete(removeID)) {
      return false;
    }
    this.boardLayers.splice(removeIndex, 1);
    this.sortLayers();
    return true;
  }

  // Moves an object based on the ID of just the object.
  moveObject(objID: number, layerID: number, moveX: number, moveY: number) {
    const layer = this.layerMap.get(layerID);
    if (layer) {
      layer.moveObject(objID, moveX, moveY);
    }
  }

  // Deletes an object based on the ID of the object and the layer it belongs on.
  removeObject(objID: number, layerID: number = -1) {
    if (layerID === -1) {
      for (const layer of this.boardLayers) {
        if (layer.removeObject(objID)) {
          return true;
        }
      }
      return false;
    } else {
      const layer = this.layerMap.get(layerID);
      if (layer) {
        layer.removeObject(objID);
      }
      return true;
    }
  }

  // Adds an object to a specified layer.
  addObject(objID: number, layerID: number, newObject: BoardLayer.LayerObject) {
    const layer = this.layerMap.get(layerID);
    if (layer) {
      layer.addObject(newObject, objID);
    }
  }

  // Changes the offset of specified layer.
  moveLayer(moveID: number, moveX: number, moveY: number) {
    const layer = this.layerMap.get(moveID);
    if (layer) {
      layer.shiftLayer({ x: moveX, y: moveY });
    }
  }

  // Checks if the mode manager is in a state to complete a selection, retrieves all objects in the selection if so.
  selectObjects(targetType: ObjType = ObjType.Any) {
    const layer = this.layerMap.get(this.activeLayer);
    if (layer) {
      return layer.selectObjects(this.modeMan.getSelectCoords(), targetType);
    }
    return [];
  }

  selectToken(fixedPoint: Vec2[]) {
    const layer = this.layerMap.get(this.activeLayer);
    if (layer) {
      const selected = layer.selectObjects(fixedPoint, ObjType.Token)[0];
      if (selected instanceof Token) {
        return selected;
      }
    }
    return undefined;
  }

  // Draws points at the vertices of the tiles for.
  drawPointGrid(squareSize: number) {
    let currX = this.originCoords.x;
    while (currX + squareSize < 0) {
      currX += squareSize;
    }
    while (currX < can.width + 100) {
      let currY = this.originCoords.y;
      while (currY + squareSize < 0) {
        currY += squareSize;
      }
      while (currY < can.height + 100) {
        if (
          currX <= this.originCoords.x &&
          currX + squareSize >= this.originCoords.x
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
        x: Math.round((x - this.originCoords.x) / squareSize),
        y: Math.round((y - this.originCoords.y) / squareSize),
      };
    } else {
      return {
        x: Math.floor((x - this.originCoords.x) / squareSize),
        y: Math.floor((y - this.originCoords.y) / squareSize),
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
        this.originCoords,
        this.modeMan.selectMan.thirdOffset,
      );
      if (i === this.activeLayer) {
        const tempObj = this.modeMan.getObject(GetObjectReason.Draw) as
          | BoardLayer.LayerObject
          | number;
        if (tempObj && typeof tempObj !== 'number') {
          tempObj.draw(ctx, squareSize, this.originCoords);
        }
      }
    }
    this.drawPointGrid(squareSize);
    this.drawMousePointer();
    this.modeMan.step(ctx, squareSize, this.originCoords);
  }

  getModeManObject() {
    return this.modeMan.getObject(GetObjectReason.Create);
  }

  // Performs a single drawing step.
  step() {
    if (can.width !== window.innerWidth) {
      can.width = window.innerWidth;
      can.height = window.innerHeight;
    }
    ctx.clearRect(0, 0, can.width, can.height);
    this.draw();
  }

  // Checks if a deletion request has been made, deletes marked objects if so.
  getDeletion() {
    if (this.modeMan.deleteTrigger) {
      const deletion = this.modeMan.getSelected();
      this.modeMan.clearSelected();
      return deletion;
    }
    return undefined;
  }

  changeLayerZ(layerId: number, newVal: number): void {
    const layer = this.layerMap.get(layerId);
    if (layer) {
      layer.zOrder = newVal;
    }
    this.sortLayers();
  }
}
