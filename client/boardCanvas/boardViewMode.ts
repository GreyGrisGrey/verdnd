import type { Vec2 } from '../../shared/coords.ts';
import { Board } from './localBoard.ts';
import type { BoardObject } from './boardObject.ts';
import { getRequiredElement } from '../dom.ts';
import { CoordModes } from './localBoard.ts';
import { ModeManager } from './modeManager.ts';
import { ColourBox } from '../leftBar/colourBox.ts';
import { Selector } from './selector.ts';
import { BoardLayer } from './boardLayer.ts';
import { LayerMenu } from '../rightBar/layerBarMenu.ts';
const selector = new Selector();
const colourBox = new ColourBox();
const modeMan = new ModeManager();
const board = new Board();
const layerMan = new LayerMenu();
const storedLayers: Map<number, BoardLayer> = new Map();
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;
const measureDegrees = getRequiredElement('measureDegrees', HTMLInputElement);
const measureLabel = getRequiredElement('measureDegreesLabel', HTMLElement);

// Class handling canvas' view mode.
export class BoardViewMode {
    active: boolean;
    start: Vec2;
    measuring: boolean;
    boxItems: HTMLButtonElement[];
    completeSelectCheck: boolean;
    selectedToken: BoardObject | null;
    layerOffset: Vec2;

    constructor() {
        this.active = true;
        this.addEventListeners();
        this.start = { x: 0, y: 0 };
        this.measuring = false;
        this.layerOffset = { x: 0, y: 0 };
        this.boxItems = [];
        this.setUpBoxes();
        this.completeSelectCheck = false;
        this.selectedToken = null;
        measureDegrees.value = '360';
    }

    // Updates the layer offset for the purposes of token selection.
    updateLayerOffset(newOff: Vec2) {
        this.layerOffset = newOff;
    }

