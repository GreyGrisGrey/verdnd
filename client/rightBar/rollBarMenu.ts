import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { RollComplete, RollResult } from '../../shared/objectEvents.ts';
const serveInter = new tempStore();
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

    constructor() {
        this.textBox = getRequiredElement('chatBoxTextBox', HTMLElement);
        this.active = false;
        this.modifier = '0';
        this.modBox = this.textBox;
        this.currChats = [];
        this.currBoxes = [];
    }

    // Toggles if the roll menu is active or not.
    // Also toggles if the colour menu is active or not. Extremely dubious.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.step();
        chatBox.style.visibility = this.active ? 'inherit' : 'hidden';
        chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
        for (const text of this.currChats) {
            text.style.visibility = this.active ? 'inherit' : 'hidden';
        }
        for (const box of this.currBoxes) {
            box.style.visibility = this.active ? 'inherit' : 'hidden';
        }
    }

    // Performs a single step updating the roll menu.
    async step() {
        const rH = rightBar.style.height;
        const rW = rightBar.style.width;
        if (chatBox.style.height !== rH || chatBox.style.width !== rW) {
            chatBox.style.width = rW;
            chatBox.style.height = rH;
        }
        const data = serveInter.getDice();
        if (data) {
            this.updateChats(data);
        }
    }

    // Constructs a single chat box for the roll menu.
    constructChat(currIndex: number) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        chatBox.append(newBox);
        newBox.append(newText);
        newBox.style.position = 'absolute';
        newBox.style.top = currIndex * 90 + 'px';
        newBox.style.width = '246px';
        newBox.style.height = '90px';
        newBox.style.border = 'solid #000000';
        newBox.style.visibility = 'inherit';

        newText.style.position = 'absolute';
        newText.style.width = '246px';
        newText.style.left = '0px';
        newText.style.height = '60px';
        newText.style.overflow = 'hidden';
        newText.style.visibility = 'inherit';
        newText.style.whiteSpace = 'nowrap';
        this.currChats.push(newText);
        this.currBoxes.push(newBox);
    }

    // Updates the text of the chat boxes.
    updateChats(data: Map<number, RollComplete>) {
        for (const [key, val] of data) {
            const targetNum = key;
            this.updateChat(val.result, targetNum, val.userName);
        }
    }

    // Updates a chat box.
    updateChat(dataLine: RollResult, currIndex: number, userName: string) {
        while (this.currChats.length <= currIndex) {
            this.constructChat(this.currChats.length);
        }
        let newString = '';
        console.log(dataLine);
        for (const roll of dataLine.rolls) {
            newString += `${roll.result} + `;
        }
        newString = newString.slice(0, newString.length - 3);
        this.currChats[currIndex].innerText =
            `${userName} Rolled\n` +
            newString +
            `\nResult = ${dataLine.result}`;
        this.currChats[currIndex].style.visibility = 'inherit';
        this.currBoxes[currIndex].style.visibility = 'inherit';
    }
}
