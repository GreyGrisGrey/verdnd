// Manages a single layer of the board.
import * as BoardObject from "./boardObject.ts"

export class BoardLayer {
    layerOffset: Array<number>
    heldObjects: Array<any>
    heldMap: Map<number, any>
    zOrder: number
    visible: boolean
    
    constructor() {
        this.heldObjects = new Array()
        this.heldMap = new Map()
        this.zOrder = 0
        this.visible = true
        this.layerOffset = [0, 0]
    }
    
    // Sorts the board objects based on zOrder.
    sortObjects() {
        this.heldObjects = this.heldObjects.sort((n1, n2) => {
            if (n1.zOrder > n2.zOrder) {
                return 1
            }
            if (n1.zOrder < n2.zOrder) {
                return -1
            }
            return 0
        })
    }
    
    // Adds a new board object, then sorts the board objects.
    addObject(newObj: BoardObject.BoardObject, newID: number) {
        this.heldObjects.push(newObj)
        this.heldMap.set(newID, newObj)
        this.sortObjects()
    }
    
    // Removes a board object.
    removeObject(removeID: number): boolean {
        let removeIndex = this.heldObjects.indexOf(this.heldMap.get(removeID))
        if (!this.heldMap.delete(removeID)) {
            alert("aa")
            return false
        }
        this.heldObjects.splice(removeIndex, 1)
        this.sortObjects()
        this.heldMap.delete(removeID)
        return true
    }
    
    // Attempts to move a board object.
    // If no board object with a corresponding ID exists, returns false, otherwise true.
    moveObject(moveID: number, moveX: number, moveY: number): boolean {
        if (!this.heldMap.has(moveID)) {
            return false
        }
        this.heldMap.get(moveID).move(moveX, moveY)
        return true
    }
    
    // Draws each board object on the layer.
    drawLayer(ctx:any, squareSize:number, offset:Array<number>) {
        let localOffset = [offset[0] + this.layerOffset[0], offset[1] + this.layerOffset[1]]
        for (let i = 0; i < this.heldObjects.length; i++) {
            this.heldObjects[i].draw(ctx, squareSize, localOffset)
        }
    }
    
    // Shifts the layer's offset.
    shiftLayer(moveCoords: Array<number>) {
        this.layerOffset[0] += moveCoords[0]
        this.layerOffset[1] += moveCoords[1]
    }
}