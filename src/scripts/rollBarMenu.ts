export class RollMenu {
    textBox: HTMLElement
    chatBox: HTMLElement
    rollBox: HTMLElement
    colBox: HTMLElement
    active: boolean
    
    
    constructor() {
        this.textBox = document.createElement("textarea")
        this.chatBox = document.getElementById("chatBox")!
        this.rollBox = document.getElementById("rollContainer")!
        this.colBox = document.getElementById("colContainer")!
        this.active = false
        this.setMainElements()
    }
    
    setMainElements(): void {
        this.chatBox.append(this.textBox)
        this.chatBox.style.background = "#cccccc"
        this.textBox.style.position = "absolute"
        this.textBox.style.bottom = "11px"
        this.textBox.style.height = "50px"
        this.textBox.style.left = "11px"
        this.textBox.style.visibility = "auto"
        this.textBox.style.resize = "none"
        return
    }
    
    toggleActive(newAct: boolean) {
        this.active = newAct
        this.rollBox.style.visibility = this.active ? "visible" : "hidden"
        this.rollBox.style.pointerEvents = this.active ? "auto" : "none"
        this.colBox.style.visibility = this.active ? "hidden" : "visible"
        this.colBox.style.pointerEvents = this.active ? "none" : "auto"
        this.chatBox.style.visibility = this.active ? "visible" : "hidden"
        this.chatBox.style.pointerEvents = this.active ? "auto" : "none"
    }
    
    step() {
        if (this.chatBox.style.height!= document.getElementById("rightBar")!.style.height) {
            this.chatBox.style.width = document.getElementById("rightBar")!.style.width
            this.chatBox.style.height = document.getElementById("rightBar")!.style.height
            this.textBox.style.width = (parseInt(this.chatBox.style.width.slice(0, this.chatBox.style.width.length - 2)) - 30) + "px"
        }
    }
}