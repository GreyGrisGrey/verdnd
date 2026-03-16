import { BoardDrawMode } from './boardDrawMode.ts';
import type { BoardObject } from './boardObject.ts';
import { BoardSelectMode } from './boardSelectMode.ts';
import { BoardViewMode } from './boardViewMode.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
const viewButton = getRequiredElement('viewMenuButton', HTMLButtonElement);
const drawButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const bottomBar = getRequiredElement('bottomBar', HTMLElement);

export enum Mode {
    View = 'VIEW',
    Draw = 'DRAW',
}

export enum GetObjectReason {
    Draw = 'DRAW',
    Create = 'CREATE',
}

type BoardMode = BoardViewMode | BoardDrawMode;

// Class handling the draw/token/view modes.
// Also handles behaviour when a selection of board objects has been made. This may be split off later.
export class ModeManager {
    sendLaser: boolean;
    board: Board;
    currMode: Mode;
    viewMan: BoardViewMode;
    drawMan: BoardDrawMode;
    selectMan: BoardSelectMode;
    modes: Record<Mode, BoardMode>;
    selectClick: boolean;
    buttons: Record<Mode, HTMLButtonElement>;
    boxItems: HTMLElement[];
    controlClick: boolean;

    constructor(parentBoard: Board) {
        this.sendLaser = true;
        this.board = parentBoard;
        this.currMode = Mode.View;
        this.viewMan = new BoardViewMode(parentBoard);
        this.drawMan = new BoardDrawMode(parentBoard);
        this.selectMan = new BoardSelectMode(parentBoard);
        this.modes = {
            DRAW: this.drawMan,
            VIEW: this.viewMan,
        };
        this.buttons = {
            DRAW: drawButton,
            VIEW: viewButton,
        };
        this.selectClick = false;
        this.boxItems = [];
        this.controlClick = false;

        this.setUpBoxes();
        this.addEventListeners();
        this.modeSwitch(Mode.View);
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement('bottomBox' + i.toString(), HTMLElement),
            );
            this.boxItems[i].style.left = ((i + 9) % 10) * 60 + 'px';
        }
    }

    toggleBoxesVis() {
        bottomBar.style.visibility =
            this.selectMan.active ||
            this.currMode === Mode.Draw ||
            this.currMode === Mode.View
                ? 'visible'
                : 'hidden';
        bottomBar.style.pointerEvents =
            this.selectMan.active ||
            this.currMode === Mode.Draw ||
            this.currMode === Mode.View
                ? 'auto'
                : 'none';
        this.drawMan.toggleBoxes();
        this.viewMan.toggleBoxes();
    }

    // Adds event listeners for all modes, as well as some of its own.
    addEventListeners() {
        viewButton.addEventListener('click', () => {
            this.modeSwitch(Mode.View);
        });

        drawButton.addEventListener('click', () => {
            this.modeSwitch(Mode.Draw);
        });

        can.addEventListener('mousemove', (event) => {
            this.board.mouseCoords.x = event.clientX;
            this.board.mouseCoords.y = event.clientY;
        });

        can.addEventListener('keydown', (event) => {
            if (event.key === 'a') {
                this.modeSwitch(Mode.View);
            } else if (event.key === 'd') {
                this.modeSwitch(Mode.Draw);
            } else if (event.key === 'Control') {
                this.controlClick = true;
            } else if (event.key === 'z' && this.controlClick) {
                this.board.serveInter.undoLast();
            }
        });

        can.addEventListener('keyup', (event) => {
            if (event.key === 'Control') {
                this.controlClick = false;
            }
        });

        can.addEventListener(
            'mousedown',
            (event) => {
                if (event.button === 0) {
                    this.board.leftMouseDown = true;
                } else if (event.button === 2) {
                    this.board.rightMouseDown = true;
                }
            },
            { capture: true },
        );

        can.addEventListener(
            'mouseup',
            (event) => {
                if (event.button === 0) {
                    this.board.leftMouseDown = false;
                } else if (event.button === 2) {
                    this.board.rightMouseDown = false;
                }
            },
            { capture: true },
        );
    }

    modeSwitch(newMode: Mode) {
        if (!this.selectMan.active) {
            this.modes[this.currMode].flipListeners(false);
            this.buttons[this.currMode].disabled = false;
            this.currMode = newMode;
            this.modes[this.currMode].flipListeners(true);
            this.buttons[this.currMode].disabled = true;
        }
    }

    // Checks if the user has selected an area of the canvas.
    hasCompleteSelection() {
        if (this.currMode === Mode.Draw && this.drawMan.selectState > 0) {
            return true;
        }
        return false;
    }

    // Retrieves the coordinates corresponding to the currently selected area of the canvas.
    getSelectCoords() {
        if (this.currMode === Mode.Draw && this.drawMan.selectState !== 0) {
            return this.drawMan.params;
        }
        return [{ x: 0, y: 0 }];
    }

    // Retrieves the object currently being drawn by the draw mode.
    getObject(reason: GetObjectReason) {
        if (reason === GetObjectReason.Draw) {
            if (this.currMode === Mode.Draw) {
                return this.drawMan.getTempObject();
            }
        }
        return undefined;
    }

    // Clears the temporarily held complete object in the draw manager.
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

    // Enters the select mode, disabling the current mode but leaving it open to be reenabled.
    enterSelected() {
        let res: (BoardObject | undefined)[] = this.board.selectObjects();
        const selected = res.filter((obj) => obj !== undefined);
        if (selected.length !== 0) {
            this.selectMan.flipListeners(true);
            this.selectMan.setSelected(selected);
            if (this.currMode === Mode.Draw) {
                this.drawMan.active = false;
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
            }
        } else {
            if (this.currMode === Mode.Draw) {
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
            }
        }
    }

    // Exits the select mode.
    exitSelected() {
        this.selectMan.flipListeners(false);
        if (this.currMode === Mode.Draw) {
            this.drawMan.active = true;
            this.drawMan.selectMode = false;
        }
    }

    // Checks if the manager should swap into / out of select mode.
    // Does the swap if it can.
    attemptSelectedSwap() {
        if (!this.selectMan.active && this.hasCompleteSelection()) {
            this.enterSelected();
        } else if (this.selectMan.active && this.selectMan.exitOnNextStep) {
            this.exitSelected();
        }
    }

    // Performs a single mode management step.
    step() {
        this.attemptSelectedSwap();
        if (this.viewMan.measuring) {
            this.viewMan.drawMeasure();
        }
        this.toggleBoxesVis();
    }
}
