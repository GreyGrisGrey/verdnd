import { CharacterMenu } from './characterBarMenu.ts';
import { LayerMenu } from './layerBarMenu.ts';
import { RollMenu } from './rollBarMenu.ts';
import { TokenMenu } from './tokenBarMenu.ts';
import { getRequiredElement } from '../dom.ts';

import type { LayerState } from './layerBarMenu.ts';

const rightBar = getRequiredElement('rightBar', HTMLElement);
const rightPara = getRequiredElement('rightPara', HTMLElement);
const layerTab = getRequiredElement('layerTab', HTMLElement);
const tokenTab = getRequiredElement('tokenTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);

export enum RightBarTab {
    None = 'NONE',
    Layer = 'LAYER',
    Token = 'TOKEN',
    Roll = 'ROLL',
    Character = 'CHARACTER',
}

export class RightBarManager {
    layerMan: LayerMenu;
    tokenMan: TokenMenu;
    characterMan: CharacterMenu;
    rollMan: RollMenu;
    currActive: RightBarTab;

    constructor() {
        this.layerMan = new LayerMenu();
        this.tokenMan = new TokenMenu();
        this.characterMan = new CharacterMenu();
        this.rollMan = new RollMenu();
        this.currActive = RightBarTab.Layer;
        rightBar.style.width = '250px';
        this.addEventListeners();
        this.layerMan.toggleActive(true);
        this.setText();
    }

    addEventListeners() {
        layerTab.addEventListener('click', () => {
            this.layerMan.toggleActive(true);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Layer;
            this.setText();
        });

        tokenTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Token;
            this.setText();
        });

        rollTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(true);
            this.currActive = RightBarTab.Roll;
            this.setText();
        });

        characterTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Character;
            this.setText();
        });
    }

    step() {
        rightBar.style.height = `${window.innerHeight - 20}px`;
        if (this.currActive === RightBarTab.Layer) {
            this.layerMan.step();
        } else if (this.currActive === RightBarTab.Roll) {
            this.rollMan.step();
        }
    }

    setText() {
        if (this.currActive === RightBarTab.Layer) {
            rightPara.innerText = '';
        } else if (this.currActive === RightBarTab.Roll) {
            rightPara.innerText = '';
        } else {
            rightPara.innerText = 'WIP';
        }
    }

    addLayer(newLayer: LayerState) {
        this.layerMan.addNewLayer(newLayer);
    }
}
