import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { RollComplete, RollResult } from '../../shared/objectEvents.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const rollBox = getRequiredElement('rollContainer', HTMLElement);
const colBox = getRequiredElement('colContainer', HTMLElement);

// Class manaing the roll menu on the right bar.
// Also manages the roll menu on the left bar. Questionable.
export class RollMenu {
    textBox: HTMLElement;
    active: boolean;
    modifier: string;
    modBox: HTMLElement;
    currChats: HTMLElement[];
    currBoxes: HTMLElement[];
    serveInter: tempStore;

    constructor(server: tempStore) {
        this.textBox = getRequiredElement('chatBoxTextBox', HTMLElement);
        this.active = false;
        this.modifier = '0';
        this.modBox = this.textBox;
        this.currChats = [];
        this.currBoxes = [];
        this.setRollElements();
        this.serveInter = server;
    }

    // Constructs the HTML elements corresponding to each roll option.
    // This looks dubious but it's not, because the structure of that will change substantially.
    // More importantly I don't want to write all this out by hand.
    setRollElements() {
        let count = 0;
        for (const i of [3, 4, 6, 8, 10, 12, 20, 100, 101]) {
            const newBox = document.createElement('div');
            rollBox.append(newBox);
            newBox.style.position = 'absolute';
            newBox.style.width = '100px';
            newBox.style.height = '20px';
            newBox.style.top = count * 30 + 5 + 'px';
            newBox.style.left = '10px';
            if (i !== 3 && i !== 101) {
                const newText = document.createElement('p');
                const setCount = document.createElement('input');
                const roll = document.createElement('input');

                roll.type = 'button';

                newBox.append(newText);
                newBox.append(setCount);
                newBox.append(roll);

                newText.style.position = 'absolute';
                newText.style.width = '30px';
                newText.style.height = '20px';
                newText.style.top = '-13px';
                newText.style.left = '0px';
                newText.innerText = 'Roll';

                setCount.style.position = 'absolute';
                setCount.style.width = '40px';
                setCount.style.height = '20px';
                setCount.style.top = '0px';
                setCount.style.left = '30px';
                setCount.value = '1';

                roll.style.position = 'absolute';
                roll.style.width = '50px';
                roll.style.height = '20px';
                roll.style.left = '80px';
                roll.style.top = '3px';
                roll.value = `D${i}`;

                roll.addEventListener('click', () => {
                    if (
                        Number.isNaN(Number(setCount.value)) ||
                        Math.abs(Number(setCount.value)) > 101
                    ) {
                        setCount.value = '0';
                        return;
                    }
                    this.constructPayload(
                        i,
                        Number(setCount.value),
                        false,
                        false,
                    );
                });
            } else if (i === 3) {
                const rollAdv = document.createElement('input');
                const rollDis = document.createElement('input');
                rollAdv.type = 'button';
                rollDis.type = 'button';
                rollAdv.value = 'Roll 2d20 (Adv)';
                rollDis.value = 'Roll 2d20 (Disadv)';
                newBox.append(rollAdv);
                newBox.append(rollDis);

                rollAdv.style.position = 'absolute';
                rollAdv.style.width = '100px';
                rollAdv.style.height = '20px';
                rollAdv.style.left = '0px';
                rollAdv.style.top = '3px';

                rollDis.style.position = 'absolute';
                rollDis.style.width = '120px';
                rollDis.style.height = '20px';
                rollDis.style.left = '110px';
                rollDis.style.top = '3px';

                rollAdv.addEventListener('click', () => {
                    this.constructPayload(20, 2, true, false);
                });

                rollDis.addEventListener('click', () => {
                    this.constructPayload(20, 2, false, true);
                });
            } else if (i === 101) {
                const newText = document.createElement('p');
                const setCount = document.createElement('input');

                newBox.append(newText);
                newBox.append(setCount);

                newText.style.position = 'absolute';
                newText.style.width = '30px';
                newText.style.height = '20px';
                newText.style.top = '-13px';
                newText.style.left = '0px';
                newText.innerText = 'Mod';

                setCount.style.position = 'absolute';
                setCount.style.width = '40px';
                setCount.style.height = '20px';
                setCount.style.top = '0px';
                setCount.style.left = '30px';
                setCount.value = '0';

                setCount.addEventListener('input', () => {
                    this.modifier = setCount.value;
                });

                this.modBox = setCount;
            }
            count++;
        }
    }

    // Toggles if the roll menu is active or not.
    // Also toggles if the colour menu is active or not. Extremely dubious.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.step();
        rollBox.style.visibility = this.active ? 'inherit' : 'hidden';
        rollBox.style.pointerEvents = this.active ? 'auto' : 'none';
        colBox.style.visibility = this.active ? 'hidden' : 'inherit';
        colBox.style.pointerEvents = this.active ? 'none' : 'auto';
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
        const data = this.serveInter.getDice();
        if (data) {
            this.updateChats(data);
        }
    }

    // Constructs a bunch of chat boxes for the roll menu.
    async constructChats() {
        for (let i = 0; i < 50; i++) {
            this.constructChat(i);
        }
    }

    // Constructs a single chat box for the roll menu.
    constructChat(currIndex: number) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        chatBox.append(newBox);
        newBox.append(newText);
        newBox.style.position = 'absolute';
        newBox.style.top = currIndex * 60 + 'px';
        newBox.style.width = '246px';
        newBox.style.height = '60px';
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
            console.log(this.currChats.length);
            this.constructChat(this.currChats.length);
        }
        let newString = '';
        for (const roll of dataLine.rolls) {
            newString += `(D${roll.size}, ${roll.result}) `;
        }
        this.currChats[currIndex].innerText =
            `User ${userName} Rolled` +
            newString +
            `\nResult = ${dataLine.result}`;
        this.currChats[currIndex].style.visibility = 'inherit';
        this.currBoxes[currIndex].style.visibility = 'inherit';
    }

    // Constructs a new roll payload and sends it to the backend.
    constructPayload(
        diceSize: number,
        diceCount: number,
        advantage: boolean,
        disadvantage: boolean,
    ) {
        if (
            Number.isNaN(Number(this.modifier)) ||
            Math.abs(Number(this.modifier)) > 101
        ) {
            this.modifier = '0';
            (this.modBox as any).value = '0';
            return;
        }
        let currLoad = {
            diceSize: diceSize,
            diceCount: diceCount,
            advantage: advantage,
            disadvantage: disadvantage,
            modifier: Number(this.modifier),
            result: 0,
        };
        this.serveInter.rollDice(currLoad);
    }
}
