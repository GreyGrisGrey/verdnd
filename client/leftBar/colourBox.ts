import { Board } from '../boardCanvas/localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { CoordModes } from '../boardCanvas/localBoard.ts';
import { TempStore } from '../serveInter.ts';
import { TooltipManager, TooltipMode } from '../tooltip.ts';
import '../../toolcool-color-picker.min.js';
const tooltipManager = new TooltipManager();
const colourPicker = getRequiredElement('colourPicker', HTMLButtonElement);
const colourBackground = getRequiredElement('colourBackground', HTMLElement);
const colourContainer = getRequiredElement('colourContainer', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const showColourButton = document.getElementById('showColour')!;
const board = new Board();
const serveInter = new TempStore();

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
            '#cc00cc',
        ];
        this.currRGBString = `rgba(${120}, ${120}, ${120}, ${1})`;
        this.adjBoxes = [];
        this.shiftIsPressed = false;
        this.pickColour = false;
        colourPicker.disabled = false;
        for (const i of [0, 1, 2, 3, 4, 5, 6]) {
            this.adjBoxes.push(getRequiredElement(`col${i + 1}`, HTMLElement));
            this.adjBoxes[i].style.left = `${i * 32.5 + 5}px`;
            this.adjBoxes[i].style.background = this.savedColours[i];
        }
        this.addEventListeners();
    }

    // Gets the current colour.
    getCurrColour(): string {
        return (showColourButton as any).rgba;
    }

    // Toggles if the colour selector is active.
    toggleActive(newActive: boolean) {
        colourContainer.style.visibility = newActive ? 'inherit' : 'hidden';
        colourContainer.style.pointerEvents = newActive ? 'auto' : 'none';
        showColourButton.style.backgroundColor = newActive
            ? 'rgba(50, 50, 50, 1)'
            : 'rgba(30, 30, 30, 1)';
        (showColourButton as any).disabled = newActive;
        (showColourButton as any).toggleButton(newActive);
    }

    // Adds relevant event listeners.
    // Mostly to do with registering changes to the currently selected colour.
    addEventListeners() {
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
                        (showColourButton as any).color = resObj[0].colour;
                    }
                }
                this.pickColour = false;
                colourPicker.disabled = false;
            }
        });

        colourPicker.addEventListener('click', () => {
            this.pickColour = true;
            colourPicker.disabled = true;
        });

        colourPicker.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Left, 'pickCol');
        });

        colourPicker.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        colourBackground.addEventListener('click', () => {
            serveInter.sendChangeBackground((showColourButton as any).hex);
        });

        colourBackground.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Left, 'changeBG');
        });

        colourBackground.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Shift') {
                this.shiftIsPressed = true;
            } else if (event.key === 'm') {
                this.pickColour = true;
                colourPicker.disabled = true;
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
                    (showColourButton as any).color = this.savedColours[i];
                    (showColourButton as any).outsideColorChange();
                }
            });
        });
    }

    // Changes the saved colour of the indicated adjoining colour box.
    changeSubColour(swapId: number = -1) {
        this.savedColours[swapId] = (showColourButton as any).rgba;
        this.adjBoxes[swapId].style.background = this.savedColours[swapId];
    }
}
