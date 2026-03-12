import { ColInst, stringToColInst } from '../../shared/colours.ts';
import { Board } from '../boardCanvas/localBoard.ts';
import { getRequiredElement } from '../dom.ts';
const colourSquare = getRequiredElement('colourSquare', HTMLElement);
const colourPicker = getRequiredElement('colourPicker', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);

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

// Class handling the colour selection box.
export class ColourBox {
    savedColours: ColInst[];
    currColour: ColInst;
    currRGBString: string;
    mainBox: HTMLElement;
    adjBoxes: HTMLElement[];
    can: HTMLElement;
    shiftIsPressed: boolean;
    pickColour: boolean;
    board: Board;

    constructor(newBoard: Board) {
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
        this.mainBox = colourSquare;
        this.adjBoxes = [];
        this.can = colourSquare;
        this.shiftIsPressed = false;
        this.pickColour = false;
        this.board = newBoard;
        for (const i of [0, 1, 2, 3, 4, 5]) {
            this.adjBoxes.push(getRequiredElement(`col${i + 1}`, HTMLElement));
            this.adjBoxes[i].style.left = `${i * 40 + 10}px`;
            this.adjBoxes[i].style.background = this.savedColours[i].toString();
        }
        this.addEventListeners();
        this.changeCurrColour();
    }

    // Adds relevant event listeners.
    // Mostly to do with registering changes to the currently selected colour.
    addEventListeners() {
        can.addEventListener('mousedown', (event) => {
            if (this.pickColour) {
                const coords = this.board.determineTile(
                    event.clientX,
                    event.clientY,
                    false,
                );
                const resObj = this.board.selectObjects('any', [coords]);
                if (resObj.length > 0) {
                    if (typeof resObj[0].colour === typeof 'asd') {
                        this.currColour = stringToColInst(
                            resObj[0].colour as any,
                        );
                    } else {
                        this.currColour = resObj[0].colour as any;
                    }
                    this.changeCurrColour();
                }
                this.pickColour = false;
            }
        });

        colourPicker.addEventListener('click', () => {
            this.pickColour = true;
        });

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

    // Changes the currently selected colour for the main box.
    changeCurrColour(swap: boolean = false, swapId: number = -1) {
        if (swap) {
            this.currColour = this.savedColours[swapId];
        }
        this.mainBox.style.background = this.currColour.toString();
        colourComponents.forEach((component) => {
            this.matchInput(component);
        });
    }

    // Matches the value displayed by a colour's corresponding slider input to its corresponding text input.
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

    // Changes the saved colour of the indicated adjoining colour box.
    changeSubColour(swapId: number = -1) {
        this.savedColours[swapId] = this.currColour;
        this.adjBoxes[swapId].style.background =
            this.savedColours[swapId].toString();
    }
}
