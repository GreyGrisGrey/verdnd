import { getRequiredElement } from '../dom.ts';
const diceContainer = getRequiredElement('diceContainer', HTMLElement);

export class RollElement {
    val: number;
    size: number;
    mainTab: RollTab;
    constructor(newOff: number) {
        this.size = newOff;
        const newBox = document.createElement('div');
        diceContainer.append(newBox);
        newBox.style.position = 'relative';
        newBox.style.width = '120px';
        newBox.style.height = `${25}px`;
        newBox.style.marginBottom = '3px';
        newBox.style.background = 'rgba(50, 50, 50, 1)';
        newBox.style.borderRadius = '5px';

        this.mainTab = new RollTab(newBox, 0, this.size);
        this.val = 0;
    }
}

class RollTab {
    val: number;
    constructor(newBox: HTMLElement, count: number, size: number) {
        this.setUpTest(newBox, count, size);
        this.val = 0;
    }

    setUpTest(newBox: HTMLElement, count: number, size: number) {
        const newText = document.createElement('p');
        const setCount = document.createElement('input');
        const plus = document.createElement('input');
        const minus = document.createElement('input');

        plus.type = 'button';
        minus.type = 'button';

        newBox.append(newText);
        newBox.append(setCount);
        newBox.append(plus);
        newBox.append(minus);

        newText.style.position = 'absolute';
        newText.style.width = '30px';
        newText.style.height = '20px';
        newText.style.top = `${count * 30 - 11}px`;
        newText.style.left = '5px';
        newText.innerText = size === 0 ? 'mod' : `d${size}`;
        newText.style.textAlign = 'center';

        setCount.style.position = 'absolute';
        setCount.style.width = '25px';
        setCount.style.height = '15px';
        setCount.style.top = `${count * 30 + 5}px`;
        setCount.style.left = `${59}px`;
        setCount.style.textAlign = 'center';
        setCount.value = '0';

        plus.style.position = 'absolute';
        plus.style.width = '20px';
        plus.style.height = '20px';
        plus.value = `+`;
        plus.style.left = `${90}px`;
        plus.style.top = `${count * 30 + 5}px`;

        minus.style.position = 'absolute';
        minus.style.width = '20px';
        minus.style.height = '20px';
        minus.value = `-`;
        minus.style.left = `${39}px`;
        minus.style.top = `${count * 30 + 5}px`;

        plus.addEventListener('click', () => {
            this.val++;
            setCount.value = this.val.toString();
        });

        minus.addEventListener('click', () => {
            this.val--;
            setCount.value = this.val.toString();
        });

        setCount.addEventListener('change', () => {
            if (!this.validateVal(setCount.value)) {
                setCount.value = '0';
            } else {
                this.limitVal();
                setCount.value = this.val.toString();
            }
        });
    }

    validateVal(newInput: string) {
        if (Number.isNaN(Number(newInput))) {
            this.val = 0;
            return false;
        } else {
            this.val = Number(newInput);
            return true;
        }
    }

    limitVal() {
        if (this.val >= 100) {
            this.val = 99;
        }
        if (this.val <= -100) {
            this.val = -99;
        }
    }
}
