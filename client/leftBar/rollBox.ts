import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { RollElement } from './rollElement.ts';
import { DiceIndividual } from '../../shared/objectEvents.ts';
const serveInter = new TempStore();
const rollContainer = getRequiredElement('rollContainer', HTMLElement);
const diceContainer = getRequiredElement('diceContainer', HTMLElement);
const presetContainer = getRequiredElement('presetContainer', HTMLElement);
const finContainer = getRequiredElement('finalRollContainer', HTMLElement);
const rollButton = getRequiredElement('rollButton', HTMLButtonElement);
const advButton = getRequiredElement('defaultAdv', HTMLButtonElement);
const disButton = getRequiredElement('defaultDisadv', HTMLButtonElement);

export class RollBox {
    modBox: HTMLElement;
    modifier: string;
    rollElements: RollElement[];
    constructor() {
        this.modifier = '0';
        this.modBox = rollContainer;
        this.rollElements = [];
        this.setRollElements();
        this.addEventListeners();
    }

    addEventListeners() {
        rollButton.addEventListener('click', () => {
            const toRoll: DiceIndividual[] = [];
            const toSend = {
                toRoll: toRoll,
                modifier: 0,
                result: 0,
            };
            for (const obj of this.rollElements) {
                if (obj.size === 0) {
                    toSend.modifier = obj.mainTab.val;
                } else {
                    toRoll.push({
                        diceSize: obj.size,
                        diceCount: obj.mainTab.val,
                        dropLow: 0,
                        dropHigh: 0,
                    });
                }
            }
            serveInter.rollNewDice(toSend);
        });

        advButton.addEventListener('click', () => {
            const toRoll: DiceIndividual[] = [
                {
                    diceSize: 20,
                    diceCount: 2,
                    dropLow: 1,
                    dropHigh: 0,
                },
            ];
            const toSend = {
                toRoll: toRoll,
                modifier: 0,
                result: 0,
            };
            for (const obj of this.rollElements) {
                if (obj.size === 0) {
                    toSend.modifier = obj.mainTab.val;
                }
            }
            serveInter.rollNewDice(toSend);
        });

        disButton.addEventListener('click', () => {
            const toRoll: DiceIndividual[] = [
                {
                    diceSize: 20,
                    diceCount: 2,
                    dropLow: 0,
                    dropHigh: 1,
                },
            ];
            const toSend = {
                toRoll: toRoll,
                modifier: 0,
                result: 0,
            };
            for (const obj of this.rollElements) {
                if (obj.size === 0) {
                    toSend.modifier = obj.mainTab.val;
                }
            }
            serveInter.rollNewDice(toSend);
        });
    }

    // Toggles active.
    toggleActive(newActive: boolean) {
        rollContainer.style.visibility = newActive ? 'inherit' : 'hidden';
        rollContainer.style.pointerEvents = newActive ? 'auto' : 'none';
    }

    setRollElements() {
        this.rollElements.push(new RollElement(4));
        this.rollElements.push(new RollElement(6));
        this.rollElements.push(new RollElement(8));
        this.rollElements.push(new RollElement(10));
        this.rollElements.push(new RollElement(12));
        this.rollElements.push(new RollElement(20));
        this.rollElements.push(new RollElement(100));
        this.rollElements.push(new RollElement(0));
    }
}
