import * as viewMode from "./boardViewMode.ts"
import * as drawMode from "./boardDrawMode.ts"
import * as tokenMode from "./boardTokenMode.ts"
import * as selectMode from "./boardSelectMode.ts"
import * as localBoard from "./localBoard.ts"
import * as BoardObject from "./boardObject.ts"

// Class handling the draw/token/view modes.
// Also handles behaviour when a selection of board objects has been made. This may be split off.
export class ModeManager {
    board: localBoard.Board
    currMode: string
    viewMan: viewMode.BoardViewMode
    viewButton: any
    tokenMan: tokenMode.BoardTokenMode
    tokenButton: any
    drawMan: drawMode.BoardDrawMode
    selectMan: selectMode.BoardSelectMode
    drawButton: any
    deleteTrigger: boolean
    selectClick: boolean
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.currMode = "VIEW"
        this.viewMan = new viewMode.BoardViewMode(parentBoard)
        this.viewButton = document.getElementById("viewMenuButton")!
        this.tokenMan = new tokenMode.BoardTokenMode(parentBoard)
        this.tokenButton = document.getElementById("tokenMenuButton")!
        this.drawMan = new drawMode.BoardDrawMode(parentBoard)
        this.drawButton = document.getElementById("drawMenuButton")!
        this.selectMan = new selectMode.BoardSelectMode(parentBoard)
        this.deleteTrigger = false
        this.selectClick = false
        this.addEventListeners()
        this.modifyText(this.viewMan)
        this.viewMan.flipListeners(true)
    }
    
    // Adds event listeners for all modes, as well as some of its own.
    addEventListeners(): void {
        this.viewButton.addEventListener('click', (event) => {
            this.currMode = "VIEW"
            this.viewMan.flipListeners(true)
            this.tokenMan.flipListeners(false)
            this.drawMan.flipListeners(false)
            this.selectMan.flipListeners(false)
            this.modifyText(this.viewMan)
        })
        
        this.tokenButton.addEventListener('click', (event) => {
            this.currMode = "TOKEN"
            this.viewMan.flipListeners(false)
            this.tokenMan.flipListeners(true)
            this.drawMan.flipListeners(false)
            this.selectMan.flipListeners(false)
            this.modifyText(this.tokenMan)
        })
        
        this.drawButton.addEventListener('click', (event) => {
            this.currMode = "DRAW"
            this.viewMan.flipListeners(false)
            this.tokenMan.flipListeners(false)
            this.drawMan.flipListeners(true)
            this.selectMan.flipListeners(false)
            this.modifyText(this.drawMan)
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
        if (this.currMode === "DRAW" && this.drawMan.selectState > 0) {
            return true
        } else if (this.currMode === "TOKEN" && this.tokenMan.completeSelectCheck) {
            return true
        }
        return false
    }
    
    // Retrieves the coordinates corresponding to the currently selected area of the canvas.
    getSelectCoords(): Array<Array<number>> {
        if (this.currMode === "DRAW" && this.drawMan.selectState != 0) {
            return this.drawMan.params
        } else if (this.currMode === "TOKEN" && this.tokenMan.completeSelectCheck) {
            return this.tokenMan.params
        }
        return [[0]]
    }
    
    // Retrieves the object currently being drawn by the draw mode.
    getObject(reason: string): any {
        if (reason === "DRAW") {
            if (this.currMode === "DRAW") {
                return this.drawMan.getTempObject()
            } else if (this.currMode === "TOKEN") {
                return this.tokenMan.getTempObject()
            }
        } else if (reason === "CREATE" && this.currMode === "DRAW") {
            if (this.drawMan.completeObjCheck) {
                return this.drawMan.getNewObject()
            }
        }
        return 1
    }
    
    // Returns all board objects that are currently selected.
    getSelected(): Array<any> {
        return this.selectMan.selectedObjects
    }
    
    // Draws all currently selected board objects.
    // Also ensures those objects are not drawn twice.
    drawSelected(ctx: any, squareSize: number, offset: Array<number>, offset2: Array<number>): void {
        this.selectMan.draw(ctx, squareSize, offset, offset2)
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
        if (this.currMode === "TOKEN" && this.tokenMan.params.length === 0) {
            res = [this.tokenMan.currHover]
            this.tokenMan.currHover = null
        } else if (this.currMode === "TOKEN") {
            res = this.board.selectObjects("Token")
        }
        if (res.length != 0) {
            this.selectMan.flipListeners(true)
            this.selectMan.setSelected(res)
            if (this.currMode === "DRAW") {
                this.drawMan.active = false
                this.drawMan.selectState = 0
                this.drawMan.params = new Array()
            } else if (this.currMode === "TOKEN") {
                this.tokenMan.active = false
                this.tokenMan.completeSelectCheck = false
                this.tokenMan.params = new Array()
            }
        } else {
            if (this.currMode === "DRAW") {
                this.drawMan.selectState = 0
                this.drawMan.params = new Array()
            } else if (this.currMode === "TOKEN") {
                this.tokenMan.completeSelectCheck = false
                this.tokenMan.params = new Array()
            }
        }
        return
    }
    
    exitSelected(): void {
        this.selectMan.flipListeners(false)
        if (this.currMode === "DRAW") {
            this.drawMan.active = true
        } else if (this.currMode === "TOKEN") {
            this.tokenMan.active = true
        }
        return
    }
    
    attemptSelectedSwap(): void {
        if (!this.selectMan.active && this.hasCompleteSelection()) {
            this.enterSelected()
        } else if (this.selectMan.active && this.selectMan.exitOnNextStep) {
            this.exitSelected()
        }
        return
    }
    
    step(ctx:any, squareSize:number, offset:Array<number>): void {
        this.attemptSelectedSwap()
        if (this.tokenMan.active) {
            this.tokenMan.tryDrawLabel(ctx, squareSize, offset)
            this.tokenMan.getNewHover()
        }
        if (this.drawMan.active) {
            this.drawMan.changeColour()
        }
        if (this.selectMan.active) {
            this.selectMan.editColour()
        }
        return
    }
}