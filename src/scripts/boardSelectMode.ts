import * as localBoard from "./localBoard.ts"
import * as BoardObject from "./boardObject.ts"

// Activates following a completed selection from draw mode or token mode.
export class BoardSelectMode {
    board: localBoard.Board
    active: boolean
    exitOnNextStep: boolean
    selectedObjects: Array<any>
    selectClick: boolean
    thirdOffset: Array<number>
    currColour: string
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.active = false
        this.selectedObjects = new Array()
        this.exitOnNextStep = false
        this.selectClick = false
        this.addEventListeners()
        this.thirdOffset = [0, 0]
        this.currColour = "none"
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
        this.selectedObjects = new Array()
        this.exitOnNextStep = false
        this.currColour = document.getElementById("colourSquare")!.style.background
        this.selectClick = this.board.leftMouseDown
        this.thirdOffset = [0, 0]
    }
    
    addEventListeners(): void {
        this.board.can.addEventListener('mousemove', (event) => {
            if (this.active && this.selectClick) {
                let change = [Math.round(this.board.mouseCoords[0] - event.clientX), Math.round(this.board.mouseCoords[1] - event.clientY)]
                this.thirdOffset[0] -= change[0]
                this.thirdOffset[1] -= change[1]
            }
        })
        
        this.board.can.addEventListener('mousedown', (event) => {
            if (this.active) {
                for (let i = 0; i < this.selectedObjects.length; i++) {
                    if (this.selectedObjects[i].isPointInside(this.board.determineTile(event.clientX, event.clientY, false))) {
                        this.selectClick = true
                        break
                    }
                }
            }
        });
        
        this.board.can.addEventListener('mouseup', (event) => {
            if (this.active && this.selectClick) {
                let valChange = this.board.determineTile(this.thirdOffset[0] + this.board.originCoords[0], this.thirdOffset[1] + this.board.originCoords[1], true)
                if (valChange[0] != 0 || valChange[1] != 0) {
                    for (let i = 0; i < this.selectedObjects.length; i++) {
                        this.board.serveInter.moveObj(this.selectedObjects[i].ID, valChange[0], valChange[1])
                    }
                }
                this.selectClick = false
                this.thirdOffset = [0, 0]
                if (this.selectedObjects.length === 1 && this.selectedObjects[0].objType === "Token") {
                    this.exitOnNextStep = true
                }
            }
        });
        
        document.addEventListener("keydown", (event) => {
            if (this.active && event.key === "Escape") {
                this.exitOnNextStep = true
            }
        })
    }
    
    getText(): string {
        return "nah"
    }
    
    setSelected(newObjs: Array<any>): void {
        this.selectedObjects = newObjs
        return
    }
    
    draw(ctx: any, squareSize: number, offset: Array<number>, offset2: Array<number>): void {
        let outlineOffset = [offset[0] + offset2[0] + this.thirdOffset[0], offset[1] + offset2[1] + this.thirdOffset[1]]
        for (let i = 0; i < this.selectedObjects.length; i++) {
            if (this.selectedObjects[i].objType != "Token") {
                this.selectedObjects[i].drawOutline(ctx, squareSize, outlineOffset)
                this.selectedObjects[i].draw(ctx, squareSize, outlineOffset)
                this.selectedObjects[i].selected = true
            } else {
                this.selectedObjects[i].drawOutline(ctx, squareSize, outlineOffset)
                this.selectedObjects[i].selected = true
            }
        }
        return
    }
    
    editColour(): void {
        if (document.getElementById("colourSquare")!.style.background != this.currColour) {
            this.currColour = document.getElementById("colourSquare")!.style.background
            for (let i = 0; i < this.selectedObjects.length; i++) {
                this.board.serveInter.changeObjColour(this.selectedObjects[i].ID, this.currColour)
            }
        }
    }
}