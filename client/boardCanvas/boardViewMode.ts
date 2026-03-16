import type { Vec2 } from '../../shared/coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { CoordModes } from './localBoard.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;

// Class handling canvas' view mode.
export class BoardViewMode {
    board: Board;
    active: boolean;
    start: Vec2;
    measuring: boolean;
    boxItems: HTMLButtonElement[];

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = true;
        this.addEventListeners();
        this.start = { x: 0, y: 0 };
        this.measuring = false;
        this.boxItems = [];
        this.setUpBoxes();
    }

    // Flips the active state of the mode.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        this.start.x = 0;
        this.start.y = 0;
        this.measuring = false;
        this.toggleBoxes();
    }

    // Sets up control buttons for viewing/clicking.
    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomViewBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            if (i === 0 || i === 1 || i === 4) {
                this.boxItems[i].disabled = true;
            }
            this.boxItems[i].addEventListener('click', () => {
                this.handleSwitchEvent(i.toString());
            });
        }
    }

    // Toggles functionality of buttons.
    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
        }
    }

    // Handles key press events when view mode is active.
    handleSwitchEvent(key: string) {
        if (key === '6') {
            this.board.modeMan.sendLaser = !this.board.modeMan.sendLaser;
        } else if (key === '5') {
            this.board.offset.x = 0;
            this.board.offset.y = 0;
        } else if (key === '7') {
            this.board.laserCol = colourSquare.style.background;
        } else if (key === '8') {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                CoordModes.Center,
            );
            this.start.x = res.x;
            this.start.y = res.y;
            this.measuring = true;
        } else if (key === 'Backspace' || key === 'Escape' || key === '9') {
            this.start.x = 0;
            this.start.y = 0;
            this.measuring = false;
        }
    }

    // Draws the current circle created by the measuring tool.
    // Kind of looks not great, something should be done about this.
    // TODO : Do that.
    drawMeasure() {
        const squareSize = 5 * this.board.zoomVal;
        const res = this.board.determineTile(
            this.board.mouseCoords.x,
            this.board.mouseCoords.y,
            CoordModes.None,
        );
        const res2 = {
            x: (this.start.x + 0.5) * squareSize + this.board.offset.x,
            y: (this.start.y + 0.5) * squareSize + this.board.offset.y,
        };
        const res3 = {
            x: res.x * squareSize + this.board.offset.x,
            y: res.y * squareSize + this.board.offset.y,
        };
        const rad = Math.sqrt(
            Math.pow(Math.abs(res2.x - res3.x), 2) +
                Math.pow(Math.abs(res2.y - res3.y), 2),
        );
        const rad2 = Math.sqrt(
            Math.pow(Math.abs(res.x - this.start.x - 0.5), 2) +
                Math.pow(Math.abs(res.y - this.start.y - 0.5), 2),
        );
        ctx.beginPath();
        ctx.arc(res2.x, res2.y, rad, 0, 2 * Math.PI);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#cccccc';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(res2.x, res2.y);
        ctx.lineTo(res3.x, res3.y);
        ctx.stroke();
        ctx.font = '20px serif';
        ctx.fillStyle = '#eeeeee';
        ctx.textAlign = 'center';
        const newText = `${Math.round(rad2 * 500) / 100} feet`;
        const textSize = ctx.measureText(newText).width;
        ctx.fillRect(res3.x - textSize / 2 - 5, res3.y - 15, textSize + 10, 25);
        ctx.fillStyle = '#222222';
        ctx.fillText(newText, res3.x, res3.y);
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
                this.handleSwitchEvent(event.key);
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

}
