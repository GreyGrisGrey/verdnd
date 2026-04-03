import { BoardDrawMode } from './boardDrawMode.ts';
import type { BoardObject } from './boardObject.ts';
import { BoardSelectMode } from './boardSelectMode.ts';
import { BoardViewMode } from './boardViewMode.ts';
import { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { TooltipManager, TooltipMode } from '../tooltip.ts';
const tooltipManager = new TooltipManager();
const serveInter = new TempStore();
const viewButton = getRequiredElement('viewMenuButton', HTMLButtonElement);
const drawButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const modeMenu = getRequiredElement('modeMenu', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const bottomBar = getRequiredElement('bottomBar', HTMLElement);
const board = new Board();

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
    currMode: Mode;
    viewMan: BoardViewMode;
    drawMan: BoardDrawMode;
    selectMan: BoardSelectMode;
    modes: Record<Mode, BoardMode>;
    selectClick: boolean;
    buttons: Record<Mode, HTMLButtonElement>;
    boxItems: HTMLElement[];
    controlClick: boolean;

    constructor() {
        this.sendLaser = true;
        this.currMode = Mode.View;
        this.viewMan = new BoardViewMode();
        this.drawMan = new BoardDrawMode();
        this.selectMan = new BoardSelectMode();
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
        bottomBar.style.visibility = 'visible';
        bottomBar.style.pointerEvents = 'auto';
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement('bottomBox' + i.toString(), HTMLElement),
            );
            this.boxItems[i].style.left = ((i + 9) % 10) * 60 + 'px';
        }
    }

    toggleModeSwitcher(active: boolean) {
        modeMenu.style.visibility = active ? 'visible' : 'hidden';
        this.modeSwitch(Mode.View);
    }

    // Adds event listeners for all modes, as well as some of its own.
    addEventListeners() {
        viewButton.addEventListener('click', () => {
            this.modeSwitch(Mode.View);
        });

        viewButton.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Mode, 'view');
        });

        viewButton.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        drawButton.addEventListener('click', () => {
            this.modeSwitch(Mode.Draw);
        });

        drawButton.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Mode, 'draw');
        });

        drawButton.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        can.addEventListener('mousemove', (event) => {
            board.mouseCoords.x = event.clientX;
            board.mouseCoords.y = event.clientY;
        });

        document.addEventListener('keydown', (event) => {
            if (
                document.activeElement &&
                document.activeElement.tagName === 'INPUT'
            ) {
                return;
            }
            if (event.key === 'a') {
                this.modeSwitch(Mode.View);
            } else if (event.key === 'd' && serveInter.isGm) {
                this.modeSwitch(Mode.Draw);
            } else if (event.key === 'Control') {
                this.controlClick = true;
            } else if (event.key === 'z' && this.controlClick) {
                serveInter.undoLast();
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
                    board.leftMouseDown = true;
                } else if (event.button === 1) {
                    board.midMouseDown = true;
                } else if (event.button === 2) {
                    board.rightMouseDown = true;
                }
            },
            { capture: true },
        );

        can.addEventListener(
            'mouseup',
            (event) => {
                if (event.button === 0) {
                    board.leftMouseDown = false;
                } else if (event.button === 1) {
                    board.midMouseDown = false;
                } else if (event.button === 2) {
                    board.rightMouseDown = false;
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
        } else if (
            this.currMode === Mode.View &&
            this.viewMan.completeSelectCheck
        ) {
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
        this.drawMan.clearObject();
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
        if (this.currMode === Mode.View) {
            let res = this.viewMan.selectedToken;
            if (res) {
                this.selectMan.flipListeners(true);
                this.selectMan.setSelected([res]);
            }
            this.viewMan.flipListeners(false);
            return;
        }
        let res: (BoardObject | undefined)[] = board.selectObjects();
        const selected = res.filter((obj) => obj !== undefined);
        if (selected.length !== 0) {
            this.selectMan.flipListeners(true);
            this.selectMan.setSelected(selected);
            if (this.currMode === Mode.Draw) {
                this.drawMan.active = false;
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
                this.drawMan.toggleBoxes();
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
            this.drawMan.toggleBoxes();
        } else if (this.currMode === Mode.View) {
            this.viewMan.flipListeners(true);
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
        if (this.selectMan.active) {
            this.selectMan.step();
        }
    }
}
