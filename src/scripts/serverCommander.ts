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
            } else if (event[3] === "POLY") {
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

// Moves an object from layer 1 to layer 2
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