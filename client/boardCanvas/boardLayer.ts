import type { BoardObject } from './boardObject.ts';
import { Shape } from '../../shared/objectEvents.ts';
import type { Vec2 } from '../../shared/coords.ts';

// Manages a single layer of the board.
// Currently has little functionality.
export class BoardLayer {
    layerOffset: Vec2;
    heldObjects: BoardObject[];
    heldMap: Map<number, BoardObject>;
    zOrder: number;
    GMVisible: boolean;
    playerVisible: boolean;

    constructor(newOrder: number, newGM: boolean, newPlayer: boolean) {
        this.layerOffset = { x: 0, y: 0 };
        this.heldObjects = [];
        this.heldMap = new Map();
        this.zOrder = newOrder;
        this.GMVisible = newGM;
        this.playerVisible = newPlayer;
    }

    // Updates the visibility values of the layer.
    updateVis(newGM: boolean, newPlayer: boolean) {
        this.GMVisible = newPlayer;
        this.playerVisible = newGM;
    }

    // Sorts the board objects based on zOrder.
    sortObjects() {
        this.heldObjects = this.heldObjects.sort((n1, n2) => {
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
    addObject(newObj: BoardObject, newId: number) {
        this.heldObjects.push(newObj);
        this.heldMap.set(newId, newObj);
        this.sortObjects();
    }

    // Removes a board object.
    removeObject(removeId: number) {
        const toRemove = this.heldMap.get(removeId);
        if (!toRemove) {
            console.log('Error no object with such Id exists to remove');
            return false;
        }
        const removeIndex = this.heldObjects.indexOf(toRemove);
        if (!this.heldMap.delete(removeId)) {
            console.log('Error no object with such Id exists to remove');
            return false;
        }
        this.heldObjects.splice(removeIndex, 1);
        this.sortObjects();
        this.heldMap.delete(removeId);
        return true;
    }

    // Draws each board object on the layer.
    drawLayer(
        ctx: CanvasRenderingContext2D,
        squareSize: number,
        offset: Vec2,
        thirdOffset: Vec2 = { x: 0, y: 0 },
    ) {
        if (this.GMVisible) {
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
    }

    // Shifts the layer's offset.
    shiftLayer(moveCoords: Vec2) {
        this.layerOffset.x += moveCoords.x;
        this.layerOffset.y += moveCoords.y;
    }

    // Selects all objects on the layer that match the corresponding coordinates.
    // If one coordinate point is provided, checks if said point is contained within the object.
    // If two points are provided, checks if each object's center is contained within the produced rectangle.
    selectObjects(selectCoords: Vec2[], matchType: string = 'any') {
        const acceptable: BoardObject[] = [];
        for (const candidate of this.heldObjects) {
            if (
                selectCoords.length === 1 &&
                'isPointInside' in candidate &&
                candidate.isPointInside(selectCoords[0]) &&
                (candidate.hasToken() || matchType === 'any')
            ) {
                acceptable.push(candidate);
            } else if (
                selectCoords.length === 2 &&
                candidate.isCenterInsideRect(
                    selectCoords[0],
                    selectCoords[1],
                ) &&
                (candidate.hasToken() || matchType === 'any')
            ) {
                acceptable.push(candidate);
            }
        }
        if (selectCoords.length === 1 && acceptable.length > 0) {
            return [acceptable[acceptable.length - 1]];
        }
        return acceptable;
    }
}
