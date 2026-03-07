import { Polyline, Box } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { WHITE_50 } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import type { ObjectCreatePayload } from '../objectEvents.ts';
import { Action, Entity, Shape } from '../objectEvents.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

function rectangleFromPoints(point1: Vec2, point2: Vec2) {
    const x = Math.min(point1.x, point2.x);
    const y = Math.min(point1.y, point2.y);
    const width = Math.max(point1.x, point2.x) - x + 1;
    const height = Math.max(point1.y, point2.y) - y + 1;
    return [x, y, width, height];
}

// Class handling canvas' draw mode.
export class BoardDrawMode {
    board: Board;
    active: boolean;
    shape: Shape;
    params: Vec2[];
    completeObjCheck: boolean;
    selectMode: boolean;
    selectState: number;
    tempObject: ObjectCreatePayload | null;
    stickTemp: boolean;
    boxItems: HTMLButtonElement[];

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.shape = Shape.Rect;
        this.params = [];
        this.completeObjCheck = false;
        this.selectMode = false;
        this.selectState = 0;
        this.tempObject = null;
        this.stickTemp = false;
        this.boxItems = [];

        this.addEventListeners();
        this.setUpBoxes();
        this.flipBoxes();
        this.toggleBoxes();
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomDrawBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            
            this.boxItems[i].addEventListener('click', () => {
                this.handleSwitchEvent(i.toString());
                this.flipBoxes();
            });
        }
    }

    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
        }
    }

    flipBoxes() {
        this.boxItems[1].disabled = this.shape === Shape.Rect;
        this.boxItems[2].disabled = this.shape === Shape.Ellipse;
        this.boxItems[3].disabled = this.shape === Shape.Polyline;
        this.boxItems[4].disabled = this.shape === Shape.Line;
        this.boxItems[6].disabled = this.selectMode;
        this.boxItems[8].disabled = true;
        this.boxItems[9].disabled = true;
        this.boxItems[0].disabled = true;
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        this.params = [];
        this.selectMode = false;
        this.selectState = 0;
        this.completeObjCheck = false;
        if (setOn) {
            this.flipBoxes();
        }
        this.toggleBoxes();
    }

    handleSwitchEvent(key: string) {
        if (key === '1') {
            this.shape = Shape.Rect;
        } else if (key === '2') {
            this.shape = Shape.Ellipse;
        } else if (key === '3') {
            this.shape = Shape.Polyline;
        } else if (key === '4') {
            this.shape = Shape.Line;
        } else if (key === '5') {
            this.setNewObject();
        }
        if (key === '6') {
            this.selectMode = !this.selectMode;
        } else {
            this.selectMode = false;
        }
        this.params = [];
    }

    handleKeySwitchEvent(key: string) {
        if (this.active && this.params.length === 0) {
            this.handleSwitchEvent(key);
        } else if (
            this.active &&
            key === '5' &&
            this.params.length > 2 &&
            (this.shape === Shape.Polyline || this.shape === Shape.Line)
        ) {
            this.handleSwitchEvent(key);
        } else if (this.active && key === '7') {
            this.handleSwitchEvent(key);
        }
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.active) {
                this.handleKeySwitchEvent(event.key);
                this.flipBoxes();
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                if (
                    (this.shape !== Shape.Polyline &&
                        this.shape !== Shape.Line) ||
                    this.selectMode
                ) {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    );
                } else if (this.params.length > 0) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        true,
                    );
                    this.params.push({
                        x: res.x - this.params[0].x,
                        y: res.y - this.params[0].y,
                    });
                } else {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            true,
                        ),
                    );
                }
            }
        });

        // Seriously suboptimal code for finishing construction of circles and rectangles.
        can.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                if (this.params.length === 0) {
                    return;
                } else if (this.active && this.selectMode) {
                    const newPos = this.board.determineTile(
                        this.board.mouseCoords.x + 1,
                        this.board.mouseCoords.y + 1,
                        false,
                    );
                    if (
                        newPos.x === this.params[0].x &&
                        newPos.y === this.params[0].y
                    ) {
                        this.selectState = 1;
                    } else {
                        const topLeft: Vec2 = {
                            x: Math.min(newPos.x, this.params[0].x),
                            y: Math.min(newPos.y, this.params[0].y),
                        };
                        const bottomRight: Vec2 = {
                            x: Math.max(newPos.x, this.params[0].x) + 1,
                            y: Math.max(newPos.y, this.params[0].y) + 1,
                        };
                        this.selectState = 2;
                        this.params = [];
                        this.params.push(topLeft);
                        this.params.push(bottomRight);
                    }
                } else if (
                    this.active &&
                    this.shape !== Shape.Polyline &&
                    this.shape !== Shape.Line
                ) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    );
                    this.params.push({ x: res.x, y: res.y });
                    this.setNewObject();
                }
            }
        });
    }

    // Text for the information bar.
    getText() {
        return `\
        1 : Create Rectangle
        2 : Create Ellipse
        3 : Create Polyline
        4 : Create Wall
        5 : Complete Wall/Polyline
        6 : Select
        7 : Cancel Draw`;
    }

    // Finalizes the current object and sends it to the server.
    setNewObject() {
        let tempObj: ObjectCreatePayload;
        if (
            (this.shape === Shape.Rect ||
                this.shape === Shape.Ellipse ||
                this.selectMode) &&
            this.params.length === 2
        ) {
            const res = rectangleFromPoints(this.params[0], this.params[1]);
            const kind = this.selectMode ? Shape.Rect : this.shape;
            tempObj = {
                kind: kind as any,
                x: res[0],
                y: res[1],
                width: res[2],
                height: res[3],
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer,
                objectId: -1,
            };
            this.completeObjCheck = true;
        } else if (
            (this.shape === Shape.Polyline || this.shape === Shape.Line) &&
            this.params.length > 2
        ) {
            tempObj = {
                kind: this.shape,
                x: this.params[0].x,
                y: this.params[0].y,
                points: this.params.slice(1),
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer,
                objectId: -1,
            };
            this.completeObjCheck = true;
        } else {
            return;
        }
        this.board.serveInter.createObject({
            entity: Entity.Object,
            action: Action.Create,
            object: tempObj,
        });
        this.params = [];
        this.tempObject = tempObj;
        this.stickTemp = true;
    }

    // Returns a temporary board object to display the shape about to be drawn.
    getTempObject() {
        if (!this.active) {
            return undefined;
        }
        if (this.tempObject !== null) {
            if (
                this.tempObject.kind === Shape.Rect ||
                this.tempObject.kind === Shape.Ellipse
            ) {
                return new Box(
                    -1,
                    this.tempObject.x,
                    this.tempObject.y,
                    this.tempObject.width,
                    this.tempObject.height,
                    this.tempObject.colour,
                    this.tempObject.kind,
                );
            } else if (
                this.tempObject.kind === Shape.Polyline ||
                this.tempObject.kind === Shape.Line
            ) {
                return new Polyline(
                    -1,
                    this.tempObject.x,
                    this.tempObject.y,
                    this.tempObject.points,
                    this.tempObject.colour,
                    this.tempObject.kind,
                );
            }
            return this.tempObject;
        }
        if (
            ((this.shape !== Shape.Polyline && this.shape !== Shape.Line) ||
                this.selectMode) &&
            this.params.length >= 1
        ) {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
            );
            const res2 = rectangleFromPoints(this.params[0], res);
            const col = this.selectMode
                ? WHITE_50
                : colourSquare.style.background;
            const shape = this.selectMode ? Shape.Rect : this.shape;
            return new Box(
                -1,
                res2[0],
                res2[1],
                res2[2],
                res2[3],
                col,
                shape as any,
            );
        } else if (
            this.params.length >= 2 &&
            (this.shape === Shape.Polyline || this.shape === Shape.Line)
        ) {
            const newParams = this.params.slice(1);
            const newObj = new Polyline(
                -1,
                this.params[0].x,
                this.params[0].y,
                newParams,
                colourSquare.style.background,
                this.shape,
            );
            return newObj;
        }
        return undefined;
    }

    // Removes the created object from the draw mode manager.
    // Has functioning that makes said object "stick" for a moment to reduce flickering.
    clearObject() {
        if (!this.stickTemp) {
            this.tempObject = null;
        }
        this.stickTemp = false;
    }
}
