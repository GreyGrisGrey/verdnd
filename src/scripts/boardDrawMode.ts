import * as localBoard from "./localBoard.ts"
import * as BoardObject from "./boardObject.ts"

// Class handling the draw mode for the gameboard
// I do not like this, but it was the cleanest way I could think to do the job.
export class BoardDrawMode {
    board: localBoard.Board
    active: boolean
    modeButton: any
    shape: string
    params: Array<Array<number>>
    tempObj: any
    completeObjCheck: boolean
    activeColour: string
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.active = false
        this.modeButton = document.getElementById("drawMenuButton")!
        this.addEventListeners()
        this.shape = "RECT"
        this.params = new Array()
        this.tempObj = null
        this.completeObjCheck = false
        this.activeColour = "#cccccc"
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
        this.modeButton.disabled = setOn
        this.params = new Array()
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
        
        document.addEventListener("keydown", (event) => {
            if (this.active && this.params.length == 0) {
                if (event.key === "1") {
                    this.shape = "RECT"
                } else if (event.key === "2") {
                    this.shape = "RECTS"
                } else if (event.key === "3") {
                    this.shape = "CIRCLE"
                } else if (event.key === "4") {
                    this.shape = "POLY"
                }
            } else if (this.active && event.key === "5" && this.params.length > 2 && this.shape === "POLY") {
                this.setNewObject()
            } else if (this.active && event.key === "6") {
                this.params = new Array()
            }
        })
        
        this.board.can.addEventListener('mousedown', (event) => {
            if (this.active) {
                if (this.shape != "POLY") {
                    this.params.push(this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false))
                } else if (this.params.length > 0) {
                    let res = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], true)
                    this.params.push([res[0] - this.params[0][0], res[1] - this.params[0][1]])
                } else {
                    this.params.push(this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], true))
                }
            }
        })
        
        this.board.can.addEventListener('mouseup', (event) => {
            if (this.active && this.shape != "POLY") {
                if (this.shape === "RECT") {
                    let res = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)
                    if (res[0] >= this.params[0][0]) {
                        res[0] += 1
                    }
                    if (res[1] >= this.params[0][1]) {
                        res[1] += 1
                    }
                    this.params.push([res[0], res[1]])
                    this.setNewObject()
                } else if (this.shape === "CIRCLE") {
                    let res = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)
                    if (res[0] >= this.params[0][0]) {
                        res[0] += 1
                    }
                    if (res[1] >= this.params[0][1]) {
                        res[1] += 1
                    }
                    this.params.push([res[0], res[1]])
                    this.setNewObject()
                }
            }
        })
    }
    
    getText(): string {
        return "1 : Select Rectangle\n2 : Square style Rectangle\n3 : Select Circle\n4 : Select Polyline\n5 : Complete Polyline\n6 : Cancel"
    }
    
    setNewObject(): void {
        if (this.shape === "RECT" && this.params.length === 2) {
            let one = Math.min(this.params[0][0], this.params[1][0])
            let two = Math.min(this.params[0][1], this.params[1][1])
            let sizes = [Math.abs(this.params[1][0] - this.params[0][0]), Math.abs(this.params[1][1] - this.params[0][1])]
                if (this.params[1][0] < this.params[0][0]) {
                    sizes[0] += 1
                } if (this.params[1][1] < this.params[0][1]) {
                    sizes[1] += 1
                }
            this.tempObj = ["RECT", one, two, sizes[0], sizes[1]]
            this.completeObjCheck = true
        } else if (this.shape === "CIRCLE" && this.params.length === 2) {
            let one = Math.min(this.params[0][0], this.params[1][0])
            let two = Math.min(this.params[0][1], this.params[1][1])
            let radius = Math.max(Math.abs((this.params[0][0] - this.params[1][0])), Math.abs((this.params[0][1] - this.params[1][1])))
            this.tempObj = ["CIRCLE", one, two, radius]
            this.completeObjCheck = true
        } else if (this.shape === "POLY" && this.params.length > 2) {
            this.tempObj = ["POLY", this.params[0][0], this.params[0][1], this.params.slice(1)]
            this.completeObjCheck = true
        }
        this.params = new Array()
        return
    }
    
    getNewObject(): any {
        this.completeObjCheck = false
        return this.tempObj
    }
    
    getTempObject(): any {
        if (!this.active) {
            return 1
        }
        if (this.shape != "POLY" && this.params.length >= 1) {
            let res = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)
            if (this.shape === "RECT") {
                let coords = [0, 0]
                if (res[0] >= this.params[0][0]) {
                    res[0] += 1
                }
                if (res[1] >= this.params[0][1]) {
                    res[1] += 1
                }
                coords = [Math.min(this.params[0][0], res[0]), Math.min(this.params[0][1], res[1])]
                let sizes = [Math.abs(res[0] - this.params[0][0]), Math.abs(res[1] - this.params[0][1])]
                if (res[0] < this.params[0][0]) {
                    sizes[0] += 1
                } if (res[1] < this.params[0][1]) {
                    sizes[1] += 1
                }
                let newObj = new BoardObject.Rect(coords[0], coords[1], sizes[0], sizes[1])
                return newObj
            } else if (this.shape === "CIRCLE") {
                if (res[0] >= this.params[0][0]) {
                    res[0] += 1
                }
                if (res[1] >= this.params[0][1]) {
                    res[1] += 1
                }
                let coords = [Math.min(this.params[0][0], res[0]), Math.min(this.params[0][1], res[1])]
                let radius = Math.max(Math.abs((this.params[0][0] - res[0])), Math.abs((this.params[0][1] - res[1])))
                let newObj = new BoardObject.Circle(coords[0], coords[1], radius)
                return newObj
            }
        } else if (this.params.length >= 2 && this.shape === "POLY") {
            let newParams = this.params.slice(1)
            let newObj = new BoardObject.Polyline(this.params[0][0], this.params[0][1], newParams)
            return newObj
        }
        return 1
    }
}