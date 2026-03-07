import { ColourBox } from './colourBox.ts';
import { Board } from '../boardCanvas/localBoard.ts';

// Class managing the top-left box.
// Somewhat poorly named.
export class LeftBarManager {
    colourPicker: ColourBox;
    board: Board;
    constructor(newBoard: Board) {
        this.colourPicker = new ColourBox(newBoard);
        this.board = newBoard;
    }
}
