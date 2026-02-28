import { BoardDrawMode } from './boardDrawMode.ts';
import type { BoardObject } from './boardObject.ts';
import { Shape } from '../objectEvents.ts';
import { BoardSelectMode } from './boardSelectMode.ts';
import { BoardTokenMode } from './boardTokenMode.ts';
import { BoardViewMode } from './boardViewMode.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';

const modeParagraph = getRequiredElement('modeParagraph', HTMLElement);
const viewButton = getRequiredElement('viewMenuButton', HTMLButtonElement);
const tokenButton = getRequiredElement('tokenMenuButton', HTMLButtonElement);
const drawButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const can = getRequiredElement('board', HTMLCanvasElement);

export enum Mode {
    View = 'VIEW',
    Draw = 'DRAW',
    Token = 'TOKEN',
}

export enum GetObjectReason {
    Draw = 'DRAW',
    Create = 'CREATE',
}

// Class handling the draw/token/view modes.
// Also handles behaviour when a selection of board objects has been made. This may be split off.
export class ModeManager {
    board: Board;
    currMode: Mode;
    viewMan: BoardViewMode;
    tokenMan: BoardTokenMode;
    drawMan: BoardDrawMode;
    selectMan: BoardSelectMode;
    selectClick: boolean;
    selectInstruct: HTMLElement

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.currMode = Mode.View;
        this.viewMan = new BoardViewMode(parentBoard);
        this.tokenMan = new BoardTokenMode(parentBoard);
        this.drawMan = new BoardDrawMode(parentBoard);
        this.selectMan = new BoardSelectMode(parentBoard);
        this.selectInstruct = document.getElementById('selectInstruct')!
        this.selectClick = false;
        this.addEventListeners();
        this.modifyText(this.viewMan);
        this.viewMan.flipListeners(true);
        this.selectInstruct.style.visibility = 'hidden';
    }

    // Adds event listeners for all modes, as well as some of its own.
    addEventListeners() {
        viewButton.addEventListener('click', () => {
            this.currMode = Mode.View;
            this.viewMan.flipListeners(true);
            this.tokenMan.flipListeners(false);
            this.drawMan.flipListeners(false);
            this.selectMan.flipListeners(false);
            this.modifyText(this.viewMan);
            this.selectInstruct.style.visibility = 'hidden';
        });

        tokenButton.addEventListener('click', () => {
            this.currMode = Mode.Token;
            this.viewMan.flipListeners(false);
            this.tokenMan.flipListeners(true);
            this.drawMan.flipListeners(false);
            this.selectMan.flipListeners(false);
            this.modifyText(this.tokenMan);
            this.selectInstruct.style.visibility = 'visible';
        });

        drawButton.addEventListener('click', () => {
            this.currMode = Mode.Draw;
            this.viewMan.flipListeners(false);
            this.tokenMan.flipListeners(false);
            this.drawMan.flipListeners(true);
            this.selectMan.flipListeners(false);
            this.modifyText(this.drawMan);
            this.selectInstruct.style.visibility = 'visible';
        });

        can.addEventListener('mousemove', (event) => {
            this.board.mouseCoords.x = event.clientX;
            this.board.mouseCoords.y = event.clientY;
        });

        can.addEventListener(
            'mousedown',
            () => {
                this.board.leftMouseDown = true;
            },
            { capture: true },
        );

        can.addEventListener(
            'mouseup',
            () => {
                this.board.leftMouseDown = false;
            },
            { capture: true },
        );
    }

    // Switches the information bar's text to match the current mode.
    modifyText(
        selectMode:
            | BoardSelectMode
            | BoardViewMode
            | BoardTokenMode
            | BoardDrawMode,
    ) {
        modeParagraph.innerText = selectMode.getText();
    }

    // Checks if the user has selected an area of the canvas.
    hasCompleteSelection() {
        if (this.currMode === Mode.Draw && this.drawMan.selectState > 0) {
            return true;
        } else if (
            this.currMode === Mode.Token &&
            this.tokenMan.completeSelectCheck
        ) {
            return true;
        }
        return false;
    }

    // Retrieves the coordinates corresponding to the currently selected area of the canvas.
    getSelectCoords() {
        if (this.currMode === Mode.Draw && this.drawMan.selectState !== 0) {
            return this.drawMan.params;
        } else if (
            this.currMode === Mode.Token &&
            this.tokenMan.completeSelectCheck
        ) {
            return this.tokenMan.params;
        }
        return [{ x: 0, y: 0 }];
    }

    // Retrieves the object currently being drawn by the draw mode.
    getObject(reason: GetObjectReason) {
        if (reason === GetObjectReason.Draw) {
            if (this.currMode === Mode.Draw) {
                return this.drawMan.getTempObject();
            } else if (this.currMode === Mode.Token) {
                return this.tokenMan.getTempObject();
            }
        }
        return undefined;
    }

    clearTemp() {
        if (this.currMode === Mode.Draw) {
            this.drawMan.clearObject();
        }
    }

    // Returns all board objects that are currently selected.
    getSelected() {
        return this.selectMan.selectedObjects;
    }

    // Clears the list of selected objects.
    clearSelected() {
        this.exitSelected();
    }

    enterSelected() {
        let res: (BoardObject | undefined)[] = this.board.selectObjects();
        if (this.currMode === Mode.Token && this.tokenMan.params.length === 0) {
            res = [this.tokenMan.currHover];
            this.tokenMan.currHover = undefined;
        } else if (this.currMode === Mode.Token) {
            res = this.board.selectObjects(Shape.Token);
        }
        const selected = res.filter((obj) => obj !== undefined);
        if (selected.length !== 0) {
            this.selectMan.flipListeners(true);
            this.selectMan.setSelected(selected);
            if (this.currMode === Mode.Draw) {
                this.drawMan.active = false;
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
            } else if (this.currMode === Mode.Token) {
                this.tokenMan.active = false;
                this.tokenMan.completeSelectCheck = false;
                this.tokenMan.params = [];
            }
        } else {
            if (this.currMode === Mode.Draw) {
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
            } else if (this.currMode === Mode.Token) {
                this.tokenMan.completeSelectCheck = false;
                this.tokenMan.params = [];
            }
        }
    }

    exitSelected() {
        this.selectMan.flipListeners(false);
        if (this.currMode === Mode.Draw) {
            this.drawMan.active = true;
        } else if (this.currMode === Mode.Token) {
            this.tokenMan.active = true;
        }
    }

    attemptSelectedSwap() {
        if (!this.selectMan.active && this.hasCompleteSelection()) {
            this.enterSelected();
        } else if (this.selectMan.active && this.selectMan.exitOnNextStep) {
            this.exitSelected();
        }
    }

    step(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        this.attemptSelectedSwap();
        if (this.tokenMan.active) {
            this.tokenMan.tryDrawLabel(ctx, squareSize, offset);
            this.tokenMan.getNewHover();
        }
        if (this.selectMan.active) {
            this.selectMan.recolour();
        }
    }
}
