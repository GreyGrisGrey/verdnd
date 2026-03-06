import { GREY } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const rollBox = getRequiredElement('rollContainer', HTMLElement);
const colBox = getRequiredElement('colContainer', HTMLElement);

export interface DicePayload {
    four: number;
    six: number;
    eight: number;
    ten: number;
    twelve: number;
    twenty: number;
    hundred: number;
    dropLow: number;
    dropHigh: number;
    singleDice: boolean;
    singleNum: number;
    modifier: number;
    result: number;
}

// Class manaing the roll menu on the right bar.
// Also manages the roll menu on the left bar. Questionable.
export class RollMenu {
    textBox: HTMLElement;
    active: boolean;
    modifier: number;
    currChats: HTMLElement[];
    serveInter: tempStore;

    constructor(server: tempStore) {
        this.textBox = document.createElement('textarea');
        this.active = false;
        this.modifier = 0;
        this.currChats = [];
        this.textBox.style.visibility = 'hidden';
        this.textBox.style.pointerEvents = 'none';
        chatBox.style.visibility = 'hidden';
        chatBox.style.pointerEvents = 'none';
        this.setMainElements();
        this.setRollElements();
        this.constructChats();
        this.serveInter = server;
    }

    // Updates the main elements of the menu. Also questionable, why is this not in a style element.
    setMainElements() {
        chatBox.append(this.textBox);
        chatBox.style.background = GREY.toString();
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

                setCount.addEventListener('input', () => {
                    if (
                        Number(setCount.value) &&
                        Math.abs(Number(setCount.value)) < 9999
                    ) {
                        this.modifier = Number(setCount.value);
                    } else if (Number(setCount.value) > 0) {
                        setCount.value = '9999';
                    } else if (Number(setCount.value)) {
                        setCount.value = '-9999';
                    } else {
                        setCount.value = '0';
                    }
                });

                roll.addEventListener('click', () => {
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
                    if (
                        Number(setCount.value) &&
                        Math.abs(Number(setCount.value)) < 9999
                    ) {
                        this.modifier = Number(setCount.value);
                    } else if (Number(setCount.value) > 0) {
                        setCount.value = '9999';
                        this.modifier = 9999;
                    } else if (Number(setCount.value)) {
                        setCount.value = '-9999';
                        this.modifier = -9999;
                    } else {
                        setCount.value = '1';
                        this.modifier = 1;
                    }
                });
            }
            count++;
        }
    }

    // Toggles if the roll menu is active or not.
    // Also toggles if the colour menu is active or not. Extremely dubious.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        rollBox.style.visibility = this.active ? 'visible' : 'hidden';
        rollBox.style.pointerEvents = this.active ? 'auto' : 'none';
        colBox.style.visibility = this.active ? 'hidden' : 'visible';
        colBox.style.pointerEvents = this.active ? 'none' : 'auto';
        chatBox.style.visibility = this.active ? 'visible' : 'hidden';
        chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
        for (const text of this.currChats) {
            text.style.visibility = this.active ? 'visible' : 'hidden';
        }
    }

    // Performs a single step updating the roll menu.
    async step() {
        const rH = rightBar.style.height;
        const rW = rightBar.style.width;
        if (chatBox.style.height !== rH || chatBox.style.width !== rW) {
            chatBox.style.width = rW;
            chatBox.style.height = rH;
            const w = parseInt(rW, 10);
            if (!Number.isNaN(w)) {
                this.textBox.style.width = `${w - 30}px`;
            }
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
        newBox.style.bottom = currIndex * 30 + 10 + 'px';
        newBox.style.left = '10px';
        newBox.style.width = '100px';
        newBox.style.height = '30px';

        newText.style.position = 'absolute';
        newText.style.width = '100px';
        newText.style.height = '30px';
        this.currChats.push(newText);
    }

    // Updates the text of the chat boxes.
    updateChats(data: Map<number, number>) {
        console.log(data);
        for (const [key, val] of data) {
            const targetNum = data.size - (key + 1);
            if (targetNum < 50 && targetNum >= 0) {
                this.updateChat(val, targetNum);
            }
        }
    }

    // Updates a chat box.
    updateChat(dataLine: number, currIndex: number) {
        this.currChats[currIndex].innerText = `Rolled ${dataLine}`;
        this.currChats[currIndex].style.visibility = 'visible';
    }

    // Constructs a dice roll payload out of the current state of the left roll menu, plus some parameters from the button that called this.
    // Very unclean. Will be fixed.
    constructPayload(
        diceSize: number,
        diceCount: number,
        advantage: boolean,
        disadvantage: boolean,
    ) {
        let currLoad = {
            four: 0,
            six: 0,
            eight: 0,
            ten: 0,
            twelve: 0,
            twenty: 0,
            hundred: 0,
            dropLow: 0,
            dropHigh: 0,
            singleDice: true,
            singleNum: diceSize,
            modifier: this.modifier,
            result: 0,
        };
        switch (diceSize) {
            case 4:
                currLoad.four = diceCount;
            case 6:
                currLoad.six = diceCount;
            case 8:
                currLoad.eight = diceCount;
            case 10:
                currLoad.ten = diceCount;
            case 12:
                currLoad.twelve = diceCount;
            case 20:
                currLoad.twenty = diceCount;
            case 100:
                currLoad.hundred = diceCount;
        }
        if (disadvantage) {
            currLoad.dropHigh = 1;
        }
        if (advantage) {
            currLoad.dropLow = 1;
        }
        this.serveInter.rollDice(currLoad);
    }
}
