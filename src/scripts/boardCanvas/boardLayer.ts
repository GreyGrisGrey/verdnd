import type { Circle, Line, Polyline, Rect, Token } from './boardObject.ts';
import { ObjType } from './boardObject.ts';
import type { Vec2 } from './coords.ts';

export type LayerObject = Circle | Line | Polyline | Rect | Token;

// Manages a single layer of the board.
// Currently has little functionality.
export class BoardLayer {
  layerOffset: Vec2;
  heldObjects: LayerObject[];
  heldMap: Map<number, LayerObject>;
  zOrder: number;
  visible: boolean;

  constructor() {
    this.heldObjects = [];
    this.heldMap = new Map();
    this.zOrder = 0;
    this.visible = true;
    this.layerOffset = { x: 0, y: 0 };
  }

  // Sorts the board objects based on zOrder.
  sortObjects() {
    this.heldObjects = this.heldObjects.sort((n1, n2) => {
      if (n1.objType === ObjType.Token && n2.objType !== ObjType.Token) {
        return 1;
      }
      if (n1.objType !== ObjType.Token && n2.objType === ObjType.Token) {
        return -1;
      }
      if (n1.selected && !n2.selected) {
        return 1;
      }
      if (!n1.selected && n2.selected) {
        return -1;
      }
      if (n1.zOrder > n2.zOrder) {
        return 1;
      }
      if (n1.zOrder < n2.zOrder) {
        return -1;
      }
      return 0;
    });
  }

  // Adds a new board object, then sorts the board objects.
  addObject(newObj: LayerObject, newID: number) {
    this.heldObjects.push(newObj);
    this.heldMap.set(newID, newObj);
    this.sortObjects();
  }

  // Removes a board object.
  removeObject(removeID: number) {
    const toRemove = this.heldMap.get(removeID);
    if (!toRemove) {
      alert('Error no object with such ID exists to remove');
      return false;
    }
    const removeIndex = this.heldObjects.indexOf(toRemove);
    if (!this.heldMap.delete(removeID)) {
      alert('Error no object with such ID exists to remove');
      return false;
    }
    this.heldObjects.splice(removeIndex, 1);
    this.sortObjects();
    this.heldMap.delete(removeID);
    return true;
  }

  // Attempts to move a board object.
  // If no board object with a corresponding ID exists, returns false, otherwise true.
  moveObject(moveID: number, moveX: number, moveY: number) {
    const targetObj = this.heldMap.get(moveID);
    if (!targetObj) {
      return false;
    }
    targetObj.move(moveX, moveY);
    return true;
  }

  // Draws each board object on the layer.
  drawLayer(
    ctx: CanvasRenderingContext2D,
    squareSize: number,
    offset: Vec2,
    thirdOffset: Vec2 = { x: 0, y: 0 },
  ) {
    const localOffset: Vec2 = {
      x: offset.x + this.layerOffset.x,
      y: offset.y + this.layerOffset.y,
    };
    for (const obj of this.heldObjects) {
      if (obj.selected) {
        obj.draw(ctx, squareSize, {
          x: localOffset.x + thirdOffset.x,
          y: localOffset.y + thirdOffset.y,
        });
      } else {
        obj.draw(ctx, squareSize, localOffset);
      }
    }
  }

  // Shifts the layer's offset.
  shiftLayer(moveCoords: Vec2) {
    this.layerOffset.x += moveCoords.x;
    this.layerOffset.y += moveCoords.y;
  }

  // Selects all objects on the layer that match the corresponding coordinates.
  // If one coordinate point is provided, checks if said point is contained within the object.
  // If two points are provided, checks if each object's center is contained within the produced rectangle.
  selectObjects(selectCoords: Vec2[], matchType: ObjType = ObjType.Any) {
    const acceptable: LayerObject[] = [];
    for (const candidate of this.heldObjects) {
      if (
        selectCoords.length === 1 &&
        'isPointInside' in candidate &&
        candidate.isPointInside(selectCoords[0]) &&
        (candidate.objType === matchType || matchType === ObjType.Any)
      ) {
        acceptable.push(candidate);
        break;
      } else if (
        selectCoords.length === 2 &&
        candidate.isCenterInsideRect(selectCoords[0], selectCoords[1]) &&
        (candidate.objType === matchType || matchType === ObjType.Any)
      ) {
        acceptable.push(candidate);
      }
    }
    return acceptable;
  }
}
