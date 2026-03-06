import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
const can = getRequiredElement('board', HTMLCanvasElement);

// Class handling canvas' view mode.
export class BoardViewMode {
    board: Board;
    active: boolean;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = true;
        this.addEventListeners();
    }

    // Flips the active state of the mode.
    flipListeners(setOn: boolean) {
        this.active = setOn;
    }

    // Adds relevant event listeners
    addEventListeners() {
        can.addEventListener('mousemove', (event) => {
            if (this.active) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                if (this.board.leftMouseDown) {
                    this.board.moveCamera(change.x, change.y);
                }
            }
        });

        // Changes the zoom level when scrolled
        can.addEventListener('wheel', (event) => {
            if (this.active) {
                const old = this.board.zoomVal;
                if (
                    event.deltaY < 0 &&
                    this.board.zoomGlobal < this.board.zoomLevels.length - 1
                ) {
                    this.board.zoomGlobal += 1;
                    this.board.zoomVal =
                        this.board.zoomLevels[this.board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: this.board.mouseCoords.x - this.board.originCoords.x,
                        y: this.board.mouseCoords.y - this.board.originCoords.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * this.board.zoomVal) / old,
                        y: (originDist.y * this.board.zoomVal) / old,
                    };
                    this.board.originCoords.x -= goals.x - originDist.x;
                    this.board.originCoords.y -= goals.y - originDist.y;
                } else if (event.deltaY > 0 && this.board.zoomGlobal > 0) {
                    this.board.zoomGlobal -= 1;
                    this.board.zoomVal =
                        this.board.zoomLevels[this.board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: this.board.mouseCoords.x - this.board.originCoords.x,
                        y: this.board.mouseCoords.y - this.board.originCoords.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * this.board.zoomVal) / old,
                        y: (originDist.y * this.board.zoomVal) / old,
                    };
                    this.board.originCoords.x -= goals.x - originDist.x;
                    this.board.originCoords.y -= goals.y - originDist.y;
                }
                this.board.originCoords.x =
                    Math.round(this.board.originCoords.x * 10000) / 10000;
                this.board.originCoords.y =
                    Math.round(this.board.originCoords.y * 10000) / 10000;
            }
        });
    }

    // Text for the information bar.
    getText() {
        return 'Scroll : Zoom\nLeft Click + Drag : Pan';
    }
}
