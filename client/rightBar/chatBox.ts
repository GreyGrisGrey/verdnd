import { RollResult } from '../../shared/objectEvents.ts';
import { getRequiredElement } from '../dom.ts';
const chatBox = getRequiredElement('chatBox', HTMLElement);

export class ChatBox {
    mainBox: HTMLElement;
    roll: boolean;
    index: number;
    textA: HTMLElement;
    textB: HTMLElement;
    textC: HTMLElement;

    constructor(isRoll: boolean, index: number) {
        this.index = index;
        this.mainBox = document.createElement('div');
        this.mainBox.style.margin = '0px';
        if (index !== 0) {
            this.mainBox.style.marginTop = '10px';
        }
        this.mainBox.style.position = 'relative';
        this.mainBox.style.width = '230px';
        this.mainBox.style.height = '90px';
        this.mainBox.style.visibility = 'inherit';
        this.mainBox.style.backgroundColor = 'rgba(50, 50, 50, 1)';
        this.mainBox.style.overflow = 'auto';
        this.mainBox.style.padding = '10px';
        this.mainBox.style.borderRadius = '7px';
        this.mainBox.style.boxSizing = 'border-box';

        this.roll = isRoll;

        this.textA = document.createElement('p');
        this.textB = document.createElement('p');
        this.textC = document.createElement('p');

        this.textA.style.width = '210px';
        this.textA.style.overflow = 'auto';
        this.textA.style.visibility = 'inherit';
        this.textA.style.whiteSpace = 'wrap';
        this.textA.style.margin = '0px';
        this.textA.style.padding = '0px';

        this.textB.style.width = '210px';
        this.textB.style.overflow = 'auto';
        this.textB.style.visibility = 'inherit';
        this.textB.style.whiteSpace = 'wrap';
        this.textB.style.margin = '0px';
        this.textB.style.padding = '0px';

        this.textC.style.width = '210px';
        this.textC.style.overflow = 'auto';
        this.textC.style.visibility = 'inherit';
        this.textC.style.whiteSpace = 'wrap';
        this.textC.style.margin = '0px';
        this.textC.style.padding = '0px';
        this.mainBox.append(this.textA);
        this.mainBox.append(this.textB);
        this.mainBox.append(this.textC);
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
    }

    // Updates the chatbox to a new roll.
    // Being as this is only called once it's dubious that it's not part of the constructor but whatever.
    updateRoll(dataLine: RollResult, userName: string) {
        if (dataLine.rolls.length === 0) {
            this.textA.innerText = `${userName} said ${dataLine.result}`;
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
            this.textA.innerText = `${topString} + ${(dataLine.result - locTotal).toString()}`;
            this.textB.innerText = `Result = ${dataLine.result}`;
            this.textC.innerText = `${newString} + ${(dataLine.result - locTotal).toString()}`;
        } else {
            this.textA.innerText = `${topString}`;
            this.textB.innerText = `Result = ${dataLine.result}`;
            this.textC.innerText = `${newString}`;
        }
    }
}
