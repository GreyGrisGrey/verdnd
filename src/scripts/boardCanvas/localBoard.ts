import * as BoardLayer from "./boardLayer.ts"
import * as BoardObject from "./boardObject.ts"
import * as modeManager from "./modeManager.ts"

// Main class controlling the state of the canvas.
// Somewhat oversized, may be split up eventually.
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
    modeMan: modeManager.ModeManager
    activeLayer: number
    
    constructor() {
        this.zoomGlobal = 3
        this.zoomLevels = [4, 6, 8, 10, 13, 16, 20, 24, 28, 32]
        this.zoomVal = this.zoomLevels[this.zoomGlobal]
        this.can = document.getElementById("board")!
        this.ctx = this.can.getContext('2d')
        this.originCoords = [0, 0]
        this.mouseCoords = [0, 0]
        this.boardBounds = [-200, 200, -200, 200]
        this.leftMouseDown = false
        this.boardLayers = new Array()
        this.layerMap = new Map()
        this.modeMan = new modeManager.ModeManager(this)
        this.activeLayer = 0
    }
    
    // Test function for pointer drawing.
    // Will be removed when a proper laser tool is added.
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
    bindCamera(): void {
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
        return
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
    addObject(objID: number, layerID: number, newObject: any): void {
        this.layerMap.get(layerID)!.addObject(newObject, objID)
        return
    }
    
    // Changes the offset of specified layer.
    moveLayer(moveID: number, moveX: number, moveY: number): void {
        this.layerMap.get(moveID)!.shiftLayer([moveX, moveY])
        return
    }
    
    // Checks if the mode manager is in a state to complete a selection, retrieves all objects in the selection if so.
    selectObjects(targetType: string = "Any"): Array<any> {
        let res = this.layerMap.get(this.activeLayer)!.selectObjects(this.modeMan.getSelectCoords(), targetType)
        return res
    }
    
    selectToken(fixedPoint: Array<Array<number>>): BoardObject.Token | null {
        let res = this.layerMap.get(this.activeLayer)!.selectObjects(fixedPoint, "Token")
        if (res.length != 0) {
            return res[0]
        }
        return null
    }
    
    // Draws points at the vertices of the tiles for.
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
                    this.ctx.fillStyle = "rgba(255, 255, 255, 1)"
                } else [
                    this.ctx.fillStyle = "rgba(255, 255, 255, 1)"
                ]
                this.ctx.fillRect(currX - 1, currY - 1, 2, 2)
                currY += squareSize
            }
            currX += squareSize
        }
        return
    }
    
    // Draws lines between vertices of the grid.
    // Currently defunct.
    drawLineGrid(squareSize: number): void {
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
                    this.ctx.fillStyle = "rgba(100, 100, 100, 0.25)"
                } else [
                    this.ctx.fillStyle = "rgba(100, 100, 100, 0.25)"
                ]
                this.ctx.fillRect(currX - 1, currY - 1, squareSize, 2)
                this.ctx.fillRect(currX- 1, currY - 1, 2, squareSize)
                currY += squareSize
            }
            currX += squareSize
        }
        return
    }
    
    // Draws the underlying grid of the board. 
    // Currently defunct.
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
    
    // Determines which tile/vertex a coordinate pair is located on.
    determineTile(x: number, y: number, vertex: boolean): Array<number> {
        let squareSize = 5 * this.zoomVal
        if (vertex) {
            return [Math.round((x - this.originCoords[0]) / squareSize), Math.round((y - this.originCoords[1]) / squareSize)]
        } else {
            return [Math.floor((x - this.originCoords[0]) / squareSize), Math.floor((y - this.originCoords[1]) / squareSize)]
        }
    }
    
    // Draws the board.
    draw(): void {
        let squareSize = 5 * this.zoomVal
        for (let i = 0; i < this.boardLayers.length; i++) {
            this.boardLayers[i].drawLayer(this.ctx, squareSize, this.originCoords, this.modeMan.selectMan.thirdOffset)
            if (i === this.activeLayer) {
                let tempObj = this.modeMan.getObject("DRAW")
                if (tempObj != 1) {
                    tempObj.draw(this.ctx, squareSize, this.originCoords)
                }
            }
        }
        this.drawPointGrid(squareSize)
        this.drawMousePointer()
        this.modeMan.step(this.ctx, squareSize, this.originCoords)
        return
    }
    
    getModeManObject() {
        return this.modeMan.getObject("CREATE")
    }
    
    // Performs a single drawing step.
    async step() {
        if (this.can.width != window.innerWidth) {
            this.can.width = window.innerWidth
            this.can.height = window.innerHeight
        }
        this.ctx.clearRect(0, 0, this.can.width, this.can.height)
        this.draw()
    }
    
    // Checks if a deletion request has been made, deletes marked objects if so.
    getDeletion(): Array<any> | null {
        if (this.modeMan.deleteTrigger) {
            let deletion = this.modeMan.getSelected()
            this.modeMan.clearSelected()
            return deletion
        }
        return null
    }
}