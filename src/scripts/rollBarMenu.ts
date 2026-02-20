export class RollMenu {
    textBox: HTMLElement
    chatBox: HTMLElement
    rollBox: HTMLElement
    active: boolean
    
    constructor() {
        this.textBox = document.createElement("div")
        this.chatBox = document.createElement("div")
        this.rollBox = document.createElement("div")
        this.active = false
    }
}