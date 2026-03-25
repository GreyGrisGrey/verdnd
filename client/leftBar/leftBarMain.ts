import { ColourBox } from './colourBox.ts';
import { UserBox } from './userBox.ts';
import { RollBox } from './rollBox.ts';
import { getRequiredElement } from '../dom.ts';
const hideLeft = getRequiredElement('hideLeftBar', HTMLButtonElement);
const leftBar = getRequiredElement('leftBar', HTMLElement);
const showUserButton = getRequiredElement('showUser', HTMLButtonElement);
const showColourButton = getRequiredElement('showColour', HTMLButtonElement);
const showRollButton = getRequiredElement('showRoll', HTMLButtonElement);
const colourPicker = getRequiredElement('colourPicker', HTMLElement);
const colourBackground = getRequiredElement('colourBackground', HTMLElement);
const userBox = new UserBox();
const colourBox = new ColourBox();
const rollBox = new RollBox();

// Class managing the top-left box.
// Somewhat poorly named.
export class LeftBarManager {
    visible: boolean;
    constructor() {
        this.visible = true;
        this.addEventListeners();
    }

    toggleModeSwitcher(isGm: boolean) {
        if (!isGm) {
            colourBackground.style.visibility = 'hidden';
        }
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
