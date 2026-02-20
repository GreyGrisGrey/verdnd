import * as viewMode from "./boardViewMode.ts"
import * as drawMode from "./boardDrawMode.ts"
import * as tokenMode from "./boardTokenMode.ts"
import * as selectMode from "./boardSelectMode.ts"
import * as localBoard from "./localBoard.ts"

// Class handling the draw/token/view modes.
// Also handles behaviour when a selection of board objects has been made. This may be split off.
export class ModeManager {
    board: localBoard.Board
    currMode: string
    viewObj: viewMode.BoardViewMode
    viewButton: any
    tokenObj: tokenMode.BoardTokenMode
    tokenButton: any
    drawObj: drawMode.BoardDrawMode
    selectObj: selectMode.BoardSelectMode
    drawButton: any
    deleteTrigger: boolean
    selectClick: boolean
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.currMode = "VIEW"
        this.viewObj = new viewMode.BoardViewMode(parentBoard)
        this.viewButton = document.getElementById("viewMenuButton")!
        this.tokenObj = new tokenMode.BoardTokenMode(parentBoard)
        this.tokenButton = document.getElementById("tokenMenuButton")!
        this.drawObj = new drawMode.BoardDrawMode(parentBoard)
        this.drawButton = document.getElementById("drawMenuButton")!
        this.selectObj = new selectMode.BoardSelectMode(parentBoard)
        this.deleteTrigger = false
        this.selectClick = false
        this.addEventListeners()
        this.modifyText(this.viewObj)
        this.viewObj.flipListeners(true)
    }
    
    // Adds event listeners for all modes, as well as some of its own.
    addEventListeners(): void {
        this.viewButton.addEventListener('click', (event) => {
            this.currMode = "VIEW"
            this.viewObj.flipListeners(true)
            this.tokenObj.flipListeners(false)
            this.drawObj.flipListeners(false)
            this.selectObj.flipListeners(false)
            this.modifyText(this.viewObj)
        })
        
        this.tokenButton.addEventListener('click', (event) => {
            this.currMode = "TOKEN"
            this.viewObj.flipListeners(false)
            this.tokenObj.flipListeners(true)
            this.drawObj.flipListeners(false)
            this.selectObj.flipListeners(false)
            this.modifyText(this.tokenObj)
        })
        
        this.drawButton.addEventListener('click', (event) => {
            this.currMode = "DRAW"
            this.viewObj.flipListeners(false)
            this.tokenObj.flipListeners(false)
            this.drawObj.flipListeners(true)
            this.selectObj.flipListeners(false)
            this.modifyText(this.drawObj)
        })
        
        document.addEventListener("keydown", (event) => {
            if (event.key === "Backspace") {
                this.deleteTrigger = true
            }
        })
        
        this.board.can.addEventListener('mousemove', (event) => {
            this.board.mouseCoords[0] = event.clientX;
            this.board.mouseCoords[1] = event.clientY;
        })
        
        this.board.can.addEventListener('mousedown', (event) => {
            this.board.leftMouseDown = true;
        }, {capture: true});
        
        this.board.can.addEventListener('mouseup', (event) => {
            this.board.leftMouseDown = false
        }, {capture: true});
        return
    }
    
    // Switches the information bar's text to match the current mode.
    modifyText(selectMode: any): void {
        document.getElementById("modeParagraph")!.innerText = selectMode.getText()
        return
    }
    
    // Checks if the user has selected an area of the canvas.
    hasCompleteSelection(): boolean {
        if (this.currMode === "DRAW" && this.drawObj.selectState > 0) {
            return true
        }
        return false
    }
    
    // Retrieves the coordinates corresponding to the currently selected area of the canvas.
    getSelectCoords(): Array<Array<number>> {
        if (this.currMode === "DRAW" && this.drawObj.selectState != 0) {
            return this.drawObj.params
        }
        return [[0]]
    }
    
    // Retrieves the object currently being drawn by the draw mode.
    getObject(reason: string): any {
        if (reason === "DRAW") {
            return this.drawObj.getTempObject()
        } else if (reason === "CREATE" && this.currMode === "DRAW") {
            if (this.drawObj.completeObjCheck) {
                return this.drawObj.getNewObject()
            }
        }
        return 1
    }
    
    // Returns all board objects that are currently selected.
    getSelected(): Array<any> {
        return this.selectObj.selectedObjects
    }
    
    // Draws all currently selected board objects.
    // Also ensures those objects are not drawn twice.
    drawSelected(ctx: any, squareSize: number, offset: Array<number>, offset2: Array<number>): void {
        this.selectObj.draw(ctx, squareSize, offset, offset2)
        return
    }
    
    // Clears the list of selected objects.
    clearSelected(): void {
        this.deleteTrigger = false
        this.exitSelected()
        return
    }
    
    enterSelected(): void {
        let res = this.board.selectObjects()
        if (res.length != 0) {
            this.selectObj.flipListeners(true)
            this.selectObj.setSelected(res)
            if (this.currMode === "DRAW") {
                this.drawObj.active = false
                this.drawObj.selectState = 0
                this.drawObj.params = new Array()
            }
        } else {
            this.drawObj.selectState = 0
            this.drawObj.params = new Array()
        }
        return
    }
    
    exitSelected(): void {
        this.selectObj.flipListeners(false)
        if (this.currMode === "DRAW") {
            this.drawObj.active = true
        }
        return
    }
    
    attemptSelectedSwap(): void {
        if (!this.selectObj.active && this.hasCompleteSelection()) {
            this.enterSelected()
        } else if (this.selectObj.active && this.selectObj.exitOnNextStep) {
            this.exitSelected()
        }
        return
    }
}