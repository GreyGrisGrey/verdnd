import type { Vec2 } from '../../shared/coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

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
            can.focus();
            if (
                (this.active && this.board.leftMouseDown) ||
                this.board.rightMouseDown
            ) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                this.board.moveCamera(change.x, change.y);
            }
        });

        can.addEventListener('keydown', (event) => {
            if (this.active) {
                if (event.key === 'm') {
                    this.board.modeMan.sendLaser =
                        !this.board.modeMan.sendLaser;
                } else if (event.key === 'k') {
                    this.board.offset.x = 0;
                    this.board.offset.y = 0;
                } else if (event.key === 'o') {
                    this.board.laserCol = colourSquare.style.background;
                }
            }
        });

        // Changes the zoom level when scrolled
        can.addEventListener('wheel', (event) => {
            if (true) {
                const old = this.board.zoomVal;
                if (
                    event.deltaY < 0 &&
                    this.board.zoomGlobal < this.board.zoomLevels.length - 1
                ) {
                    this.board.zoomGlobal += 1;
                    this.board.zoomVal =
                        this.board.zoomLevels[this.board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: this.board.mouseCoords.x - this.board.offset.x,
                        y: this.board.mouseCoords.y - this.board.offset.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * this.board.zoomVal) / old,
                        y: (originDist.y * this.board.zoomVal) / old,
                    };
                    this.board.offset.x -= goals.x - originDist.x;
                    this.board.offset.y -= goals.y - originDist.y;
                } else if (event.deltaY > 0 && this.board.zoomGlobal > 0) {
                    this.board.zoomGlobal -= 1;
                    this.board.zoomVal =
                        this.board.zoomLevels[this.board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: this.board.mouseCoords.x - this.board.offset.x,
                        y: this.board.mouseCoords.y - this.board.offset.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * this.board.zoomVal) / old,
                        y: (originDist.y * this.board.zoomVal) / old,
                    };
                    this.board.offset.x -= goals.x - originDist.x;
                    this.board.offset.y -= goals.y - originDist.y;
                }
                this.board.offset.x =
                    Math.round(this.board.offset.x * 10000) / 10000;
                this.board.offset.y =
                    Math.round(this.board.offset.y * 10000) / 10000;
            }
        });
    }

    // Text for the information bar.
    getText() {
        return 'Scroll : Zoom\nLeft Click + Drag : Pan\nM : Toggle laser visibility\nK : Recenter camera to origin\nO : Recolour laser pointer';
    }
}
