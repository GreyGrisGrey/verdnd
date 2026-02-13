// This should be doing the drawing. Or at least sending out the drawing command.
import * as BoardParams from "./localBoard.ts";
import * as BoardLayer from "./boardLayer.ts"
import * as BoardObject from "./boardObject.ts"
import * as ServerInterface from "./serverInterface.ts"

function addTestObjects() {
    let testLayer: BoardLayer.BoardLayer = new BoardLayer.BoardLayer()
    let testSquare: BoardObject.Rect = new BoardObject.Rect(8, 8, 2, 2)
    let testTriangle: BoardObject.Polyline = new BoardObject.Polyline(5, 5, [[3, 3], [2, 0]])
    let testPentagon: BoardObject.Polyline = new BoardObject.Polyline(5, 0, [[2, 1], [1, 3], [-1, 3], [-2, 1]])
    let testCircle: BoardObject.Circle = new BoardObject.Circle(0, 5, 3)
    let testObj: BoardObject.Token = new BoardObject.Token(0, 0)
    
    testTriangle.setZOrder(1)
    
    testLayer.addObject(testObj, 1)
    testLayer.addObject(testSquare, 2)
    testLayer.addObject(testTriangle, 3)
    testLayer.addObject(testPentagon, 4)
    testLayer.addObject(testCircle, 5)
    testSquare.setColour("rgba(255, 0, 255, 1)")
    testCircle.setColour("rgba(0, 255, 255, 1)")
    testPentagon.setColour("rgba(255, 255, 0, 1)")
    testTriangle.setColour("rgba(0, 255, 0, 1)")
    board.addLayer(testLayer, 1)
}

// Please make this less worse in every way.
function handleObjEvent(event: Array<any>) {
    if (event[0] === "LAYER") {
        if (event[2] === "DESTROY") {
            board.removeLayer(event[1])
        } else if (event[2] === "CREATE") {
            board.addLayer(new BoardLayer.BoardLayer(), event[1])
        } else if (event[2] === "REMOVE") {
            board.removeObject(event[3], event[1])
        } else if (event[2] === "ADD") {
            board.addObject(event[3], event[1], storedObjects.get(event[3]))
        } else if (event[2] === "MOVE") {
            board.moveLayer(event[1], event[3], event[4])
        }
    } else if (event[0] === "OBJECT") {
        if (event[2] === "MOVE") {
            storedObjects.get(event[1]).move(event[3], event[4])
        } else if (event[2] === "CREATE") {
            if (event[3] === "CIRCLE") {
                let newObj: BoardObject.Circle = new BoardObject.Circle(event[4], event[5], event[6])
                storedObjects.set(event[1], newObj)
            } else if (event[3] === "RECT") {
                let newObj: BoardObject.Rect = new BoardObject.Rect(event[4], event[5], event[6], event[7])
                storedObjects.set(event[1], newObj)
            } else if (event[3] === "TOKEN") {
                let newObj: BoardObject.Token = new BoardObject.Token(event[4], event[5])
                storedObjects.set(event[1], newObj)
            } else if (event[3] === "POLYLINE") {
                let newObj: BoardObject.Polyline = new BoardObject.Polyline(event[4], event[5], event[6])
                storedObjects.set(event[1], newObj)
            }
        } else if (event[2] === "DESTROY") {
            board.removeObject(event[1])
            storedObjects.delete(event[1])
        } else if (event[2] === "RECOLOUR") {
            storedObjects.get(event[1]).setColour(event[3])
        }
    }
}

function createLayer() {
    serveInter.sendItem(["LAYER", "CREATE"])
}

function destroyLayer(ID: number) {
    serveInter.sendItem(["LAYER", ID, "DESTROY"])
}

function moveLayer(ID: number, x: number, y: number) {
    serveInter.sendItem(["LAYER", ID, "MOVE", x, y])
}

// Movs an object from layer 1 to layer 2
function swapObjLayer(obj: number, lay1: number, lay2: number) {
    serveInter.sendItem(["LAYER", lay1, "REMOVE", obj])
    serveInter.sendItem(["LAYER", lay2, "ADD", obj])
}

function moveObj(obj: number, x: number, y:number) {
    serveInter.sendItem(["OBJECT", obj, "MOVE", x, y])
}

function createObj(extraParams: Array<any>, targetLayer: number) {
    let newArray: Array<any> = ["OBJECT", "CREATE"]
    for (let i = 0; i < extraParams.length; i++) {
        newArray.push(extraParams[i])
    }
    let newItem = serveInter.sendItem(newArray)
    serveInter.sendItem(["LAYER", targetLayer, "ADD", newItem])
}

function destroyObj(id: number) {
    serveInter.sendItem(["OBJECT", id, "DESTROY"])
}

function changeObjColour(id: number, newColour: string) {
    serveInter.sendItem(["OBJECT", id, "RECOLOUR", newColour])
}

let can = document.getElementById("board")!
let ctx = can.getContext('2d')
can.width = window.innerWidth
can.height = window.innerHeight
let board: BoardParams.Board = new BoardParams.Board(can)
let serveInter: ServerInterface.ServerInterface = new ServerInterface.ServerInterface()
let storedObjects: Map<number, any> = new Map()

createLayer()
createObj(["POLYLINE", 5, 0, [[2, 1], [1, 3], [-1, 3], [-2, 1]]], 0)
changeObjColour(0, "#cccccc")
while (true) {
    if (can.width != window.innerWidth){
        can.width = window.innerWidth
        can.height = window.innerHeight
    }
    await new Promise(resolve => setTimeout(resolve, 25));
    ctx.clearRect(0, 0, can.width, can.height)
    board.draw()
    let events = serveInter.getItems()
    for (let i = 0; i < events.length; i++) {
        handleObjEvent(events[i])
    }
    serveInter.clearQueue()
}