import { getRequiredElement } from '../dom.ts';
import { CharacterSheet } from '../../shared/characterSheet.ts';
const characterTab = getRequiredElement('characterTab', HTMLButtonElement);

export class CharacterMenu {
    active: boolean;
    currSheet: CharacterSheet;
    constructor() {
        this.active = false;
        this.currSheet = new CharacterSheet();
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        characterTab.disabled = newAct;
    }
}
