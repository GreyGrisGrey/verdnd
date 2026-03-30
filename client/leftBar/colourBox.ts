import { ColInst, stringToColInst } from '../../shared/colours.ts';
import { Board } from '../boardCanvas/localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { CoordModes } from '../boardCanvas/localBoard.ts';
import { tempStore } from '../serveInter.ts';
const colourPicker = getRequiredElement('colourPicker', HTMLElement);
const colourBackground = getRequiredElement('colourBackground', HTMLElement);
const colourContainer = getRequiredElement('colourContainer', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const testCol = document.getElementById('testCol')!;
const board = new Board();
const serveInter = new tempStore();

// Class handling the colour selection box.
export class ColourBox {
    savedColours: string[];
    currRGBString: string;
    adjBoxes: HTMLElement[];
    shiftIsPressed: boolean;
    pickColour: boolean;

    constructor() {
        this.savedColours = [
            '#ff0000',
            '#00ff00',
            '#0000ff',
            '#323232',
            '#969696',
            '#ffffff',
        ];
        this.currRGBString = `rgba(${120}, ${120}, ${120}, ${1})`;
        this.adjBoxes = [];
        this.shiftIsPressed = false;
        this.pickColour = false;
        for (const i of [0, 1, 2, 3, 4, 5]) {
            this.adjBoxes.push(getRequiredElement(`col${i + 1}`, HTMLElement));
            this.adjBoxes[i].style.left = `${i * 40 + 10}px`;
            this.adjBoxes[i].style.background = this.savedColours[i].toString();
        }
        this.addEventListeners();
    }

    getCurrColour() {
        return (testCol as any).rgba;
    }

    toggleActive(newActive: boolean) {
        colourContainer.style.visibility = newActive ? 'inherit' : 'hidden';
        colourContainer.style.pointerEvents = newActive ? 'auto' : 'none';
        (testCol as any).opened = newActive;
    }

    // Adds relevant event listeners.
    // Mostly to do with registering changes to the currently selected colour.
    addEventListeners() {
        testCol.addEventListener('change', (evt) => {
            console.log((evt as any).detail.rgba);
        });

        can.addEventListener('mousedown', (event) => {
            if (this.pickColour) {
                const coords = board.determineTile(
                    event.clientX,
                    event.clientY,
                    CoordModes.Center,
                );
                const resObj = board.selectObjects('any', [coords]);
                if (resObj.length > 0) {
                    if (typeof resObj[0].colour === typeof 'asd') {
                        (testCol as any).color = resObj[0].colour;
                    }
                }
                this.pickColour = false;
            }
        });

        colourPicker.addEventListener('click', () => {
            this.pickColour = true;
        });

        colourBackground.addEventListener('click', () => {
            serveInter.sendChangeBackground((testCol as any).hex);
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
                    (testCol as any).color = this.savedColours[i];
                }
            });
        });
    }

    // Changes the saved colour of the indicated adjoining colour box.
    changeSubColour(swapId: number = -1) {
        this.savedColours[swapId] = (testCol as any).rgba;
        this.adjBoxes[swapId].style.background =
            this.savedColours[swapId].toString();
    }
}
