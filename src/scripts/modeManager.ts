import * as viewMode from "./boardViewMode.ts"
import * as drawMode from "./boardDrawMode.ts"
import * as tokenMode from "./boardTokenMode.ts"
import * as localBoard from "./localBoard.ts"

export class ModeManager {
    currMode: string
    viewObj: viewMode.BoardViewMode
    viewButton: any
    tokenObj: tokenMode.BoardTokenMode
    tokenButton: any
    drawObj: drawMode.BoardDrawMode
    drawButton: any
    
    constructor(parentBoard: localBoard.Board) {
        this.currMode = "VIEW"
        this.viewObj = new viewMode.BoardViewMode(parentBoard)
        this.viewButton = document.getElementById("viewMenuButton")!
        this.tokenObj = new tokenMode.BoardTokenMode(parentBoard)
        this.tokenButton = document.getElementById("tokenMenuButton")!
        this.drawObj = new drawMode.BoardDrawMode(parentBoard)
        this.drawButton = document.getElementById("drawMenuButton")!
        this.addEventListeners()
        this.modifyText(this.viewObj)
        this.viewObj.flipListeners(true)
    }
    
    addEventListeners(): void {
        this.viewButton.addEventListener('click', (event) => {
            this.currMode = "VIEW"
            this.viewObj.flipListeners(true)
            this.tokenObj.flipListeners(false)
            this.drawObj.flipListeners(false)
            this.modifyText(this.viewObj)
        })
        
        this.tokenButton.addEventListener('click', (event) => {
            this.currMode = "TOKEN"
            this.viewObj.flipListeners(false)
            this.tokenObj.flipListeners(true)
            this.drawObj.flipListeners(false)
            this.modifyText(this.tokenObj)
        })
        
        this.drawButton.addEventListener('click', (event) => {
            this.currMode = "DRAW"
            this.viewObj.flipListeners(false)
            this.tokenObj.flipListeners(false)
            this.drawObj.flipListeners(true)
            this.modifyText(this.drawObj)
        })
    }
    
    modifyText(selectMode: any): void {
        document.getElementById("modeParagraph")!.innerText = selectMode.getText()
    }
}