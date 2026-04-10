import { getRequiredElement } from '../dom.ts';
import { RollComplete } from '../../shared/objectEvents.ts';
import { ChatBox } from './chatBox.ts';
const chatBox = getRequiredElement('chatBox', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLButtonElement);

// Class manaing the roll menu on the right bar.
// Also manages the roll menu on the left bar. Questionable.
export class RollMenu {
    active: boolean;
    modifier: string;
    currChats: HTMLElement[];
    currBoxes: HTMLElement[];
    currElements: Map<number, ChatBox>;

    constructor() {
        this.active = false;
        this.modifier = '0';
        this.currChats = [];
        this.currBoxes = [];
        this.currElements = new Map();
    }

    // Toggles if the roll menu is active or not.
    // Also toggles if the colour menu is active or not. Extremely dubious.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        chatBox.style.visibility = this.active ? 'inherit' : 'hidden';
        chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
        rollTab.disabled = newAct;
    }

    // Constructs a single chat box for the roll menu.
    constructChat(id: number, data: RollComplete) {
        const targetNum = id;
        if (!this.currElements.has(targetNum)) {
            this.currElements.set(targetNum, new ChatBox(true, targetNum));
        }
        this.currElements
            .get(targetNum)!
            .updateRoll(data.result, data.userName);
    }
}
