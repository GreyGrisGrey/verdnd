import { ColourBox } from './colourBox.ts';
import { UserBox } from './userBox.ts';
import { RollBox } from './rollBox.ts';
import { getRequiredElement } from '../dom.ts';
import { getTempStore } from '../tempStoreSingleton.ts';
import { TooltipManager, TooltipMode } from '../tooltip.ts';
import { getBoard, getModeManager } from '../uiSingleton.ts';
const hideLeft = getRequiredElement('hideLeftBar', HTMLButtonElement);
const leftBar = getRequiredElement('leftBar', HTMLElement);
const showUserButton = getRequiredElement('showUser', HTMLButtonElement);
const showColourButton = document.getElementById('showColour')!;
const showRollButton = getRequiredElement('showRoll', HTMLButtonElement);
const colourPicker = getRequiredElement('colourPicker', HTMLButtonElement);
const colourBackground = getRequiredElement('colourBackground', HTMLElement);
const changeImage = getRequiredElement('changeImage', HTMLElement);
const fileInput = getRequiredElement('fileInput', HTMLInputElement);
const userBox = new UserBox();
const colourBox = new ColourBox();
const rollBox = new RollBox();
const tooltipManager = new TooltipManager();

export enum LeftBarPanel {
    Colour = 'COLOUR',
    Roll = 'ROLL',
    User = 'USER',
}

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
        hideLeft.style.right = this.visible ? '-50px' : '190px';
        hideLeft.style.visibility = 'visible';
        hideLeft.innerText = this.visible ? 'Hide' : 'Show';
    }

    // Adds event listeners.
    addEventListeners() {
        changeImage.addEventListener('click', () => {
            const board = getBoard();
            if (!board.bgImage.drawFlag) {
                getTempStore().bgUpload = true;
                fileInput.click();
            } else {
                getTempStore().removeFile();
            }
        });

        changeImage.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Left, 'changeImage');
        });

        changeImage.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        fileInput.addEventListener('change', () => {
            getTempStore().uploadFile();
        });

        hideLeft.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(
                TooltipMode.Left,
                this.visible ? 'hide' : 'show',
            );
        });

        hideLeft.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        hideLeft.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
            tooltipManager.hardDisable();
        });

        showUserButton.addEventListener('click', () => {
            this.toggleActive(LeftBarPanel.User);
        });

        showUserButton.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Left, 'users');
        });

        showUserButton.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        showColourButton.addEventListener('click', () => {
            this.toggleActive(LeftBarPanel.Colour);
        });

        showColourButton.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Left, 'col');
        });

        showColourButton.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        showRollButton.addEventListener('click', () => {
            this.toggleActive(LeftBarPanel.Roll);
        });

        showRollButton.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Left, 'roll');
        });

        showRollButton.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        document.addEventListener('keydown', (event) => {
            const modeMan = getModeManager();
            if (
                document.activeElement &&
                document.activeElement.tagName === 'INPUT'
            ) {
                return;
            }
            if (event.key === 'z' && !modeMan.controlClick) {
                this.toggleActive(LeftBarPanel.User);
            } else if (event.key === 'x' && getTempStore().isGm) {
                this.toggleActive(LeftBarPanel.Colour);
            } else if (event.key === 'c') {
                this.toggleActive(LeftBarPanel.Roll);
            }
        });
    }

    // Toggles the currently active left box submenu.
    toggleActive(newAct: LeftBarPanel) {
        if (newAct === LeftBarPanel.Colour) {
            userBox.toggleActive(false);
            colourBox.toggleActive(true);
            rollBox.toggleActive(false);
        } else if (newAct === LeftBarPanel.Roll) {
            userBox.toggleActive(false);
            colourBox.toggleActive(false);
            rollBox.toggleActive(true);
        } else if (newAct === LeftBarPanel.User) {
            userBox.toggleActive(true);
            colourBox.toggleActive(false);
            rollBox.toggleActive(false);
        }
    }
}
