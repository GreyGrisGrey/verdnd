import { ColourBox } from './colourBox.ts';
import { Board } from '../boardCanvas/localBoard.ts';
import { getRequiredElement } from '../dom.ts';
const hideLeft = getRequiredElement('hideLeftBar', HTMLButtonElement);
const leftBar = getRequiredElement('leftBar', HTMLElement);

// Class managing the top-left box.
// Somewhat poorly named.
export class LeftBarManager {
    colourPicker: ColourBox;
    board: Board;
    visible: boolean;
    constructor(newBoard: Board) {
        this.colourPicker = new ColourBox(newBoard);
        this.board = newBoard;
        this.visible = true;
        this.addEventListeners();
    }

    toggleVisible() {
        leftBar.style.visibility = this.visible ? 'visible' : 'hidden';
        hideLeft.style.left = this.visible ? '260px' : '0px';
        hideLeft.style.visibility = 'visible';
        hideLeft.innerText = this.visible ? 'Hide' : 'Show';
    }

    addEventListeners() {
        hideLeft.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
        });
    }
}
