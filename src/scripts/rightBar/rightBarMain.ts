import * as Character from './characterBarMenu.ts';
import * as Layer from './layerBarMenu.ts';
import * as Roll from './rollBarMenu.ts';
import * as Token from './tokenBarMenu.ts';
import { getRequiredElement } from '../dom.ts';

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
  layerMan: Layer.LayerMenu;
  tokenMan: Token.TokenMenu;
  characterMan: Character.CharacterMenu;
  rollMan: Roll.RollMenu;
  currActive: RightBarTab;

  constructor() {
    this.layerMan = new Layer.LayerMenu();
    this.tokenMan = new Token.TokenMenu();
    this.characterMan = new Character.CharacterMenu();
    this.rollMan = new Roll.RollMenu();
    this.currActive = RightBarTab.None;
    rightBar.style.width = '250px';
    this.addEventListeners();
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
}
