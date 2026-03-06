import { ColInst } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
const colorSquare = getRequiredElement('colourSquare', HTMLElement);

type ColourComponent = 'red' | 'green' | 'blue' | 'alpha';
const colourComponents: ColourComponent[] = ['red', 'green', 'blue', 'alpha'];

const RGBSliders: Record<ColourComponent, HTMLInputElement> = {
    red: getRequiredElement('redColSlide', HTMLInputElement),
    green: getRequiredElement('greenColSlide', HTMLInputElement),
    blue: getRequiredElement('blueColSlide', HTMLInputElement),
    alpha: getRequiredElement('opacColSlide', HTMLInputElement),
};
const RGBTexts: Record<ColourComponent, HTMLInputElement> = {
    red: getRequiredElement('redColText', HTMLInputElement),
    green: getRequiredElement('greenColText', HTMLInputElement),
    blue: getRequiredElement('blueColText', HTMLInputElement),
    alpha: getRequiredElement('opacColText', HTMLInputElement),
};

export class ColourBox {
    savedColours: ColInst[];
    currColour: ColInst;
    currRGBString: string;
    mainBox: HTMLElement;
    adjBoxes: HTMLElement[];
    can: HTMLElement;
    shiftIsPressed: boolean;

    constructor() {
        this.savedColours = [
            new ColInst(255, 0, 0, 100),
            new ColInst(0, 255, 0, 100),
            new ColInst(0, 0, 255, 100),
            new ColInst(50, 50, 50, 100),
            new ColInst(150, 150, 150, 100),
            new ColInst(255, 255, 255, 100),
        ];
        this.currColour = new ColInst(120, 120, 120, 100);
        this.currRGBString = `rgba(${120}, ${120}, ${120}, ${1})`;
        this.mainBox = colorSquare;
        this.adjBoxes = [];
        this.can = colorSquare;
        this.shiftIsPressed = false;
        for (const i of [0, 1, 2, 3, 4, 5]) {
            this.adjBoxes.push(getRequiredElement(`col${i + 1}`, HTMLElement));
            this.adjBoxes[i].style.left = `${i * 40 + 10}px`;
            this.adjBoxes[i].style.background = this.savedColours[i].toString();
        }
        this.addEventListeners();
        this.changeCurrColour();
    }

    addEventListeners() {
        colourComponents.forEach((component) => {
            RGBSliders[component].addEventListener('input', () => {
                const value = parseInt(RGBSliders[component].value, 10);
                if (component === 'red') {
                    this.currColour.setR(value);
                } else if (component === 'green') {
                    this.currColour.setG(value);
                } else if (component === 'blue') {
                    this.currColour.setB(value);
                } else if (component === 'alpha') {
                    this.currColour.setA(value);
                }
                this.changeCurrColour();
            });

            RGBTexts[component].addEventListener('input', () => {
                const value = parseInt(RGBTexts[component].value, 10);
                if (component === 'red') {
                    this.currColour.setR(value);
                } else if (component === 'green') {
                    this.currColour.setG(value);
                } else if (component === 'blue') {
                    this.currColour.setB(value);
                } else if (component === 'alpha') {
                    this.currColour.setA(value);
                }
                this.changeCurrColour();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Shift') {
                this.shiftIsPressed = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.shiftIsPressed = false;
            }
        });

        this.adjBoxes.forEach((box, i) => {
            box.addEventListener('click', () => {
                if (this.shiftIsPressed) {
                    this.changeSubColour(i);
                } else {
                    this.changeCurrColour(true, i);
                }
            });
        });
    }

    changeCurrColour(swap: boolean = false, swapID: number = -1) {
        if (swap) {
            this.currColour = this.savedColours[swapID];
        }
        this.mainBox.style.background = this.currColour.toString();
        colourComponents.forEach((component) => {
            this.matchInput(component);
        });
    }

    matchInput(component: ColourComponent) {
        if (component === 'red') {
            RGBSliders[component].value = this.currColour.red.toString();
            RGBTexts[component].value = this.currColour.red.toString();
        } else if (component === 'green') {
            RGBSliders[component].value = this.currColour.green.toString();
            RGBTexts[component].value = this.currColour.green.toString();
        } else if (component === 'blue') {
            RGBSliders[component].value = this.currColour.blue.toString();
            RGBTexts[component].value = this.currColour.blue.toString();
        } else if (component === 'alpha') {
            RGBSliders[component].value = this.currColour.alpha.toString();
            RGBTexts[component].value = this.currColour.alpha.toString();
        }
    }

    changeSubColour(swapID: number = -1) {
        this.savedColours[swapID] = this.currColour;
        this.adjBoxes[swapID].style.background =
            this.savedColours[swapID].toString();
    }
}
