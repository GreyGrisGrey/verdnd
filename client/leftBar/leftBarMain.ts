import { ColourBox } from './colourBox.ts';
import { Board } from '../boardCanvas/localBoard.ts';
import { getRequiredElement } from '../dom.ts';
const hideLeft = getRequiredElement('hideLeftBar', HTMLButtonElement);
const leftBar = getRequiredElement('leftBar', HTMLElement);
const board = new Board();

// Class managing the top-left box.
// Somewhat poorly named.
export class LeftBarManager {
    colourPicker: ColourBox;
    visible: boolean;
    constructor() {
        this.colourPicker = new ColourBox();
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
