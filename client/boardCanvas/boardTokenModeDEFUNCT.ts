import { Box, type BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import type { Board } from './localBoard.ts';
import { WHITE_50 } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import { Shape } from '../../shared/objectEvents.ts';
import { CoordModes } from './localBoard.ts';
const can = getRequiredElement('board', HTMLCanvasElement);

// Class formerly handling tokens
// Currently just here so some of its code can be repurposed later.
export class BoardTokenMode {
    board: Board;
    active: boolean;
    params: Vec2[];
    shift: boolean;
    completeSelectCheck: boolean;
    currHover?: BoardObject;
    newTokenCheck: boolean;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.params = [];
        this.shift = false;
        this.completeSelectCheck = false;
        this.currHover = undefined;
        this.newTokenCheck = false;
        this.addEventListeners();
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        this.active = setOn;
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        can.addEventListener('mousemove', () => {
            if (this.active) {
                this.currHover = this.board.selectToken([
                    this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        CoordModes.Center,
                    ),
                ]);
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                if (!this.shift) {
                    const res = this.board.selectToken([
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            CoordModes.Center,
                        ),
                    ]);
                    this.currHover = res;
                    if (this.currHover) {
                        this.completeSelectCheck = true;
                    }
                } else {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            CoordModes.Center,
                        ),
                    );
                }
            }
        });

        can.addEventListener('mouseup', (event) => {
            if (this.active && event.button === 0) {
                if (this.shift) {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            CoordModes.Center,
                        ),
                    );
                    const newCoords: Vec2[] = [];
                    newCoords.push({
                        x: Math.min(this.params[0].x, this.params[1].x),
                        y: Math.min(this.params[0].y, this.params[1].y),
                    });
                    newCoords.push({
                        x: Math.max(this.params[0].x, this.params[1].x) + 1,
                        y: Math.max(this.params[0].y, this.params[1].y) + 1,
                    });
                    this.params = newCoords;
                    this.completeSelectCheck = true;
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (this.active && event.key === 'Shift') {
                this.shift = true;
            }
        });

        // Should this event listener not check if token mode is active? Probably not, but it causes a bug with single token selection if it does.
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.shift = false;
            }
        });
    }

    getText() {
        return 'Token creation now handled by selecting objects in draw mode\nLeft Click on Token : Select Token\nShift + Left Click : Select Tokens';
    }

    // Gets the token the mouse is currently hovering over, should such a token exist.
    getNewHover() {
        if (this.newTokenCheck) {
            this.currHover = this.board.selectToken([
                this.board.determineTile(
                    this.board.mouseCoords.x,
                    this.board.mouseCoords.y,
                    CoordModes.Center,
                ),
            ]);
            if (this.currHover) {
                this.newTokenCheck = false;
            }
        }
    }

    // Constructs a rectangle showing the area to be selected.
    getSelectBox() {
        if (this.params.length > 0) {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                CoordModes.Center,
            );
            let coords: Vec2 = { x: 0, y: 0 };
            if (res.x >= this.params[0].x) {
                res.x += 1;
            }
            if (res.y >= this.params[0].y) {
                res.y += 1;
            }
            coords = {
                x: Math.min(this.params[0].x, res.x),
                y: Math.min(this.params[0].y, res.y),
            };
            const sizes = [
                Math.abs(res.x - this.params[0].x),
                Math.abs(res.y - this.params[0].y),
            ];
            if (res.x < this.params[0].x) {
                sizes[0] += 1;
            }
            if (res.y < this.params[0].y) {
                sizes[1] += 1;
            }
            return new Box(
                -1,
                coords.x,
                coords.y,
                sizes[0],
                sizes[1],
                WHITE_50,
                Shape.Rect,
            );
        }
        return undefined;
    }
}
