export class LayerMenu {
    active: boolean
    button: any
    layers: Array<Array<any>>
    descObj: HTMLElement
    currElements: Array<HTMLElement>
    layerMap: Map<number, Array<any>>
    layerObj: HTMLElement
    boxHeight: number
    currNum: number
    currSelect: number
    
    constructor() {
        this.active = false
        this.button = document.getElementById("layerTab")
        this.layers = new Array()
        this.currElements = new Array()
        this.layerObj = document.createElement("div")
        this.descObj = document.createElement("div")
        this.layerMap = new Map()
        document.getElementById("rightBar")!.append(this.layerObj)
        this.boxHeight = 50
        this.currNum = 0
        this.currSelect = 0
        this.addEventListeners()
        this.setMainElements()
        this.createLayer()
        this.createLayer()
        this.createLayer()
        this.moveLayers()
    }
    
    addEventListeners() {
        return
    }
    
    toggleActive(newAct: boolean) {
        this.active = newAct
        this.layerObj.style.visibility = this.active ? "visible" : "hidden"
        this.layerObj.style.pointerEvents = this.active ? "auto" : "none"
    }
    
    setMainElements(): void {
        this.layerObj.style.background = "#cccccc"
        this.layerObj.style.visibility = "hidden"
        this.layerObj.style.fontSize = "14px"
                
        this.descObj.style.border = "solid black"
        this.descObj.style.height = this.boxHeight + "px"
        this.descObj.style.width = "250px"
        this.layerObj.style.fontSize = "14px"
        
        let numText = document.createElement("p")
        numText.innerText = "Layer #"
        numText.style.position = "absolute"
        numText.style.left = "10px"
        
        let firstCheck = document.createElement("p")
        firstCheck.innerText = "GM\nVis"
        firstCheck.style.width = "50px"
        firstCheck.style.position = "absolute"
        firstCheck.style.left = "137px"
        firstCheck.style.textAlign = "center"
        
        let secondCheck = document.createElement("p")
        secondCheck.innerText = "Player\nVis"
        secondCheck.style.width = "50px"
        secondCheck.style.position = "absolute"
        secondCheck.style.left = "187px"
        secondCheck.style.textAlign = "center"
        
        this.layerObj.append(this.descObj)
        this.descObj.append(numText)
        this.descObj.append(firstCheck)
        this.descObj.append(secondCheck)
        return
    }
    
    createLayer(): void {
        let newBox = document.createElement("div")
        let newText = document.createElement("p")
        let checkVisibleAll = document.createElement("input")
        let checkVisibleGM = document.createElement("input")
        this.layerMap.set(this.currNum, [true, true, 0, newBox])
        
        newBox.style.position = "absolute"
        newBox.style.border = "solid black"
        newBox.style.height = this.boxHeight + "px"
        newBox.style.width = "100px"
        newBox.style.left = "0px"
        newBox.style.top = "50px"
        
        newText.style.position = "absolute"
        newText.style.width = "100px"
        newText.style.left = "10px"
        newText.style.top = "5px"
        newText.innerText = "Layer " + this.currNum
        
        checkVisibleAll.type = "checkbox"
        checkVisibleAll.style.position = "absolute"
        checkVisibleAll.style.top = "15px"
        checkVisibleAll.style.left = "150px"
        checkVisibleAll.checked = true
        
        checkVisibleGM.type = "checkbox"
        checkVisibleGM.style.position = "absolute"
        checkVisibleGM.style.top = "15px"
        checkVisibleGM.style.left = "200px"
        checkVisibleGM.checked = true
        
        this.layerObj.append(newBox)
        newBox.append(newText)
        newBox.append(checkVisibleAll)
        newBox.append(checkVisibleGM)
        this.currElements.push(newBox)
        this.currNum++
        
        newBox.addEventListener('mousedown', (event) => {
            if (this.active) {
                if (this.currSelect != parseInt(newText.innerText.slice(6))) {
                    this.exitCurrSelect()
                    this.currSelect = parseInt(newText.innerText.slice(6))
                }
            }
        });
        return
    }
    
    moveLayers() {
        for (let i = 0; i < this.currElements.length; i++) {
            this.currElements[i].style.top = (this.boxHeight + 4) * (i + 1) + "px"
        }
        return
    }
    
    resizeLayerBoxes() {
        for (let i = 0; i < this.currElements.length; i++) {
            this.currElements[i].style.width = (parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2)) - 4) + "px"
        }
    }
    
    exitCurrSelect(): void {
        if (this.layerMap.has(this.currSelect)) {
            this.layerMap.get(this.currSelect)![3].style.background = "#cccccc"
        }
        return
    }
    
    step(): void {
        if (this.layerMap.has(this.currSelect)) {
            this.layerMap.get(this.currSelect)![3].style.background = "#cc0000"
        }
        if (this.layerObj.style.width != document.getElementById("rightBar")!.style.width) {
            this.layerObj.style.width = document.getElementById("rightBar")!.style.width
            this.layerObj.style.height = document.getElementById("rightBar")!.style.height
            this.descObj.style.width = (parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2)) - 4) + "px"
            this.resizeLayerBoxes()
        }
        return
    }
}