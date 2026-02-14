// File managing the local version of the board.
import * as BoardLayer from "./boardLayer.ts"
import * as viewMode from "./boardViewMode.ts"
import * as drawMode from "./boardDrawMode.ts"
import * as tokenMode from "./boardTokenMode.ts"

export class Board {
    zoomGlobal: number
    zoomLevels: Array<number>
    zoomVal: number
    originCoords: Array<number>
    mouseCoords: Array<number>
    boardBounds: Array<number>
    can: HTMLElement
    ctx: any
    leftMouseDown: boolean
    boardLayers: Array<BoardLayer.BoardLayer>
    layerMap: Map<number, BoardLayer.BoardLayer>
    currMode: string
    viewObj: viewMode.BoardViewMode
    tokenObj: tokenMode.BoardTokenMode
    drawObj: drawMode.BoardDrawMode
    
    constructor(can: HTMLElement) {
        this.zoomGlobal = 3
        this.zoomLevels = [4, 6, 8, 10, 13, 16, 20, 24, 28, 32]
        this.zoomVal = this.zoomLevels[this.zoomGlobal]
        this.can = can
        this.ctx = can.getContext('2d')
        this.originCoords = [0, 0]
        this.mouseCoords = [0, 0]
        this.boardBounds = [-200, 200, -200, 200]
        this.leftMouseDown = false
        this.boardLayers = new Array()
        this.layerMap = new Map()
        this.currMode = "VIEW"
        this.viewObj = new viewMode.BoardViewMode(this)
        this.tokenObj = new tokenMode.BoardTokenMode(this)
        this.drawObj = new drawMode.BoardDrawMode(this)
        this.addEventListeners()
    }
    
    // Adds various event listeners for mouse movement and scrolling.
    addEventListeners(): void {
        this.viewObj.addEventListeners()
        this.drawObj.addEventListeners()
        this.tokenObj.addEventListeners()
    }
    
    swapMode(newMode: string): void {
        this.currMode = newMode
        this.tokenObj.flipListeners(false)
        this.viewObj.flipListeners(false)
        this.drawObj.flipListeners(false)
        if (newMode === "VIEW") {
            this.viewObj.flipListeners(true)
        } else if (newMode === "TOKEN") {
            this.tokenObj.flipListeners(true)
        } else if (newMode === "DRAW") {
            this.drawObj.flipListeners(true)
        }
    }
    
    flipView(): void {
        this.viewObj.flipListeners(true)
        return
    }
    
