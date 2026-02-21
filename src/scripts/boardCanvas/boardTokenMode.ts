import * as localBoard from "./localBoard.ts"
import * as BoardObject from "./boardObject.ts"

// Class handling canvas' token mode.
// Currently WIP.
export class BoardTokenMode {
    board: localBoard.Board
    active: boolean
    modeButton: any
    sizeInput: any
    nameInput: any
    sizeLabel: any
    nameLabel: any
    params: Array<Array<number>>
    shift: boolean
    completeSelectCheck: boolean
    currHover: BoardObject.Token | null
    newTokenCheck: boolean
    
    constructor(parentBoard: localBoard.Board) {
        this.board = parentBoard
        this.active = false
        this.modeButton = document.getElementById("tokenMenuButton")!
        this.sizeInput = document.getElementById("tokenSize")!
        this.nameInput = document.getElementById("tokenName")!
        this.sizeLabel = document.getElementById("tokenSizeLabel")!
        this.nameLabel = document.getElementById("tokenNameLabel")!
        this.shift = false
        this.newTokenCheck = false
        this.params = []
        this.completeSelectCheck = false
        this.addEventListeners()
        this.currHover = null
    }
    
    flipListeners(setOn: boolean) {
        this.active = setOn
        this.modeButton.disabled = setOn
        if (setOn) {
            this.sizeInput.style.visibility = "visible"
            this.nameInput.style.visibility = "visible"
            this.sizeLabel.style.visibility = "visible"
            this.nameLabel.style.visibility = "visible"
        } else {
            this.sizeInput.style.visibility = "hidden"
            this.nameInput.style.visibility = "hidden"
            this.sizeLabel.style.visibility = "hidden"
            this.nameLabel.style.visibility = "hidden"
        }
    }
    
    addEventListeners(): void {
        this.board.can.addEventListener('mousemove', (event) => {
            if (this.active) {
                this.currHover = this.board.selectToken([this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)])
            }
        })
        
        this.board.can.addEventListener('mousedown', (event) => {
            if (this.active) {
                if (!this.shift) {
                    let res = this.board.selectToken([this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)])
                    this.currHover = res
                    if (this.currHover === null) {
                        this.createToken()
                        this.newTokenCheck = true
                    } else {
                        this.completeSelectCheck = true
                    }
                } else {
                    this.params.push(this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false))
                }
            }
        })
        
        this.board.can.addEventListener('mouseup', (event) => {
            if (this.active) {
                if (this.shift) {
                    this.params.push(this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false))
                    let newCoords: Array<Array<number>> = []
                    newCoords.push([Math.min(this.params[0][0], this.params[1][0]), Math.min(this.params[0][1], this.params[1][1])])
                    newCoords.push([Math.max(this.params[0][0], this.params[1][0]) + 1, Math.max(this.params[0][1], this.params[1][1]) + 1])
                    this.params = newCoords
                    this.completeSelectCheck = true
                }
            }
        })
        
        document.addEventListener("keydown", (event) => {
            if (this.active && event.key === "Shift") {
                this.shift = true
            }
        })
        
        // Should this event listener not check if token mode is active? Probably not, but it causes a bug with single token selection if it does.
        document.addEventListener("keyup", (event) => {
            if (event.key === "Shift") {
                this.shift = false
            }
        })

        this.sizeInput.addEventListener('input', (event) => {
            if (this.sizeInput.value.length > 3) {
                this.sizeInput.value = "1"
            } else {
                for (let i = 0; i < this.sizeInput.value.length; i++) {
                    if (this.sizeInput.value.charCodeAt(i) < 48 || this.sizeInput.value.charCodeAt(i) > 57) {
                        this.sizeInput.value = "1"
                        break
                    }
                }
                if (parseInt(this.sizeInput.value) < 1) {
                    this.sizeInput.value = "1"
                } else if (parseInt(this.sizeInput.value) > 300) {
                    alert("u have no legitimate need to make a token this big\npls be serious")
                    this.sizeInput.value = "1"
                }
            }
        })
    }
    
    getText(): string {
        return "Left Click : Create Token\nLeft Click on Token : Select Token\nShift + Left Click : Select Tokens"
    }
    
    createToken(): Array<any> {
        let coords = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)
        let newTokenObj = ["TOKEN", coords[0], coords[1], parseInt(this.sizeInput.value)]
        newTokenObj.push(document.getElementById("colourSquare")!.style.background)
        newTokenObj.push(this.nameInput.value)
        newTokenObj.push("")
        return newTokenObj
    }
    
    tryDrawLabel(ctx:any, squareSize:number, offset:Array<number>): void {
        if (this.currHover != null) {
            this.currHover.drawLabel(ctx, squareSize, offset)
        }
        return
    }
    
    getNewHover(): void {
        if (this.newTokenCheck) {
            this.currHover = this.board.selectToken([this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)])
        }
    }
    
    getTempObject(): any {
        if (this.params.length > 0) {
            let res = this.board.determineTile(this.board.mouseCoords[0], this.board.mouseCoords[1], false)
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
            return new BoardObject.Rect(-1, coords[0], coords[1], sizes[0], sizes[1], "rgb(255, 255, 255, 0.5)")
        }
        return 1
    }
    
    getNewObject(): any {
        this.getNewHover()
        this.newTokenCheck = false
        return this.createToken()
    }
}