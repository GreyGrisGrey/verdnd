import { Rect, type Token } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { WHITE_50 } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import { Action, Entity, Shape } from '../objectEvents.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const sizeInput = getRequiredElement('tokenSize', HTMLInputElement);
const nameInput = getRequiredElement('tokenName', HTMLInputElement);
const sizeLabel = getRequiredElement('tokenSizeLabel', HTMLLabelElement);
const nameLabel = getRequiredElement('tokenNameLabel', HTMLLabelElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

// Class handling canvas' token mode.
// Currently WIP.
export class BoardTokenMode {
    board: Board;
    active: boolean;
    params: Vec2[];
    shift: boolean;
    completeSelectCheck: boolean;
    currHover?: Token;
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

    flipListeners(setOn: boolean) {
        this.active = setOn;
        sizeInput.value = '1';
        nameInput.value = 'Gremlin';
        sizeInput.style.visibility = this.active ? 'visible' : 'hidden';
        nameInput.style.visibility = this.active ? 'visible' : 'hidden';
        sizeLabel.style.visibility = this.active ? 'visible' : 'hidden';
        nameLabel.style.visibility = this.active ? 'visible' : 'hidden';
    }

    addEventListeners() {
        can.addEventListener('mousemove', () => {
            if (this.active) {
                this.currHover = this.board.selectToken([
                    this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    ),
                ]);
            }
        });

        can.addEventListener('mousedown', () => {
            if (this.active) {
                if (!this.shift) {
                    const res = this.board.selectToken([
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    ]);
                    this.currHover = res;
                    if (!this.currHover) {
                        this.createToken();
                        this.newTokenCheck = true;
                    } else {
                        this.completeSelectCheck = true;
                    }
                } else {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    );
                }
            }
        });

        can.addEventListener('mouseup', () => {
            if (this.active) {
                if (this.shift) {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
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

        sizeInput.addEventListener('input', () => {
            if (sizeInput.value.length > 3) {
                sizeInput.value = '1';
            } else {
                for (const char of sizeInput.value) {
                    if (char.charCodeAt(0) < 48 || char.charCodeAt(0) > 57) {
                        sizeInput.value = '1';
                        break;
                    }
                }
                if (parseInt(sizeInput.value, 10) < 1) {
                    sizeInput.value = '1';
                } else if (parseInt(sizeInput.value, 10) > 300) {
                    alert(
                        'u have no legitimate need to make a token this big\npls be serious',
                    );
                    sizeInput.value = '1';
                }
            }
        });
    }

    getText() {
        return 'Left Click : Create Token\nLeft Click on Token : Select Token\nShift + Left Click : Select Tokens';
    }

    createToken() {
        if (nameInput.value && sizeInput.value) {
            const coords = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
            );
            this.board.serveInter.createObject({
                entity: Entity.Object,
                action: Action.Create,
                object: {
                    kind: Shape.Token,
                    x: coords.x,
                    y: coords.y,
                    diameter: parseInt(sizeInput.value, 10),
                    colour: colourSquare.style.background,
                    name: nameInput.value,
                    layerId: this.board.activeLayer,
                    objectId: -1,
                },
            });
        }
    }

    tryDrawLabel(
        ctx: CanvasRenderingContext2D,
        squareSize: number,
        offset: Vec2,
    ) {
        this.currHover?.drawLabel(ctx, squareSize, offset);
    }

    getNewHover() {
        if (this.newTokenCheck) {
            this.currHover = this.board.selectToken([
                this.board.determineTile(
                    this.board.mouseCoords.x,
                    this.board.mouseCoords.y,
                    false,
                ),
            ]);
            if (this.currHover) {
                this.newTokenCheck = false;
            }
        }
    }

    getTempObject() {
        if (this.params.length > 0) {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
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
            return new Rect(
                -1,
                coords.x,
                coords.y,
                sizes[0],
                sizes[1],
                WHITE_50,
            );
        }
        return undefined;
    }
}
