import * as Layer from "./layerBarMenu.ts"
import * as Token from "./tokenBarMenu.ts"
import * as Character from "./characterBarMenu.ts"
import * as Roll from "./rollBarMenu.ts"

export class RightBarManager {
    layerMan: Layer.LayerMenu
    tokenMan: Token.TokenMenu
    characterMan: Character.CharacterMenu
    rollMan: Roll.RollMenu
    currActive: string
    
    
    constructor() {
        this.layerMan = new Layer.LayerMenu()
        this.tokenMan = new Token.TokenMenu()
        this.characterMan = new Character.CharacterMenu()
        this.rollMan = new Roll.RollMenu()
        this.currActive = "NONE"
        document.getElementById("rightBar")!.style.width = "250px"
        this.addEventListeners()
    }
    
    addEventListeners(): void {
        document.getElementById("layerTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(true)
            this.rollMan.toggleActive(false)
            this.currActive = "LAYER"
            this.setText()
        })
        
        document.getElementById("tokenTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(false)
            this.rollMan.toggleActive(false)
            this.currActive = "TOKEN"
            this.setText()
        })
        
        document.getElementById("rollTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(false)
            this.rollMan.toggleActive(true)
            this.currActive = "ROLL"
            this.setText()
        })
        
        document.getElementById("characterTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(false)
            this.rollMan.toggleActive(false)
            this.currActive = "CHARACTER"
            this.setText()
        })
        return
    }
    
    async step() {
        await new Promise(resolve => setTimeout(resolve, 25))
        document.getElementById("rightBar")!.style.height = window.innerHeight - 20 + "px"
        if (this.currActive === "LAYER") {
            this.layerMan.step()
        } else if (this.currActive === "ROLL") {
            this.rollMan.step()
        }
    }
    
    setText() {
        if (this.currActive === "LAYER") {
            document.getElementById("rightPara")!.innerText = ""
        } else if (this.currActive === "ROLL") {
            document.getElementById("rightPara")!.innerText = ""
        } else {
            document.getElementById("rightPara")!.innerText = "WIP"
        }
    }
}