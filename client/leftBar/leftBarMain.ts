import { ColourBox } from './colourBox.ts';
import { UserBox } from './userBox.ts';
import { RollBox } from './rollBox.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { Board } from '../boardCanvas/localBoard.ts';
const hideLeft = getRequiredElement('hideLeftBar', HTMLButtonElement);
const leftBar = getRequiredElement('leftBar', HTMLElement);
const showUserButton = getRequiredElement('showUser', HTMLButtonElement);
const showColourButton = document.getElementById('showColour')!;
const showRollButton = getRequiredElement('showRoll', HTMLButtonElement);
const colourPicker = getRequiredElement('colourPicker', HTMLElement);
const colourBackground = getRequiredElement('colourBackground', HTMLElement);
const changeImage = getRequiredElement('changeImage', HTMLElement);
const fileInput = getRequiredElement('fileInput', HTMLInputElement);
const userBox = new UserBox();
const colourBox = new ColourBox();
const rollBox = new RollBox();
const serveInter = new tempStore();
const board = new Board();

// Class managing the top-left box.
// Somewhat poorly named.
export class LeftBarManager {
    visible: boolean;
    constructor() {
        this.visible = true;
        this.addEventListeners();
    }

    // Disables certain buttons if the client is not recognized as a GM.
    toggleModeSwitcher(isGm: boolean) {
        if (!isGm) {
            colourBackground.style.visibility = 'hidden';
            changeImage.style.visibility = 'hidden';
            colourPicker.style.top = '168px';
        }
    }

    // Toggles the visibility of the entire left box menu.
    toggleVisible() {
        leftBar.style.visibility = this.visible ? 'visible' : 'hidden';
        hideLeft.style.right = this.visible ? '-50px' : '180px';
        hideLeft.style.visibility = 'visible';
        hideLeft.innerText = this.visible ? 'Hide' : 'Show';
    }

    addEventListeners() {
        changeImage.addEventListener('click', () => {
            if (!board.bgImage.drawFlag) {
                serveInter.bgUpload = true;
                fileInput.click();
            } else {
                serveInter.removeFile();
            }
        });

        fileInput.addEventListener('change', () => {
            serveInter.uploadFile();
        });

        hideLeft.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
        });

        showUserButton.addEventListener('click', () => {
            this.toggleActive('USER');
        });

        showRollButton.addEventListener('click', () => {
            this.toggleActive('ROLL');
        });

        showColourButton.addEventListener('click', () => {
            this.toggleActive('COLOUR');
        });
    }

    // Toggles the currently active left box submenu.
    // TODO use an enum here
    toggleActive(newAct: string) {
        if (newAct === 'COLOUR') {
            userBox.toggleActive(false);
            colourBox.toggleActive(true);
            rollBox.toggleActive(false);
        } else if (newAct === 'ROLL') {
            userBox.toggleActive(false);
            colourBox.toggleActive(false);
            rollBox.toggleActive(true);
        } else if (newAct === 'USER') {
            userBox.toggleActive(true);
            colourBox.toggleActive(false);
            rollBox.toggleActive(false);
        }
    }
}
