import { CharacterMenu } from './characterBarMenu.ts';
import { LayerMenu } from './layerBarMenu.ts';
import { RollMenu } from './rollBarMenu.ts';
import { TokenMenu } from './tokenBarMenu.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { LayerState } from '../../shared/objectEvents.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const rollBox = getRequiredElement('rollContainer', HTMLElement);
const layerBox = getRequiredElement('layerLayerObj', HTMLElement);
const layerTab = getRequiredElement('layerTab', HTMLElement);
const tokenTab = getRequiredElement('tokenTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);
const hideRight = getRequiredElement('hideRightBar', HTMLButtonElement);

export enum RightBarTab {
    None = 'NONE',
    Layer = 'LAYER',
    Token = 'TOKEN',
    Roll = 'ROLL',
    Character = 'CHARACTER',
}

// Class managing the right bar and its constituent menues.
export class RightBarManager {
    layerMan: LayerMenu;
    tokenMan: TokenMenu;
    characterMan: CharacterMenu;
    rollMan: RollMenu;
    currActive: RightBarTab;
    serveInter: tempStore;
    visible: boolean;

    constructor(server: tempStore, layMap: Map<number, LayerState>) {
        this.serveInter = server;
        this.layerMan = new LayerMenu(this.serveInter, layMap);
        this.tokenMan = new TokenMenu();
        this.characterMan = new CharacterMenu();
        this.rollMan = new RollMenu(this.serveInter);
        this.currActive = RightBarTab.Layer;
        this.visible = true;
        rightBar.style.width = '250px';
        this.addEventListeners();
        this.layerMan.toggleActive(true);
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
            this.layerMan.toggleActive(true);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Layer;
        });

        tokenTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Token;
        });

        rollTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(true);
            this.currActive = RightBarTab.Roll;
        });

        characterTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Character;
        });

        hideRight.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'p') {
                this.layerMan.toggleActive(false);
                this.rollMan.toggleActive(true);
                this.currActive = RightBarTab.Roll;
            } else if (event.key === 'l') {
                this.layerMan.toggleActive(true);
                this.rollMan.toggleActive(false);
                this.currActive = RightBarTab.Layer;
            }
        });
    }

    // A single step updating the state of the currently active menu.
    step() {
        rightBar.style.height = `${window.innerHeight - 20}px`;
        layerBox.style.height = `${window.innerHeight - 20}px`;
        rollBox.style.height = `${window.innerHeight - 20}px`;
        if (this.currActive === RightBarTab.Layer) {
            this.layerMan.step();
        } else if (this.currActive === RightBarTab.Roll) {
            this.rollMan.step();
        }
    }
}
