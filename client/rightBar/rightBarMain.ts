import { CharacterMenu } from './characterBarMenu.ts';
import { LayerMenu } from './layerBarMenu.ts';
import { RollMenu } from './rollBarMenu.ts';
import { ObjectMenu } from './objectBarMenu.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const layerBox = getRequiredElement('layerLayerObj', HTMLElement);
const layerTab = getRequiredElement('layerTab', HTMLElement);
const objectTab = getRequiredElement('objectTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);
const hideRight = getRequiredElement('hideRightBar', HTMLButtonElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const objBox = getRequiredElement('objBox', HTMLElement);
const serveInter = new tempStore();
const layerMan = new LayerMenu();
const objectMan = new ObjectMenu();
const characterMan = new CharacterMenu();
const rollMan = new RollMenu();

export enum RightBarTab {
    None = 'NONE',
    Layer = 'LAYER',
    Object = 'OBJECT',
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
            objectMan.toggleActive(false);
            this.currActive = RightBarTab.Layer;
        });

        objectTab.addEventListener('click', () => {
            layerMan.toggleActive(false);
            rollMan.toggleActive(false);
            objectMan.toggleActive(true);
            this.currActive = RightBarTab.Object;
            objectMan.step(Math.min(800, window.innerHeight - 50));
        });

        rollTab.addEventListener('click', () => {
            layerMan.toggleActive(false);
            rollMan.toggleActive(true);
            objectMan.toggleActive(false);
            this.currActive = RightBarTab.Roll;
        });

        characterTab.addEventListener('click', () => {
            layerMan.toggleActive(false);
            rollMan.toggleActive(false);
            objectMan.toggleActive(false);
            this.currActive = RightBarTab.Character;
        });

        hideRight.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
        });

        document.addEventListener('keydown', (event) => {
            if (
                document.activeElement &&
                document.activeElement.tagName === 'INPUT'
            ) {
                return;
            }
            if (event.key === 'p') {
                layerMan.toggleActive(false);
                rollMan.toggleActive(true);
                objectMan.toggleActive(false);
                this.currActive = RightBarTab.Roll;
            } else if (event.key === 'l' && serveInter.isGm) {
                layerMan.toggleActive(true);
                rollMan.toggleActive(false);
                objectMan.toggleActive(false);
                this.currActive = RightBarTab.Layer;
            } else if (event.key === 'o' && serveInter.isGm) {
                layerMan.toggleActive(false);
                rollMan.toggleActive(false);
                objectMan.toggleActive(true);
                this.currActive = RightBarTab.Character;
            }
        });
    }

    toggleModeSwitcher(gm: boolean) {
        if (!gm) {
            layerMan.toggleActive(false);
            rollMan.toggleActive(true);
            objectMan.toggleActive(false);
            this.currActive = RightBarTab.Roll;
            rollTab.style.visibility = 'hidden';
            objectTab.style.visibility = 'hidden';
            layerTab.style.visibility = 'hidden';
            characterTab.style.visibility = 'hidden';
        } else {
            layerTab.style.visibility = 'inherit';
            rollTab.style.visibility = 'inherit';
        }
    }

    // A single step updating the state of the currently active menu.
    step() {
        const barHeight = `${Math.min(800, window.innerHeight - 50)}px`;
        rightBar.style.height = barHeight;
        layerBox.style.height = barHeight;
        chatBox.style.height = barHeight;
        objBox.style.height = barHeight;
        if (this.currActive === RightBarTab.Layer) {
            layerMan.step();
        } else if (this.currActive === RightBarTab.Roll) {
            rollMan.step();
        } else if (this.currActive === RightBarTab.Object) {
            objectMan.step(Math.min(800, window.innerHeight - 50));
        }
    }
}
