import { CharacterMenu } from './characterBarMenu.ts';
import { LayerMenu } from './layerBarMenu.ts';
import { RollMenu } from './rollBarMenu.ts';
import { TokenMenu } from './tokenBarMenu.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const layerBox = getRequiredElement('layerLayerObj', HTMLElement);
const layerTab = getRequiredElement('layerTab', HTMLElement);
const tokenTab = getRequiredElement('tokenTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);
const hideRight = getRequiredElement('hideRightBar', HTMLButtonElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const serveInter = new tempStore();
const layerMan = new LayerMenu();
const tokenMan = new TokenMenu();
const characterMan = new CharacterMenu();
const rollMan = new RollMenu();

export enum RightBarTab {
    None = 'NONE',
    Layer = 'LAYER',
    Token = 'TOKEN',
    Roll = 'ROLL',
    Character = 'CHARACTER',
}

// Class managing the right bar and its constituent menues.
export class RightBarManager {
    currActive: RightBarTab;
    visible: boolean;

    constructor() {
        this.currActive = RightBarTab.Layer;
        this.visible = true;
        rightBar.style.width = '250px';
        this.addEventListeners();
        layerMan.toggleActive(true);
    }

    toggleVisible() {
        rightBar.style.visibility = this.visible ? 'visible' : 'hidden';
        hideRight.style.left = this.visible ? '-50px' : '210px';
        hideRight.style.visibility = 'visible';
        hideRight.innerText = this.visible ? 'Hide' : 'Show';
    }

    // Adds relevant event listeners to each tab object.
    addEventListeners() {
        layerTab.addEventListener('click', () => {
            layerMan.toggleActive(true);
            rollMan.toggleActive(false);
            this.currActive = RightBarTab.Layer;
        });

        tokenTab.addEventListener('click', () => {
            layerMan.toggleActive(false);
            rollMan.toggleActive(false);
            this.currActive = RightBarTab.Token;
        });

        rollTab.addEventListener('click', () => {
            layerMan.toggleActive(false);
            rollMan.toggleActive(true);
            this.currActive = RightBarTab.Roll;
        });

        characterTab.addEventListener('click', () => {
            layerMan.toggleActive(false);
            rollMan.toggleActive(false);
            this.currActive = RightBarTab.Character;
        });

        hideRight.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'p') {
                layerMan.toggleActive(false);
                rollMan.toggleActive(true);
                this.currActive = RightBarTab.Roll;
            } else if (event.key === 'l' && serveInter.isGm) {
                layerMan.toggleActive(true);
                rollMan.toggleActive(false);
                this.currActive = RightBarTab.Layer;
            }
        });
    }

    toggleModeSwitcher(gm: boolean) {
        if (!gm) {
            layerMan.toggleActive(false);
            rollMan.toggleActive(true);
            this.currActive = RightBarTab.Roll;
            rollTab.style.visibility = 'hidden';
            tokenTab.style.visibility = 'hidden';
            layerTab.style.visibility = 'hidden';
            characterTab.style.visibility = 'hidden';
        } else {
            layerTab.style.visibility = 'inherit';
            rollTab.style.visibility = 'inherit';
        }
    }

    // A single step updating the state of the currently active menu.
    step() {
        rightBar.style.height = `${window.innerHeight - 50}px`;
        layerBox.style.height = `${window.innerHeight - 50}px`;
        chatBox.style.height = `${window.innerHeight - 50}px`;
        if (this.currActive === RightBarTab.Layer) {
            layerMan.step();
        } else if (this.currActive === RightBarTab.Roll) {
            rollMan.step();
        }
    }
}
