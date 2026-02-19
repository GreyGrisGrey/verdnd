export class colourBox {
    savedVals: Array<Array<number>>
    currRGBVals: Array<number>
    currRGBString: string
    mainBox: HTMLElement
    adjBoxes: Array<HTMLElement>
    RGBSliders: Array<HTMLElement>
    RGBTexts: Array<HTMLElement>
    can: HTMLElement
    shiftIsPressed: boolean
    
    constructor() {
        this.savedVals = [[255, 0, 0, 1], [0, 255, 0, 1], [0, 0, 255, 1], [50, 50, 50, 1], [150, 150, 150, 1], [255, 255, 255, 1]]
        this.currRGBVals = [120, 120, 120, 1]
        this.currRGBString = 'rgba(' + 120 + ', ' + 120 + ', ' + 120 + ', ' + 1 + ')'
        this.mainBox = document.getElementById("colourSquare")!
        this.adjBoxes = new Array()
        this.can = document.getElementById("colourSquare")!
        this.RGBSliders = [document.getElementById("redColSlide")!, document.getElementById("greenColSlide")!, document.getElementById("blueColSlide")!, document.getElementById("opacColSlide")!]
        this.RGBTexts = [document.getElementById("redColText")!, document.getElementById("greenColText")!, document.getElementById("blueColText")!, document.getElementById("opacColText")!]
        this.shiftIsPressed = false
        for (let i = 1; i < 7; i++) {
            this.adjBoxes.push(document.getElementById("col" + i)!)
            this.adjBoxes[i - 1].style.left = ((i - 1) * 40 + 10) + "px"
            this.adjBoxes[i - 1].style.background = this.getRGBString(this.savedVals[i - 1])
        }
        this.addEventListeners()
        this.changeCurrColour()
    }
    
    addEventListeners(): void {
        for (let i = 0; i < 4; i++) {
            this.RGBSliders[i].addEventListener("input", (event) => {
                this.currRGBVals[i] = (i == 3) ? this.RGBSliders[i].value / 100 : this.RGBSliders[i].value
                this.changeCurrColour()
            })
        }
        
        document.addEventListener("keydown", (event) => {
            if (event.key === "Shift") {
                this.shiftIsPressed = true
            }
        })
        
        document.addEventListener("keyup", (event) => {
            if (event.key === "Shift") {
                this.shiftIsPressed = false
            }
        })
        
        document.addEventListener("input", (event) => {
            this.currRGBVals[2] = document.getElementById("blueColBox")!.value
            this.changeCurrColour()
        })
        
        for (let i = 0; i < 6; i++) {
            this.adjBoxes[i].addEventListener("click", (event) => {
                if (this.shiftIsPressed) {
                    this.changeSubColour(i)
                } else {
                    this.changeCurrColour(true, i)
                }
            })
        }
    }
    
    changeCurrColour(swap: boolean = false, swapID: number = -1) {
        if (swap) {
            this.currRGBVals = [...this.savedVals[swapID]]
        }
        this.currRGBString = this.getRGBString(this.currRGBVals)
        this.mainBox.style.background = this.currRGBString
        for (let i = 0; i < 4; i++) {
            this.matchInput(i)
        }
    }
    
    getRGBString(RGBVals: Array<number>): string {
        return "rgba(" + RGBVals[0] + ", " + RGBVals[1] + ", " + RGBVals[2] + ", " + RGBVals[3] + ")"
    }
    
    matchInput(ID: number) {
        this.RGBSliders[ID].value = (ID === 3) ? this.currRGBVals[ID] * 100 : this.currRGBVals[ID]
        this.RGBTexts[ID].value = (ID === 3) ? this.currRGBVals[ID] * 100 : this.currRGBVals[ID]
    }
    
    changeSubColour(swapID: number = -1) {
        this.savedVals[swapID] = [...this.currRGBVals]
        this.adjBoxes[swapID].style.background = this.getRGBString(this.savedVals[swapID])
    }
}

let colourPicker = new colourBox()