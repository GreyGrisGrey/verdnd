import * as Layer from "./layerBarMenu.ts"
import * as Token from "./tokenBarMenu.ts"
import * as Character from "./characterBarMenu.ts"
import * as Roll from "./rollBarMenu.ts"

export class rightBarMenu {
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
        this.addEventListeners()
    }
    
    addEventListeners(): void {
        document.getElementById("layerTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(true)
            this.currActive = "LAYER"
            this.setText()
        })
        
        document.getElementById("tokenTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(false)
            this.currActive = "TOKEN"
            this.setText()
        })
        
        document.getElementById("rollTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(false)
            this.currActive = "ROLL"
            this.setText()
        })
        
        document.getElementById("characterTab")!.addEventListener('click', (event) => {
            this.layerMan.toggleActive(false)
            this.currActive = "CHARACTER"
            this.setText()
        })
        return
    }
    
    async step() {
        document.getElementById("rightBar")!.style.width = "250px"
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 25))
            document.getElementById("rightBar")!.style.height = window.innerHeight - 20 + "px"
            if (this.currActive === "LAYER") {
                this.layerMan.step()
            }
        }
    }
    
    setText() {
        if (this.currActive === "LAYER") {
            document.getElementById("rightPara")!.innerText = this.layerMan.getText()
        } else {
            document.getElementById("rightPara")!.innerText = "WIP"
        }
    }
}

let currMenu = new rightBarMenu()
currMenu.step()