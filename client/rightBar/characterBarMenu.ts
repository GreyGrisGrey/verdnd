import { getRequiredElement } from '../dom.ts';
import { CharacterSheet } from '../../shared/character/characterSheet.ts';
const characterTab = getRequiredElement('characterTab', HTMLButtonElement);
const charBox = getRequiredElement('charBox', HTMLElement);
const abilityBox = getRequiredElement('abilityBox', HTMLElement);
const skillBox = getRequiredElement('skillBox', HTMLElement);
const dataBox = getRequiredElement('dataBox', HTMLElement);

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

    setUpBox() {
        for (const i of this.currSheet.getSkills()) {
            const newBox = document.createElement('div');
            const newName = document.createElement('text');
            const newCheck = document.createElement('input');
            newCheck.type = 'checkbox';
            newBox.append(newName);
            newBox.append(newCheck);
            skillBox.append(newBox);
            newName.innerText = `${i[1].name}, ${i[1].modifier}`;
            if (i[1].proficiency >= 1) {
                newCheck.checked = true;
            }
        }
        for (const i of this.currSheet.getAbilities()) {
            const newBox = document.createElement('div');
            const newName = document.createElement('text');
            newBox.append(newName);
            abilityBox.append(newBox);
            newName.innerText = `${i[1].name}, ${i[1].score}`;
        }

        const nameBox = document.createElement('text');
        const speciesBox = document.createElement('text');
        const levelBox = document.createElement('text');
        dataBox.append(nameBox);
        dataBox.append(speciesBox);
        dataBox.append(levelBox);
        nameBox.innerText = `${this.currSheet.name}`;
        speciesBox.innerText = `${this.currSheet.species}`;
        levelBox.innerText = `${this.currSheet.getLevel()}`;
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        characterTab.disabled = newAct;
        charBox.style.visibility = this.active ? 'inherit' : 'hidden';
        charBox.style.pointerEvents = this.active ? 'auto' : 'none';
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
        this.currSheet.debugRandomize();
        this.setUpBox();
    }
}
