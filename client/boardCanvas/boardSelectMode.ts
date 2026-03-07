import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { Action, Entity, Shape } from '../objectEvents.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

// Activates following a completed selection from draw mode or token mode.
export class BoardSelectMode {
    board: Board;
    active: boolean;
    exitOnNextStep: boolean;
    selectedObjects: BoardObject[];
    selectClick: boolean;
    thirdOffset: Vec2;
    currColour: string;
    boxItems: HTMLButtonElement[];

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.exitOnNextStep = false;
        this.selectedObjects = [];
        this.selectClick = false;
        this.thirdOffset = { x: 0, y: 0 };
        this.currColour = 'none';
        this.boxItems = [];
        this.setUpBoxes();

        this.addEventListeners();
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomSelectBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            if (i > 3 || i === 0) {
                this.boxItems[i].disabled = true;
            }
            this.boxItems[i].addEventListener('click', () => {
                this.handleSwitchEvent(i.toString());
            });
        }
    }

    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
        }
    }

    handleSwitchEvent(key: string) {
        if (key === 'Escape' || key === '1') {
            this.exitOnNextStep = true;
        } else if (key === 'Backspace' || key === '2') {
            const idList: number[] = [];
            for (const obj of this.selectedObjects) {
                idList.push(obj.objectId);
            }
            this.board.serveInter.destroyObjects(idList);
            this.exitOnNextStep = true;
        } else if (key === '3') {
            this.recolour();
        }
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        for (const obj of this.selectedObjects) {
            obj.setSelected(false);
        }
        this.active = setOn;
        this.selectedObjects = [];
        this.exitOnNextStep = false;
        this.currColour = colourSquare.style.background;
        this.selectClick = this.board.leftMouseDown;
        this.thirdOffset = { x: 0, y: 0 };
        this.toggleBoxes();
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.active) {
                this.handleSwitchEvent(event.key);
            }
        });

        can.addEventListener('mousemove', (event) => {
            if (this.active && this.selectClick) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                if (!this.board.rightMouseDown) {
                    this.thirdOffset.x -= change.x;
                    this.thirdOffset.y -= change.y;
                }
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                const point = this.board.determineTile(
                    event.clientX,
                    event.clientY,
                    false,
                );
                for (const candidate of this.selectedObjects) {
                    if (
                        'isPointInside' in candidate &&
                        candidate.isPointInside(point)
                    ) {
                        this.selectClick = true;
                    }
                }
            }
        });

        can.addEventListener('mouseup', (event) => {
            if (this.active && this.selectClick && event.button === 0) {
                this.moveObjects();
                this.selectClick = false;
                if (
                    this.selectedObjects.length === 1 &&
                    this.selectedObjects[0].shape === Shape.Token
                ) {
                    this.exitOnNextStep = true;
                }
            }
        });
    }

    // Moves each selected object individually.
    moveObjects() {
        const point = this.board.determineTile(
            this.board.originCoords.x + this.thirdOffset.x,
            this.board.originCoords.y + this.thirdOffset.y,
            true,
        );
        const moveList = [];
        for (const obj of this.selectedObjects) {
            moveList.push({
                entity: Entity.Object,
                action: Action.Move,
                objectId: obj.objectId,
                x: point.x,
                y: point.y,
            });
            obj.move(point.x, point.y);
        }
        this.board.serveInter.moveObjects(moveList as any);
        this.thirdOffset.x = 0;
        this.thirdOffset.y = 0;
    }

    // Recolours each selected object individually.
    recolour() {
        if (this.currColour !== colourSquare.style.background) {
            this.currColour = colourSquare.style.background;
            const recolourList = [];
            for (const obj of this.selectedObjects) {
                recolourList.push({
                    entity: Entity.Object,
                    action: Action.Recolour,
                    objectId: obj.objectId,
                    colour: this.currColour,
                });
                obj.setColour(this.currColour);
            }
            this.board.serveInter.recolourObjects(recolourList as any);
        }
    }

    // Does not return text for the information bar, as none exists.
    getText() {
        return 'nah';
    }

    // Sets the list of currently selected objects.
    setSelected(newObjs: BoardObject[]) {
        this.selectedObjects = newObjs;
        for (const obj of this.selectedObjects) {
            obj.setSelected(true);
        }
    }
}
