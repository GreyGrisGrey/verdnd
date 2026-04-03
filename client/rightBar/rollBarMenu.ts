import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { RollComplete } from '../../shared/objectEvents.ts';
import { ChatBox } from './chatBox.ts';
const serveInter = new TempStore();
const rightBar = getRequiredElement('rightBar', HTMLElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);

// Class manaing the roll menu on the right bar.
// Also manages the roll menu on the left bar. Questionable.
export class RollMenu {
    textBox: HTMLElement;
    active: boolean;
    modifier: string;
    modBox: HTMLElement;
    currChats: HTMLElement[];
    currBoxes: HTMLElement[];
    currElements: Map<number, ChatBox>;

    constructor() {
        this.textBox = getRequiredElement('chatBoxTextBox', HTMLElement);
        this.active = false;
        this.modifier = '0';
        this.modBox = this.textBox;
        this.currChats = [];
        this.currBoxes = [];
        this.currElements = new Map();
    }

    // Toggles if the roll menu is active or not.
    // Also toggles if the colour menu is active or not. Extremely dubious.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.step();
        chatBox.style.visibility = this.active ? 'inherit' : 'hidden';
        chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
    }

    // Performs a single step updating the roll menu.
    async step() {
        const rH = rightBar.style.height;
        const rW = rightBar.style.width;
        if (chatBox.style.height !== rH || chatBox.style.width !== rW) {
            chatBox.style.width = rW;
            chatBox.style.height = rH;
        }
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
