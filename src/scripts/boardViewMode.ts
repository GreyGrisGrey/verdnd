import * as localBoard from "./localBoard.ts"

// Class handling the view mode for the gameboard
// I do not like this, but it was the cleanest way I could think to do the job.
export class BoardViewMode {
    board: localBoard.Board
    active: boolean
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.active = true
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
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
        
        this.board.can.addEventListener('mousedown', (event) => {
            if (this.active) {
                this.board.leftMouseDown = true;
            }
        });
        
        this.board.can.addEventListener('mouseup', (event) => {
            if (this.active) {
                this.board.leftMouseDown = false;
            }
        });
        
        // Changes the zoom level when scrolled
        this.board.can.addEventListener('wheel', (event) => {
            if (this.active) {
                let old = this.board.zoomVal
                if (event.deltaY < 0 && this.board.zoomGlobal < this.board.zoomLevels.length - 1) {
                    this.board.zoomGlobal += 1
                    this.board.zoomVal = this.board.zoomLevels[this.board.zoomGlobal]
                    let originDist = [this.board.mouseCoords[0] - this.board.originCoords[0], this.board.mouseCoords[1] - this.board.originCoords[1]]
                    let goals = [originDist[0] * this.board.zoomVal / old, originDist[1] * this.board.zoomVal / old]
                    this.board.originCoords[0] -= goals[0] - originDist[0]
                    this.board.originCoords[1] -= goals[1] - originDist[1]
                } else if (event.deltaY > 0 && this.board.zoomGlobal > 0) {
                    this.board.zoomGlobal -= 1
                    this.board.zoomVal = this.board.zoomLevels[this.board.zoomGlobal]
                    let originDist = [this.board.mouseCoords[0] - this.board.originCoords[0], this.board.mouseCoords[1] - this.board.originCoords[1]]
                    let goals = [originDist[0] * this.board.zoomVal / old, originDist[1] * this.board.zoomVal / old]
                    this.board.originCoords[0] -= goals[0] - originDist[0]
                    this.board.originCoords[1] -= goals[1] - originDist[1]
                }
                this.board.originCoords[0] = Math.round(this.board.originCoords[0] * 10000) / 10000
                this.board.originCoords[1] = Math.round(this.board.originCoords[1] * 10000) / 10000
            }
        });
        return
    }
}