    // Flips the active state of the mode.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        this.start.x = 0;
        this.start.y = 0;
        this.measuring = false;
        this.completeSelectCheck = false;
        this.selectedToken = null;
        measureDegrees.style.visibility = setOn ? 'visible' : 'hidden';
        measureLabel.style.visibility = setOn ? 'visible' : 'hidden';
        this.toggleBoxes();
    }

    // Sets up control buttons for viewing/clicking.
    setUpBoxes() {
        for (let i = 5; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomViewBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            this.boxItems[i - 5].addEventListener('click', () => {
                this.handleSwitchEvent(i.toString());
            });
        }
    }

    // Toggles functionality of buttons.
    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
            box.style.left = '-90px';
        }
    }

    // Handles key press events when view mode is active.
    handleSwitchEvent(key: string) {
        if (key === '6') {
            modeMan.sendLaser = !modeMan.sendLaser;
        } else if (key === '5') {
            board.offset.x = window.innerWidth / 2;
            board.offset.y = window.innerHeight / 2;
        } else if (key === '7') {
            board.laserCol = colourBox.getCurrColour();
        } else if (key === '8') {
            const res = board.determineTile(
                board.mouseCoords.x,
                board.mouseCoords.y,
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

    // Gets offset values for the cone part of the measuring tool
    determineMeasureOffset(res: Vec2): number {
        const res2 = {
            x: this.start.x + 0.5,
            y: this.start.y + 0.5,
        };
        const rad = Math.sqrt(
            Math.pow(Math.abs(res2.x - res.x), 2) +
                Math.pow(Math.abs(res2.y - res.y), 2),
        );
        const sin = (res2.y - res.y) / rad;
        const cos = (res.x - res2.x) / rad;
        if (sin >= 0 && cos >= 0) {
            return Math.asin(sin);
        } else if (sin < 0 && cos >= 0) {
            return 2 * Math.PI + Math.asin(sin);
        } else {
            return Math.PI - Math.asin(sin);
        }
    }

    // Draws the current circle created by the measuring tool.
    // Kind of looks not great, something should be done about this.
    // TODO : Do that.
    drawMeasure() {
        const squareSize = 5 * board.zoomVal;
        const res = board.determineTile(
            board.mouseCoords.x,
            board.mouseCoords.y,
            CoordModes.None,
        );
        const res2 = {
            x: (this.start.x + 0.5) * squareSize + board.offset.x,
            y: (this.start.y + 0.5) * squareSize + board.offset.y,
        };
        const res3 = {
            x: res.x * squareSize + board.offset.x,
            y: res.y * squareSize + board.offset.y,
        };
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#cccccc';
        if (Number(measureDegrees.value) > 0) {
            const rad = Math.sqrt(
                Math.pow(Math.abs(res2.x - res3.x), 2) +
                    Math.pow(Math.abs(res2.y - res3.y), 2),
            );
            const rad2 = Math.sqrt(
                Math.pow(Math.abs(res.x - this.start.x - 0.5), 2) +
                    Math.pow(Math.abs(res.y - this.start.y - 0.5), 2),
            );
            ctx.beginPath();
            const radians = (Number(measureDegrees.value) * Math.PI) / 180;
            const offset = this.determineMeasureOffset(res);
            const angles = [-(offset + radians / 2), -(offset - radians / 2)];
            if (radians !== 2 * Math.PI) {
                ctx.lineTo(res2.x, res2.y);
                ctx.arc(res2.x, res2.y, rad, angles[0], angles[1]);
                ctx.lineTo(res2.x, res2.y);
            } else {
                ctx.arc(res2.x, res2.y, rad, angles[0], angles[1]);
            }
            ctx.stroke();

            if (radians >= 2 * Math.PI) {
                ctx.beginPath();
                ctx.moveTo(res2.x, res2.y);
                ctx.lineTo(res3.x, res3.y);
                ctx.stroke();
            }

            ctx.font = '20px serif';
            ctx.fillStyle = '#eeeeee';
            ctx.textAlign = 'center';
            const newText = `${Math.round(rad2 * 500) / 100} feet`;
            const textSize = ctx.measureText(newText).width;
            ctx.fillRect(
                res3.x - textSize / 2 - 5,
                res3.y - 15,
                textSize + 10,
                25,
            );
            ctx.fillStyle = '#222222';
            ctx.fillText(newText, res3.x, res3.y);
        } else {
            const rad2 = Math.sqrt(
                Math.pow(Math.abs(res.x - this.start.x - 0.5), 2) +
                    Math.pow(Math.abs(res.y - this.start.y - 0.5), 2),
            );

            ctx.beginPath();
            ctx.moveTo(res2.x, res2.y);
            ctx.lineTo(res3.x, res3.y);
            ctx.stroke();

            ctx.font = '20px serif';
            ctx.fillStyle = '#eeeeee';
            ctx.textAlign = 'center';
            const newText = `${Math.round(rad2 * 500) / 100} feet`;
            const textSize = ctx.measureText(newText).width;
            ctx.fillRect(
                res3.x - textSize / 2 - 5,
                res3.y - 15,
                textSize + 10,
                25,
            );
            ctx.fillStyle = '#222222';
            ctx.fillText(newText, res3.x, res3.y);
        }
    }

    // Adds relevant event listeners
    addEventListeners() {
        measureDegrees.addEventListener('input', () => {
            let value = Number(measureDegrees.value);
            if (Number.isNaN(value) || value > 360 || value < 0) {
                measureDegrees.value = '360';
                value = 360;
            }
        });

        can.addEventListener('mousemove', (event) => {
            can.focus();
            if (
                (board.leftMouseDown &&
                    !this.completeSelectCheck &&
                    this.active) ||
                board.midMouseDown
            ) {
                const change: Vec2 = {
                    x: Math.round(board.mouseCoords.x - event.clientX),
                    y: Math.round(board.mouseCoords.y - event.clientY),
                };
                board.moveCamera(change.x, change.y);
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                const res = board.selectToken(
                    [
                        board.determineTile(
                            board.mouseCoords.x -
                                this.layerOffset.x * board.zoomVal * 5,
                            board.mouseCoords.y -
                                this.layerOffset.y * board.zoomVal * 5,
                            CoordModes.Center,
                        ),
                    ],
                    'token',
                );
                if (res) {
                    this.completeSelectCheck = true;
                    this.selectedToken = res;
                }
            } else if (this.active && event.button === 2) {
                if (storedLayers.has(layerMan.currSelect)) {
                    selector.activate(storedLayers.get(layerMan.currSelect)!);
                }
            }
        });

        can.addEventListener('mouseup', (event) => {
            if (this.active && event.button === 2) {
                selector.complete();
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
                const old = board.zoomVal;
                if (
                    event.deltaY < 0 &&
                    board.zoomGlobal < board.zoomLevels.length - 1
                ) {
                    board.zoomGlobal += 1;
                    board.zoomVal = board.zoomLevels[board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: board.mouseCoords.x - board.offset.x,
                        y: board.mouseCoords.y - board.offset.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * board.zoomVal) / old,
                        y: (originDist.y * board.zoomVal) / old,
                    };
                    board.offset.x -= goals.x - originDist.x;
                    board.offset.y -= goals.y - originDist.y;
                } else if (event.deltaY > 0 && board.zoomGlobal > 0) {
                    board.zoomGlobal -= 1;
                    board.zoomVal = board.zoomLevels[board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: board.mouseCoords.x - board.offset.x,
                        y: board.mouseCoords.y - board.offset.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * board.zoomVal) / old,
                        y: (originDist.y * board.zoomVal) / old,
                    };
                    board.offset.x -= goals.x - originDist.x;
                    board.offset.y -= goals.y - originDist.y;
                }
                board.offset.x = Math.round(board.offset.x * 10000) / 10000;
                board.offset.y = Math.round(board.offset.y * 10000) / 10000;
            }
        });
    }
}
