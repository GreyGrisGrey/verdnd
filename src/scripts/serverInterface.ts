import * as BoardLayer from "./boardLayer.ts"

export class ServerInterface {
    user: string
    pass: string
    heldItems: Array<Array<any>>
    layerIDMap: Map<number, boolean>
    objectIDMap: Map<number, boolean>
    
    constructor() {
        this.user = "bwagh"
        this.pass = "nah"
        this.heldItems = new Array()
        this.layerIDMap = new Map()
        this.objectIDMap = new Map()
    }
    
    clearQueue() {
        this.heldItems = new Array()
    }
    
    getItems(): Array<any> {
        return this.heldItems
    }
    
    sendItem(newItem: Array<any>): number {
        if (newItem[0] === "LAYER" && newItem[1] === "CREATE") {
            let curr = 0
            while (true) {
                if (!this.layerIDMap.has(curr)) {
                    this.heldItems.push(["LAYER", curr, "CREATE"])
                    this.layerIDMap.set(curr, true)
                    return curr
                }
                curr++
            }
        } else if (newItem[0] === "OBJECT" && newItem[1] === "CREATE") {
            let curr = 0
            while (true) {
                if (!this.objectIDMap.has(curr)) {
                    newItem.splice(1, 0, curr)
                    this.heldItems.push(newItem)
                    this.objectIDMap.set(curr, true)
                    return curr
                }
                curr++
            }
        }
        this.heldItems.push(newItem)
        return 0
    }
}