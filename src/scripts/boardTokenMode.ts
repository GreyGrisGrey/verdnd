import * as localBoard from "./localBoard.ts"

// Class handling the token mode for the gameboard
// I do not like this, but it was the cleanest way I could think to do the job.
export class BoardTokenMode {
    board: localBoard.Board
    active: boolean
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.active = false
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
    }
    
    addEventListeners(): void {
        return
    }
}