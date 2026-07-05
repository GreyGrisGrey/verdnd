import { getRequiredElement } from '../dom.ts';
import { CharacterSheet } from '../../shared/character/characterSheet.ts';
const characterTab = getRequiredElement('characterTab', HTMLButtonElement);

export class CharacterMenu {
    active: boolean;
    currSheet: CharacterSheet;
    data: any;
    constructor() {
        this.active = false;
        this.data = [];
        this.getData();
        this.currSheet = new CharacterSheet();
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        characterTab.disabled = newAct;
    }

    async getData() {
        const response1 = await fetch('./client/assets/abilities.json');
        const abilities = await response1.json();
        const response2 = await fetch('./client/assets/skills.json');
        const skill = await response2.json();
        this.data = [abilities.default, skill.stat].map(
            (obj: Record<string, string>) => new Map(Object.entries(obj)),
        );
        this.currSheet.setAbilities(this.data[0]);
        this.currSheet.setSkills(this.data[1]);
    }
}
