import * as BoardLayer from "./boardCanvas/boardLayer.ts"
import * as BoardParams from "./boardCanvas/localBoard.ts"
import * as BoardObject from "./boardCanvas/boardObject.ts"

// Class that will handle interfacing with the server.
// Currently does not do much of anything besides serving as a standin.
export class ServerInterface {
    user: string
    pass: string
    heldItems: Array<Array<any>>
    layerIDMap: Map<number, boolean>
    objectIDMap: Map<number, boolean>
    storedObjects: Map<number, any>
    board: BoardParams.Board
    
    constructor(newBoard: BoardParams.Board) {
        this.user = "bwagh"
        this.pass = "password1"
        this.heldItems = new Array()
        this.layerIDMap = new Map()
        this.objectIDMap = new Map()
        this.board = newBoard
        this.storedObjects = new Map()
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
    
    // Please make this less worse in every way.
    handleObjEvent(event: Array<any>) {
        if (event[0] === "LAYER") {
            if (event[2] === "DESTROY") {
                this.board.removeLayer(event[1])
            } else if (event[2] === "CREATE") {
                this.board.addLayer(new BoardLayer.BoardLayer(), event[1])
            } else if (event[2] === "REMOVE") {
                this.board.removeObject(event[3], event[1])
            } else if (event[2] === "ADD") {
                this.board.addObject(event[3], event[1], this.storedObjects.get(event[3]))
            } else if (event[2] === "MOVE") {
                this.board.moveLayer(event[1], event[3], event[4])
            }
        } else if (event[0] === "OBJECT") {
            if (event[2] === "MOVE") {
                this.storedObjects.get(event[1]).move(event[3], event[4])
            } else if (event[2] === "CREATE") {
                if (event[3] === "CIRCLE") {
                    let newObj: BoardObject.Circle = new BoardObject.Circle(event[1], event[4], event[5], event[6], event[7])
                    this.storedObjects.set(event[1], newObj)
                } else if (event[3] === "RECT") {
                    let newObj: BoardObject.Rect = new BoardObject.Rect(event[1], event[4], event[5], event[6], event[7], event[8])
                    this.storedObjects.set(event[1], newObj)
                } else if (event[3] === "TOKEN") {
                    let newObj: BoardObject.Token = new BoardObject.Token(event[1], event[4], event[5], event[6], event[7], event[8])
                    this.storedObjects.set(event[1], newObj)
                } else if (event[3] === "POLY") {
                    let newObj: BoardObject.Polyline = new BoardObject.Polyline(event[1], event[4], event[5], event[6], event[7])
                    this.storedObjects.set(event[1], newObj)
                } else if (event[3] === "LINE") {
                    let newObj: BoardObject.Line = new BoardObject.Line(event[1], event[4], event[5], event[6], event[7])
                    this.storedObjects.set(event[1], newObj)
                }
            } else if (event[2] === "DESTROY") {
                this.board.removeObject(event[1])
                this.storedObjects.delete(event[1])
            } else if (event[2] === "RECOLOUR") {
                this.storedObjects.get(event[1]).setColour(event[3])
            }
        }
    }

    createLayer() {
        this.sendItem(["LAYER", "CREATE"])
    }

    destroyLayer(ID: number) {
        this.sendItem(["LAYER", ID, "DESTROY"])
    }

    moveLayer(ID: number, x: number, y: number) {
        this.sendItem(["LAYER", ID, "MOVE", x, y])
    }

    // Moves an object from layer 1 to layer 2
    swapObjLayer(obj: number, lay1: number, lay2: number) {
        this.sendItem(["LAYER", lay1, "REMOVE", obj])
        this.sendItem(["LAYER", lay2, "ADD", obj])
    }

    moveObj(obj: number, x: number, y:number) {
        this.sendItem(["OBJECT", obj, "MOVE", x, y])
    }

    createObj(extraParams: Array<any>, targetLayer: number) {
        let newArray: Array<any> = ["OBJECT", "CREATE"]
        for (let i = 0; i < extraParams.length; i++) {
            newArray.push(extraParams[i])
        }
        let newItem = this.sendItem(newArray)
        this.sendItem(["LAYER", targetLayer, "ADD", newItem])
    }

    destroyObj(id: number) {
        this.sendItem(["OBJECT", id, "DESTROY"])
    }

    changeObjColour(id: number, newColour: string) {
        this.sendItem(["OBJECT", id, "RECOLOUR", newColour])
    }
}