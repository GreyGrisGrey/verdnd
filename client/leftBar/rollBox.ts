import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
const serveInter = new TempStore();
const rollContainer = getRequiredElement('rollContainer', HTMLElement);

export class RollBox {
    modBox: HTMLElement;
    modifier: string;
    constructor() {
        this.modifier = '0';
        this.modBox = rollContainer;
        this.setRollElements();
    }

    toggleActive(newActive: boolean) {
        rollContainer.style.visibility = newActive ? 'inherit' : 'hidden';
        rollContainer.style.pointerEvents = newActive ? 'auto' : 'none';
    }

    setRollElements() {
        let count = 0;
        for (const i of [3, 4, 6, 8, 10, 12, 20, 100, 101]) {
            const newBox = document.createElement('div');
            rollContainer.append(newBox);
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
                        Math.abs(Number(setCount.value)) > 100
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
                rollAdv.value = 'Roll Adv';
                rollDis.value = 'Roll Disadv';
                newBox.append(rollAdv);
                newBox.append(rollDis);

                rollAdv.style.position = 'absolute';
                rollAdv.style.width = '80px';
                rollAdv.style.height = '20px';
                rollAdv.style.left = '0px';
                rollAdv.style.top = '3px';

                rollDis.style.position = 'absolute';
                rollDis.style.width = '100px';
                rollDis.style.height = '20px';
                rollDis.style.left = '90px';
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

    constructPayload(
        diceSize: number,
        diceCount: number,
        advantage: boolean,
        disadvantage: boolean,
    ) {
        if (
            Number.isNaN(Number(this.modifier)) ||
            Math.abs(Number(this.modifier)) > 10000
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
        serveInter.rollDice(currLoad);
    }
}
