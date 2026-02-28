import type { DicePayload } from '../scripts/rightBar/rollBarMenu.ts';

export class StoredDice {
    currIndex: number;
    prevMapping: Map<number, DicePayload>;
    diceLock: boolean;

    constructor() {
        this.currIndex = 0;
        this.prevMapping = new Map();
        this.diceLock = false;
    }

    rollDice(newDice: DicePayload) {
        let result = newDice.modifier;
        if (newDice.singleDice) {
            const mainDice = [newDice.singleNum, 0];
            switch (newDice.singleNum) {
                case 4:
                    mainDice[1] = newDice.four;
                    break;
                case 6:
                    mainDice[1] = newDice.six;
                    break;
                case 8:
                    mainDice[1] = newDice.eight;
                    break;
                case 10:
                    mainDice[1] = newDice.ten;
                    break;
                case 12:
                    mainDice[1] = newDice.twelve;
                    break;
                case 20:
                    mainDice[1] = newDice.twenty;
                    break;
                case 100:
                    mainDice[1] = newDice.hundred;
                    break;
            }
            if (newDice.dropLow + newDice.dropHigh < mainDice[1]) {
                let results = [];
                while (mainDice[1] > 0) {
                    results.push(
                        (Math.ceil(Math.random() * 10000) % mainDice[0]),
                    );
                    mainDice[1]--;
                }
                while (mainDice[1] < 0) {
                    results.push(
                        -(
                            (Math.ceil(Math.random() * 10000) % mainDice[0])
                        ),
                    );
                    mainDice[1]++;
                }
                results = results.sort(function (curr, next) {
                    return next - curr;
                });
                let currIndex = newDice.dropLow;
                while (currIndex < results.length - newDice.dropHigh) {
                    result += results[currIndex];
                    currIndex++;
                }
                newDice.result = result;
                this.recordDice(newDice);
                return result;
            }
        } else {
            //WIP
            this.recordDice(newDice);
            return result;
        }
    }

    async recordDice(newDice: DicePayload) {
        await this.waitDiceLock();
        this.diceLock = true;
        this.prevMapping.set(this.currIndex, newDice);
        this.currIndex = (this.currIndex + 1) % 50;
        this.diceLock = false;
    }

    async waitDiceLock() {
        while (this.diceLock) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }

    getDice() {
        return { start: this.currIndex, map: this.prevMapping };
    }
}
