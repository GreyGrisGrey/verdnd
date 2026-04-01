import { RollResult } from '../../shared/objectEvents.ts';
import { getRequiredElement } from '../dom.ts';
const chatBox = getRequiredElement('chatBox', HTMLElement);

export class ChatBox {
    mainBox: HTMLElement;
    roll: boolean;
    index: number;
    mainText: HTMLElement;

    constructor(isRoll: boolean, index: number) {
        this.index = index;
        this.mainBox = document.createElement('div');
        this.mainBox.style.position = 'absolute';
        this.mainBox.style.top = this.index * 90 + 'px';
        this.mainBox.style.width = '246px';
        this.mainBox.style.height = '90px';
        this.mainBox.style.visibility = 'inherit';

        this.roll = isRoll;
        const newText = document.createElement('p');
        newText.style.position = 'absolute';
        newText.style.width = '226px';
        newText.style.left = '0px';
        newText.style.top = '-10px';
        newText.style.left = '10px';
        newText.style.height = '80px';
        newText.style.overflow = 'scroll';
        newText.style.visibility = 'inherit';
        newText.style.whiteSpace = 'wrap';
        this.mainBox.append(newText);
        chatBox.append(this.mainBox);
        if (
            chatBox.scrollTop +
                Number(
                    chatBox.style.height.slice(
                        0,
                        chatBox.style.height.length - 2,
                    ),
                ) >
            chatBox.scrollHeight - 100
        ) {
            chatBox.scrollBy(0, 900);
        }
        this.mainText = newText;
    }

    updateRoll(dataLine: RollResult, userName: string) {
        if (dataLine.rolls.length === 0) {
            this.mainText.innerText = `${userName} said ${dataLine.result}`;
            return;
        }
        let newString = '(';
        let locTotal = 0;
        for (const roll of dataLine.rolls) {
            newString += `${roll.result} + `;
            if (!roll.exclude) {
                locTotal += roll.result;
            }
        }
        newString = newString.slice(0, newString.length - 3) + ')';
        if (dataLine.result - locTotal > 0) {
            newString += ' +' + (dataLine.result - locTotal).toString();
        } else if (dataLine.result - locTotal < 0) {
            newString += ' ' + (dataLine.result - locTotal).toString();
        }
        this.mainText.innerText =
            `${userName} rolled ${dataLine.rolls.length}d${dataLine.rolls[0].size}\nResult = ${dataLine.result}\n` +
            newString;
    }
}
