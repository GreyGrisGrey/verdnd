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
        this.mainBox.style.border = 'solid gray';

        this.roll = isRoll;
        const newText = document.createElement('p');
        newText.style.position = 'absolute';
        newText.style.width = '226px';
        newText.style.left = '0px';
        newText.style.top = '-10px';
        newText.style.left = '10px';
        newText.style.height = '80px';
        newText.style.overflow = 'auto';
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

    // Updates the chatbox to a new roll.
    // Being as this is only called once it's dubious that it's not part of the constructor but whatever.
    updateRoll(dataLine: RollResult, userName: string) {
        if (dataLine.rolls.length === 0) {
            this.mainText.innerText = `${userName} said ${dataLine.result}`;
            return;
        }
        let locTotal = 0;
        const results = [];
        for (const roll of dataLine.rolls) {
            if (!roll.exclude) {
                locTotal += roll.result;
            }
            results.push([roll.size, roll.result]);
        }
        results.sort((a, b) => a[0] - b[0]);

        let newString = '(';
        let topString = `${userName} rolled `;
        let curr = results.length > 0 ? results[0][0] : 0;
        let count = 0;
        for (const val of results) {
            if (val[0] !== curr) {
                newString += ') + (';
                topString += `${count}d${curr} + `;
                curr = val[0];
                count = 0;
            } else if (newString.length > 1) {
                newString += ' + ';
            }
            newString += `${val[1]}`;
            count++;
        }
        topString += `${count}d${curr}`;
        newString += ')';
        if (dataLine.result - locTotal !== 0) {
            this.mainText.innerText =
                `${topString} + ${(dataLine.result - locTotal).toString()}` +
                `\nResult = ${dataLine.result}\n` +
                `${newString} + ${(dataLine.result - locTotal).toString()}`;
        } else {
            this.mainText.innerText =
                `${topString}` +
                `\nResult = ${dataLine.result}\n` +
                `${newString}`;
        }
    }
}
