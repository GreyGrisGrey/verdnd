// Driver
import * as BoardParams from "./localBoard.ts";

let board: BoardParams.Board = new BoardParams.Board()

while (true) {
    await board.step()
}