    // Test function for pointer drawing.
    drawMousePointer(): void {
        this.ctx.beginPath()
        this.ctx.arc(this.mouseCoords[0], this.mouseCoords[1], 1 * this.zoomVal, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "#0000cc"
        if (this.leftMouseDown) {
            this.ctx.fillStyle = "#cc0000"
        }
        this.ctx.fill()
        this.ctx.closePath()
        return
    }
    
    // Ensures camera is kept within the board boundaries.
    bindCamera():void {
        if (this.originCoords[0] < (this.boardBounds[0] - 100) * this.zoomVal) {
            this.originCoords[0] = (this.boardBounds[0] - 100)  * this.zoomVal
        } else if (this.originCoords[0] > (this.boardBounds[1] + 100) * this.zoomVal) {
            this.originCoords[0] = (this.boardBounds[1] + 100) * this.zoomVal
        }
        if (this.originCoords[1] < (this.boardBounds[2] - 100) * this.zoomVal) {
            this.originCoords[1] = (this.boardBounds[2] - 100) * this.zoomVal
        } else if (this.originCoords[1] > (this.boardBounds[3] + 100) * this.zoomVal) {
            this.originCoords[1] = (this.boardBounds[3] + 100) * this.zoomVal
        }
    }
    
    // Updates the center of the camera, subject to the boundaries of the board.
    moveCamera(xMod:number, yMod:number): void {
        this.originCoords[0] -= xMod
        this.originCoords[1] -= yMod
        this.bindCamera()
        return
    }
    
    // Sorts held board layers by zOrder.
    sortLayers(): void {
        this.boardLayers = this.boardLayers.sort((n1, n2) => {
            if (n1.zOrder > n2.zOrder) {
                return 1
            }
            if (n1.zOrder < n2.zOrder) {
                return -1
            }
            return 0
        })
        return
    }
    
    // Adds a new board layer, then sorts the layers.
    addLayer(newLayer: BoardLayer.BoardLayer, newID: number): void {
        this.boardLayers.push(newLayer)
        this.layerMap.set(newID, newLayer)
        this.sortLayers()
        return
    }
    
    // Removes a new board layer, then sorts the layers.
    // Returns false if the provided layer is not found.
    removeLayer(removeID: number): boolean {
        let removeIndex = this.boardLayers.indexOf(this.layerMap.get(removeID)!)
        if (!this.layerMap.delete(removeID)) {
            return false
        }
        this.boardLayers.splice(removeIndex, 1)
        this.sortLayers()
        return true
    }
    
    // Moves an object based on the ID of just the object.
    moveObject(objID: number, layerID: number, moveX: number, moveY: number): void {
        this.layerMap.get(layerID)!.moveObject(objID, moveX, moveY)
        return
    }
    
    // Deletes an object based on the ID of the object and the layer it belongs on.
    removeObject(objID: number, layerID: number = -1): boolean {
        if (layerID == -1) {
            for (let i = 0; i < this.boardLayers.length; i++) {
                if (this.boardLayers[0].removeObject(objID)) {
                    return true
                }
            }
            return false
        } else {
            this.layerMap.get(layerID)!.removeObject(objID)
            return true
        }
    }
    
    // Adds an object to a specified layer.
    addObject(objID: number, layerID: number, newObject: any) {
        this.layerMap.get(layerID)!.addObject(newObject, objID)
    }
    
    
    // Changes the offset of specified layer.
    moveLayer(moveID: number, moveX: number, moveY: number): void {
        this.layerMap.get(moveID)!.shiftLayer([moveX, moveY])
        return
    }
    
    // Draws the board.
    draw(): void {
        let squareSize = 5 * this.zoomVal
        for (let i = 0; i < this.boardLayers.length; i++) {
            this.boardLayers[i].drawLayer(this.ctx, squareSize, this.originCoords)
        }
        this.drawPointGrid(squareSize)
        this.drawMousePointer()
        return
    }
    
    // Draws points at the vertices of the tiles for better navigation.
    drawPointGrid(squareSize: number): void {
        let currX = this.originCoords[0]
        while (currX + squareSize < 0) {
            currX += squareSize
        }
        while (currX < this.can.width + 100) {
            let currY = this.originCoords[1]
            while (currY + squareSize < 0) {
                currY += squareSize
            }
            while (currY < this.can.height + 100) {
                if (currX <= this.originCoords[0] && currX + squareSize >= this.originCoords[0]) {
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
                } else [
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
                ]
                this.ctx.fillRect(currX - 1, currY - 1, 2, 2)
                currY += squareSize
            }
            currX += squareSize
        }
        return
    }
    
    // Draws the underlying grid of the board. Currently defunct.
    drawUnderGrid(squareSize: number): void {
        let currX = this.originCoords[0]
        while (currX + squareSize < 0) {
            currX += squareSize
        }
        while (currX < this.can.width + 100) {
            let clr = "#333333"
            let currY = this.originCoords[1]
            while (currY + squareSize < 0) {
                currY += squareSize
            }
            while (currY < this.can.height + 100) {
                if (currX <= this.originCoords[0] && currX + squareSize >= this.originCoords[0]) {
                    this.ctx.fillStyle = "#0000cc"
                } else [
                    this.ctx.fillStyle = clr
                ]
                this.ctx.fillRect(currX, currY, squareSize, squareSize)
                currY += squareSize
            }
            currX += squareSize
        }
        return
    }
}