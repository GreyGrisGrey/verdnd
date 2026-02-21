import * as leftBar from "./leftBar/leftBarMain.ts"
import * as rightBar from "./rightBar/rightBarMain.ts"
import * as BoardParams from "./boardCanvas/localBoard.ts"
import * as ServerInterface from "./serverInterface.ts"

function checkDeletion() {
    let deletions = board.getDeletion()
    if (deletions != null) {
        for (let i = 0; i < deletions.length; i++) {
            serveInter.destroyObj(deletions[i].ID)
        }
        board.modeMan.clearSelected()
    }
    return
}

let board: BoardParams.Board = new BoardParams.Board()
let leftMan = new leftBar.LeftBarManager()
let rightMan = new rightBar.RightBarManager()
let serveInter = new ServerInterface.ServerInterface(board)
serveInter.createLayer()

while (true) {
    await new Promise(resolve => setTimeout(resolve, 25))
        if (board.modeMan.moveFlag) {
        let toChange = board.modeMan.getSelected()
        let valChange = board.determineTile(board.modeMan.selectMan.thirdOffset[0] + board.originCoords[0], board.modeMan.selectMan.thirdOffset[1] + board.originCoords[1], true)
        for (let i = 0; i < toChange.length; i++) {
            serveInter.moveObj(toChange[i].ID, valChange[0], valChange[1])
        }
        board.modeMan.selectMan.piecesMoved()
    }
    if (board.modeMan.recolourFlag) {
        let toChange = board.modeMan.getSelected()
        for (let i = 0; i < toChange.length; i++) {
            serveInter.changeObjColour(toChange[i].ID, document.getElementById("colourSquare")!.style.background)
        }
    }
    
    let newObj = board.getModeManObject()
    if (newObj != 1) {
        if (board.modeMan.drawMan.shape != "RECTS") {
            serveInter.createObj(newObj, 0)
        }
    }
    let events = serveInter.getItems()
    for (let i = 0; i < events.length; i++) {
        serveInter.handleObjEvent(events[i])
    }
    serveInter.clearQueue()
    rightMan.step()
    board.step()
    checkDeletion()
}