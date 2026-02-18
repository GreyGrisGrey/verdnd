import * as localBoard from "./localBoard.ts"

// Class handling canvas' token mode.
// Currently WIP.
export class BoardTokenMode {
    board: localBoard.Board
    active: boolean
    modeButton: any
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.active = false
        this.modeButton = document.getElementById("tokenMenuButton")!
        this.addEventListeners()
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
        this.modeButton.disabled = setOn
    }
    
    addEventListeners(): void {
        this.board.can.addEventListener('mousemove', (event) => {
            if (this.active) {
                let change = [Math.round(this.board.mouseCoords[0] - event.clientX), Math.round(this.board.mouseCoords[1] - event.clientY)]
                if (this.board.leftMouseDown) {
                    this.board.moveCamera(change[0], change[1])
                }
                this.board.mouseCoords[0] = event.clientX;
                this.board.mouseCoords[1] = event.clientY;
            }
        })
    }
    
    getText(): string {
        return "toke"
    }
}