import { BoardDrawMode } from './boardDrawMode.ts';
import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { BoardSelectMode } from './boardSelectMode.ts';
import { BoardViewMode } from './boardViewMode.ts';
import { getRequiredElement } from '../dom.ts';
import { getTempStore } from '../tempStoreSingleton.ts';
import { TooltipManager, TooltipMode } from '../tooltip.ts';
import { Selector } from './selector.ts';
import { BoardLayer } from './boardLayer.ts';
import { LayerMenu } from '../rightBar/layerBarMenu.ts';
import { getBoard } from '../uiSingleton.ts';
import { GetObjectReason } from './getObjectReason.ts';
const selector = new Selector();
const tooltipManager = new TooltipManager();
const viewButton = getRequiredElement('viewMenuButton', HTMLButtonElement);
const selectButton = getRequiredElement('selectMenuButton', HTMLButtonElement);
const drawButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const modeMenu = getRequiredElement('modeMenu', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const bottomBar = getRequiredElement('bottomBar', HTMLElement);
const layerMan = new LayerMenu();
const storedLayers: Map<number, BoardLayer> = new Map();

export enum Mode {
    View = 'VIEW',
    Draw = 'DRAW',
    Select = 'SELECT',
}

export { GetObjectReason };

type BoardMode = BoardViewMode | BoardDrawMode | BoardSelectMode;

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
            SELECT: this.selectMan,
        };
        this.buttons = {
            DRAW: drawButton,
            VIEW: viewButton,
            SELECT: selectButton,
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

    // Sets up boxes for the bottom bar.
    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement('bottomBox' + i.toString(), HTMLElement),
            );
            this.boxItems[i].style.left = ((i + 9) % 10) * 60 + 'px';
        }
    }

    // Toggles whether the mode switcher is visible or not.
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

        selectButton.addEventListener('click', () => {
            this.modeSwitch(Mode.Select);
        });

        selectButton.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Mode, 'select');
        });

        selectButton.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        can.addEventListener('mousemove', (event) => {
            getBoard().mouseCoords.x = event.clientX;
            getBoard().mouseCoords.y = event.clientY;
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
            } else if (event.key === 'd' && getTempStore().isGm) {
                this.modeSwitch(Mode.Draw);
            } else if (event.key === 'Control') {
                this.controlClick = true;
            } else if (event.key === 'z' && this.controlClick) {
                getTempStore().undoLast();
            } else if (event.key === 'Escape') {
                selector.deactivate();
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
                    getBoard().leftMouseDown = true;
                } else if (event.button === 1) {
                    getBoard().midMouseDown = true;
                } else if (event.button === 2) {
                    getBoard().rightMouseDown = true;
                    if (storedLayers.has(layerMan.currSelect)) {
                        selector.activate(
                            storedLayers.get(layerMan.currSelect)!,
                        );
                    }
                }
            },
            { capture: true },
        );

        can.addEventListener(
            'mouseup',
            (event) => {
                if (event.button === 0) {
                    getBoard().leftMouseDown = false;
                } else if (event.button === 1) {
                    getBoard().midMouseDown = false;
                } else if (event.button === 2) {
                    getBoard().rightMouseDown = false;
                    selector.complete();
                }
            },
            { capture: true },
        );
    }

    // Switches between the active mode and a new one.
    modeSwitch(newMode: Mode) {
        this.modes[this.currMode].flipListeners(false);
        this.buttons[this.currMode].disabled = false;
        this.currMode = newMode;
        this.modes[this.currMode].flipListeners(true);
        this.buttons[this.currMode].disabled = true;
    }

    // Checks if the user has selected an area of the canvas.
    hasCompleteSelection(): boolean {
        if (selector.selectState > 0) {
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
    getSelectCoords(): Vec2[] {
        if (selector.selectState !== 0) {
            return selector.selectParams;
        }
        return [{ x: 0, y: 0 }];
    }

    // Retrieves the object currently being drawn by the draw mode.
    getObject(reason: GetObjectReason): BoardObject | undefined {
        if (reason === GetObjectReason.Draw) {
            if (selector.active) {
                return selector.getTempObject();
            } else if (this.currMode === Mode.Draw) {
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
    getSelected(): BoardObject[] {
        return this.selectMan.selectedObjects;
    }

    // Clears the list of selected objects.
    clearSelected() {
        this.exitSelected();
    }

    // Enters the select mode, disabling the current mode but leaving it open to be reenabled.
    enterSelected() {
        if (this.currMode === Mode.View && !selector.active) {
            let res = this.viewMan.selectedToken;
            if (res) {
                this.selectMan.flipListeners(true);
                this.selectMan.setSelected([res], true);
            }
            this.viewMan.flipListeners(false);
            return;
        }
        let res: (BoardObject | undefined)[] = getBoard().selectObjects();
        const selected = res.filter((obj) => obj !== undefined);
        if (selected.length !== 0) {
            selector.deactivate();
            if (this.selectMan.active) {
                this.selectMan.addSelected(selected);
                return;
            }
            this.selectMan.flipListeners(true);
            this.selectMan.setSelected(selected, false);
            if (this.currMode === Mode.Draw) {
                this.drawMan.active = false;
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
                this.drawMan.toggleBoxes();
            } else if (this.currMode === Mode.View) {
                this.viewMan.flipListeners(false);
            }
        } else {
            selector.deactivate();
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
            selector.deactivate();
            this.drawMan.toggleBoxes();
        } else if (this.currMode === Mode.View) {
            this.viewMan.flipListeners(true);
        }
    }

    // Checks if the manager should swap into / out of select mode.
    // Does the swap if it can.
    attemptSelectedSwap() {
        if (this.hasCompleteSelection()) {
            this.enterSelected();
        } else if (this.selectMan.active && this.selectMan.exitOnNextStep) {
            this.exitSelected();
        }
    }

    // Performs a single mode management step.
    step() {
        if (this.currMode !== Mode.Select) {
            this.attemptSelectedSwap();
        } else if (this.hasCompleteSelection()) {
            let res: (BoardObject | undefined)[] = getBoard().selectObjects();
            const selected = res.filter((obj) => obj !== undefined);
            if (selected.length !== 0) {
                this.selectMan.addSelected(selected);
            }
            selector.deactivate();
            return;
        }
        if (this.viewMan.measuring) {
            this.viewMan.drawMeasure();
        }
        if (this.selectMan.active) {
            this.selectMan.step();
        }
    }
}
