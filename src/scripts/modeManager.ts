import * as viewMode from "./boardViewMode.ts"
import * as drawMode from "./boardDrawMode.ts"
import * as tokenMode from "./boardTokenMode.ts"
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
    drawButton: any
    currSelected: Array<any>
    deleteTrigger: boolean
    selectClick: boolean
    thirdOffset: Array<number>
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.currMode = "VIEW"
        this.viewObj = new viewMode.BoardViewMode(parentBoard)
        this.viewButton = document.getElementById("viewMenuButton")!
        this.tokenObj = new tokenMode.BoardTokenMode(parentBoard)
        this.tokenButton = document.getElementById("tokenMenuButton")!
        this.drawObj = new drawMode.BoardDrawMode(parentBoard)
        this.drawButton = document.getElementById("drawMenuButton")!
        this.currSelected = new Array()
        this.deleteTrigger = false
        this.selectClick = false
        this.thirdOffset = [0, 0]
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
            this.modifyText(this.viewObj)
            this.currSelected = new Array()
        })
        
        this.tokenButton.addEventListener('click', (event) => {
            this.currMode = "TOKEN"
            this.viewObj.flipListeners(false)
            this.tokenObj.flipListeners(true)
            this.drawObj.flipListeners(false)
            this.modifyText(this.tokenObj)
            this.currSelected = new Array()
        })
        
        this.drawButton.addEventListener('click', (event) => {
            this.currMode = "DRAW"
            this.viewObj.flipListeners(false)
            this.tokenObj.flipListeners(false)
            this.drawObj.flipListeners(true)
            this.modifyText(this.drawObj)
            this.currSelected = new Array()
        })
        
        document.addEventListener("keydown", (event) => {
            if (event.key === "Backspace") {
                this.deleteTrigger = true
            } else {
                this.currSelected = new Array()
            }
        })
        
        this.board.can.addEventListener('mousemove', (event) => {
            let change = [Math.round(this.board.mouseCoords[0] - event.clientX), Math.round(this.board.mouseCoords[1] - event.clientY)]
            if (this.selectClick) {
                this.thirdOffset[0] -= change[0]
                this.thirdOffset[1] -= change[1]
            }
            this.board.mouseCoords[0] = event.clientX;
            this.board.mouseCoords[1] = event.clientY;
        })
        
        this.board.can.addEventListener('mousedown', (event) => {
            this.board.leftMouseDown = true;
            for (let i = 0; i < this.currSelected.length; i++) {
                if (this.currSelected[i].isPointInside(this.board.determineTile(event.clientX, event.clientY, false))) {
                    this.selectClick = true
                    this.drawObj.active = false
                    this.tokenObj.active = false
                }
            }
        }, {capture: true});
        
        this.board.can.addEventListener('mouseup', (event) => {
            let valChange = this.board.determineTile(this.thirdOffset[0] + this.board.originCoords[0], this.thirdOffset[1] + this.board.originCoords[1], true)
            if (valChange[0] != 0 || valChange[1] != 0) {
                for (let i = 0; i < this.currSelected.length; i++) {
                    this.board.serveInter.moveObj(this.currSelected[i].ID, valChange[0], valChange[1])
                }
            }
            this.clearSelected()
            this.board.leftMouseDown = false
            if (this.currMode === "DRAW") {
                this.drawObj.active = true
            } else if (this.currMode === "TOKEN") {
                this.tokenObj.active = true
            }
        });
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
        return this.currSelected
    }
    
    // Stores a set of board objects that have been selected.
    setSelected(newSelection: Array<any>): void {
        this.currSelected = newSelection
        this.drawObj.selectState = 0
        this.drawObj.params = new Array()
        return
    }
    
    // Draws all currently selected board objects.
    // Also ensures those objects are not drawn twice.
    drawSelected(ctx: any, squareSize: number, offset: Array<number>, offset2: Array<number>): void {
        let outlineOffset = [offset[0] + offset2[0] + this.thirdOffset[0], offset[1] + offset2[1] + this.thirdOffset[1]]
        for (let i = 0; i < this.currSelected.length; i++) {
            this.currSelected[i].drawOutline(ctx, squareSize, outlineOffset)
            this.currSelected[i].draw(ctx, squareSize, outlineOffset)
            this.currSelected[i].selected = true
        }
        return
    }
    
    // Clears the list of selected objects.
    clearSelected(): void {
        this.deleteTrigger = false
        this.currSelected = new Array()
        this.thirdOffset = [0, 0]
        return
    }
}