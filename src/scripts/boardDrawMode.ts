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
    selectMode: boolean
    selectState: number
    
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
        this.activeColour = "rgb(255, 255, 255, 0.5)"
        this.selectMode = false
        this.selectState = 0
    }
    
    changeColour() {
        this.activeColour = document.getElementById("colourSquare")!.style.background
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
        this.modeButton.disabled = setOn
        this.params = new Array()
        this.selectMode = false
        this.selectState = 0
        this.completeObjCheck = false
        this.tempObj = null
    }
    
    addEventListeners(): void {
        this.board.can.addEventListener('mousemove', (event) => {
            if (this.active) {
                this.board.mouseCoords[0] = event.clientX;
                this.board.mouseCoords[1] = event.clientY;
            }
        })
        
        document.addEventListener("keydown", (event) => {
            if (this.active) {
                this.selectMode = false
            }
            if (this.active && this.params.length == 0) {
                if (event.key === "1") {
                    this.shape = "RECT"
                } else if (event.key === "2") {
                    this.shape = "RECTS"
                } else if (event.key === "3") {
                    this.shape = "CIRCLE"
                } else if (event.key === "4") {
                    this.shape = "POLY"
                } else if (event.key === "5") {
                    this.shape = "LINE"
                } else if (event.key === "7") {
                    this.shape = "RECT"
                    this.selectMode = true
                }
                this.params = new Array()
            } else if (this.active && event.key === "6" && this.params.length > 2 && (this.shape === "POLY" || this.shape === "LINE")) {
                this.setNewObject()
            }
        })
        
        this.board.can.addEventListener('mousedown', (event) => {
            if (this.active) {
                if (this.shape != "POLY" && this.shape != "LINE") {
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
            if (this.params.length == 0) {
                return
            } else if (this.active && this.selectMode) {
                let newPos = this.board.determineTile(this.board.mouseCoords[0] + 1, this.board.mouseCoords[1] + 1, false)
                if (newPos[0] === this.params[0][0] && newPos[1] === this.params[0][1]) {
                    this.selectState = 1
                } else {
                    let newCoords = [0, 0, 0, 0]
                    newCoords[0] = Math.min(newPos[0], this.params[0][0])
                    newCoords[1] = Math.min(newPos[1], this.params[0][1])
                    newCoords[2] = Math.max(newPos[0], this.params[0][0]) + 1
                    newCoords[3] = Math.max(newPos[1], this.params[0][1]) + 1
                    this.selectState = 2
                    this.params = new Array()
                    this.params.push([newCoords[0], newCoords[1]])
                    this.params.push([newCoords[2], newCoords[3]])
                }
            } else if (this.active && this.shape != "POLY" && this.shape != "LINE") {
                if (this.shape === "RECT" || this.shape === "RECTS") {
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
        return "1 : Create Rectangle\n2 : Create Square Style Rectangle" +
        "\n3 : Create Circle\n4 : Create Polyline\n5 : Create Wall\n6 : Complete Wall/Polyline\n7 : Select" + 
        "\n8 : Cancel"
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
        } else if (this.shape === "RECTS" && this.params.length === 2) {
            let one = Math.min(this.params[0][0], this.params[1][0])
            let two = Math.min(this.params[0][1], this.params[1][1])
            let sizes = [Math.abs(this.params[1][0] - this.params[0][0]), Math.abs(this.params[1][1] - this.params[0][1])]
            let objects = []
            if (this.params[1][0] < this.params[0][0]) {
                sizes[0] += 1
            } if (this.params[1][1] < this.params[0][1]) {
                sizes[1] += 1
            }
            for (let i = 0; i < sizes[0]; i++) {
                for (let j = 0; j < sizes[1]; j++) {
                    objects.push(["RECT", one + i, two + j, 1, 1, this.activeColour])
                }
            }
            this.tempObj = objects
            this.completeObjCheck = true
        } else if (this.shape === "LINE" && this.params.length > 2) {
            this.tempObj = ["LINE", this.params[0][0], this.params[0][1], this.params.slice(1)]
            this.completeObjCheck = true
        }
        this.params = new Array()
        if (this.shape != "RECTS") {
            this.tempObj.push(this.activeColour)
        }
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
        if (this.shape != "POLY" && this.shape != "LINE" && this.params.length >= 1) {
            let res = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)
            if (this.shape === "RECT" || this.shape === "RECTS") {
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
                if (this.selectMode) {
                    return new BoardObject.Rect(-1, coords[0], coords[1], sizes[0], sizes[1], "rgb(255, 255, 255, 0.5)")
                }
                return new BoardObject.Rect(-1, coords[0], coords[1], sizes[0], sizes[1], this.activeColour)
            } else if (this.shape === "CIRCLE") {
                if (res[0] >= this.params[0][0]) {
                    res[0] += 1
                }
                if (res[1] >= this.params[0][1]) {
                    res[1] += 1
                }
                let coords = [Math.min(this.params[0][0], res[0]), Math.min(this.params[0][1], res[1])]
                let radius = Math.max(Math.abs((this.params[0][0] - res[0])), Math.abs((this.params[0][1] - res[1])))
                let newObj = new BoardObject.Circle(-1, coords[0], coords[1], radius, this.activeColour)
                return newObj
            }
        } else if (this.params.length >= 2 && this.shape === "POLY") {
            let newParams = this.params.slice(1)
            let newObj = new BoardObject.Polyline(-1, this.params[0][0], this.params[0][1], newParams, this.activeColour)
            return newObj
        } else if (this.params.length >= 2 && this.shape === "LINE") {
            let newParams = this.params.slice(1)
            let newObj = new BoardObject.Line(-1, this.params[0][0], this.params[0][1], newParams, this.activeColour)
            return newObj
        }
        return 1
    }
}