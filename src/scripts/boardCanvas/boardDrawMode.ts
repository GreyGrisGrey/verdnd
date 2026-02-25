import Color, { type ColorInstance } from 'color';

import { Circle, Line, Polyline, Rect } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { WHITE_50 } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import type { CreateObjectPayload } from '../objectEvents.ts';
import { Action, Entity, Shape } from '../objectEvents.ts';
import { actions } from 'astro:actions';

const can = getRequiredElement('board', HTMLCanvasElement);
const modeButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

type DrawObjectResult = CreateObjectPayload | CreateObjectPayload[];

// Class handling canvas' draw mode.
// I do not like this, but it was the cleanest way I could think to do the job.
export class BoardDrawMode {
    board: Board;
    active: boolean;
    shape: Shape;
    params: Vec2[];
    completeObjCheck: boolean;
    activeColour: ColorInstance;
    selectMode: boolean;
    selectState: number;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.addEventListeners();
        this.shape = Shape.Rect;
        this.params = [];
        this.completeObjCheck = false;
        this.activeColour = WHITE_50;
        this.selectMode = false;
        this.selectState = 0;
    }

    // Changes the active colour to match the colour picker.
    changeColour() {
        this.activeColour = Color(colourSquare.style.background);
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        modeButton.disabled = setOn;
        this.params = [];
        this.selectMode = false;
        this.selectState = 0;
        this.completeObjCheck = false;
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        // Handling for switching between drawn shape.
        document.addEventListener('keydown', (event) => {
            if (this.active) {
                this.selectMode = false;
            }
            if (this.active && this.params.length === 0) {
                if (event.key === '1') {
                    this.shape = Shape.Rect;
                } else if (event.key === '2') {
                    this.shape = Shape.Rects;
                } else if (event.key === '3') {
                    this.shape = Shape.Circle;
                } else if (event.key === '4') {
                    this.shape = Shape.Poly;
                } else if (event.key === '5') {
                    this.shape = Shape.Line;
                } else if (event.key === '7') {
                    this.shape = Shape.Rect;
                    this.selectMode = true;
                }
                this.params = [];
            } else if (
                this.active &&
                event.key === '6' &&
                this.params.length > 2 &&
                (this.shape === Shape.Poly || this.shape === Shape.Line)
            ) {
                this.setNewObject();
            } else if (this.active && event.key === "8") {
                this.params = [];
            }
        });

        can.addEventListener('mousedown', () => {
            if (this.active) {
                if (this.shape !== Shape.Poly && this.shape !== Shape.Line) {
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
        can.addEventListener('mouseup', () => {
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
                this.shape !== Shape.Poly &&
                this.shape !== Shape.Line
            ) {
                if (this.shape === Shape.Rect || this.shape === Shape.Rects) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    );
                    if (res.x >= this.params[0].x) {
                        res.x += 1;
                    }
                    if (res.y >= this.params[0].y) {
                        res.y += 1;
                    }
                    this.params.push({ x: res.x, y: res.y });
                    this.setNewObject();
                } else if (this.shape === Shape.Circle) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    );
                    if (res.x >= this.params[0].x) {
                        res.x += 1;
                    }
                    if (res.y >= this.params[0].y) {
                        res.y += 1;
                    }
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
2 : Create Square Style Rectangle
3 : Create Circle
4 : Create Polyline
5 : Create Wall
6 : Complete Wall/Polyline
7 : Select
8 : Cancel
Backspace : Delete Selected`;
    }

    // Finalizes the current object and sends it to the server.
    setNewObject() {
        let tempObj: CreateObjectPayload
        if (this.shape === Shape.Rect && this.params.length === 2) {
            const one = Math.min(this.params[0].x, this.params[1].x);
            const two = Math.min(this.params[0].y, this.params[1].y);
            const sizes = [
                Math.abs(this.params[1].x - this.params[0].x),
                Math.abs(this.params[1].y - this.params[0].y),
            ];
            if (this.params[1].x < this.params[0].x) {
                sizes[0] += 1;
            }
            if (this.params[1].y < this.params[0].y) {
                sizes[1] += 1;
            }
            tempObj = {
                kind: Shape.Rect,
                x: one,
                y: two,
                width: sizes[0],
                height: sizes[1],
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer
            };
            this.completeObjCheck = true;
        } else if (this.shape === Shape.Circle && this.params.length === 2) {
            const x = Math.min(this.params[0].x, this.params[1].x);
            const y = Math.min(this.params[0].y, this.params[1].y);
            const radius = Math.max(
                Math.abs(this.params[0].x - this.params[1].x),
                Math.abs(this.params[0].y - this.params[1].y),
            );
            tempObj = {
                kind: Shape.Circle,
                x,
                y,
                diameter: radius,
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer
            };
            this.completeObjCheck = true;
        } else if (this.shape === Shape.Poly && this.params.length > 2) {
            tempObj = {
                kind: Shape.Poly,
                x: this.params[0].x,
                y: this.params[0].y,
                points: this.params.slice(1),
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer
            };
            this.completeObjCheck = true;
        } else if (this.shape === Shape.Rects && this.params.length === 2) {
            // this object type is not needed we'll be removing that
            return
        } else if (this.shape === Shape.Line && this.params.length > 2) {
            tempObj = {
                kind: Shape.Line,
                x: this.params[0].x,
                y: this.params[0].y,
                points: this.params.slice(1),
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer
            };
            
            this.completeObjCheck = true;
        } else {
            return
        }
        actions.boardActions.createObject({entity: Entity.Object,
                        action: Action.Create,
                        object: tempObj})
        this.params = [];
    }

    // Returns a temporary board object to display the shape about to be drawn.
    getTempObject() {
        if (!this.active) {
            return undefined;
        }
        if (
            this.shape !== Shape.Poly &&
            this.shape !== Shape.Line &&
            this.params.length >= 1
        ) {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
            );
            if (this.shape === Shape.Rect || this.shape === Shape.Rects) {
                if (res.x >= this.params[0].x) {
                    res.x += 1;
                }
                if (res.y >= this.params[0].y) {
                    res.y += 1;
                }
                const coords = {
                    x: Math.min(this.params[0].x, res.x),
                    y: Math.min(this.params[0].y, res.y),
                };
                const sizes: Vec2 = {
                    x: Math.abs(res.x - this.params[0].x),
                    y: Math.abs(res.y - this.params[0].y),
                };
                if (res.x < this.params[0].x) {
                    sizes.x += 1;
                }
                if (res.y < this.params[0].y) {
                    sizes.y += 1;
                }
                if (this.selectMode) {
                    return new Rect(
                        -1,
                        coords.x,
                        coords.y,
                        sizes.x,
                        sizes.y,
                        WHITE_50,
                    );
                }
                return new Rect(
                    -1,
                    coords.x,
                    coords.y,
                    sizes.x,
                    sizes.y,
                    this.activeColour,
                );
            } else if (this.shape === Shape.Circle) {
                if (res.x >= this.params[0].x) {
                    res.x += 1;
                }
                if (res.y >= this.params[0].y) {
                    res.y += 1;
                }
                const coords: Vec2 = {
                    x: Math.min(this.params[0].x, res.x),
                    y: Math.min(this.params[0].y, res.y),
                };
                const radius = Math.max(
                    Math.abs(this.params[0].x - res.x),
                    Math.abs(this.params[0].y - res.y),
                );
                const newObj = new Circle(
                    -1,
                    coords.x,
                    coords.y,
                    radius,
                    this.activeColour,
                );
                return newObj;
            }
        } else if (this.params.length >= 2 && this.shape === Shape.Poly) {
            const newParams = this.params.slice(1);
            const newObj = new Polyline(
                -1,
                this.params[0].x,
                this.params[0].y,
                newParams,
                this.activeColour,
            );
            return newObj;
        } else if (this.params.length >= 2 && this.shape === Shape.Line) {
            const newParams = this.params.slice(1);
            const newObj = new Line(
                -1,
                this.params[0].x,
                this.params[0].y,
                newParams,
                this.activeColour,
            );
            return newObj;
        }
        return undefined;
    }
}
