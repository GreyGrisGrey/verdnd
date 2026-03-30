import { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { Board } from './localBoard.ts';
import { WHITE_50 } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import type {
    ObjectCreatePayload,
    ObjectParams,
} from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { CoordModes } from './localBoard.ts';
import { tempStore } from '../serveInter.ts';
import { BoardLayer } from './boardLayer.ts';
import { ColourBox } from '../leftBar/colourBox.ts';
const colourBox = new ColourBox();
const board = new Board();
const storedLayers: Map<number, BoardLayer> = new Map();
const can = getRequiredElement('board', HTMLCanvasElement);
const serveInter = new tempStore();

function rectangleFromPoints(point1: Vec2, point2: Vec2) {
    const x = Math.min(point1.x, point2.x);
    const y = Math.min(point1.y, point2.y);
    const width = Math.max(point1.x, point2.x) - x + 1;
    const height = Math.max(point1.y, point2.y) - y + 1;
    return [x, y, width, height];
}

// Class handling canvas' draw mode.
export class BoardDrawMode {
    active: boolean;
    params: Vec2[];
    selectMode: boolean;
    selectState: number;
    tempObject: ObjectCreatePayload | null;
    stickTemp: boolean;
    boxItems: HTMLButtonElement[];
    currParams: ObjectParams;
    currDraw: number;
    currLayer: BoardLayer;

    constructor() {
        this.currDraw = 2;
        this.active = false;
        this.params = [];
        this.selectMode = false;
        this.selectState = 0;
        this.tempObject = null;
        this.stickTemp = false;
        this.boxItems = [];
        this.currParams = {
            ellipse: false,
            fill: true,
            close: true,
            rect: true,
        };
        this.currLayer = new BoardLayer(0, true, true);
        this.addEventListeners();
        this.setUpBoxes();
        this.flipBoxes();
        this.toggleBoxes();
    }

    // Updates the currently active layer.
    updateLayer(newLayer: number) {
        if (storedLayers.has(newLayer)) {
            this.currLayer = storedLayers.get(newLayer)!;
        } else {
            console.log(
                'Draw mode: requested layer does not exist on storedLayers',
            );
        }
    }

    // Sets up control buttons.
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

    // Toggles functionality of control buttons.
    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
        }
        this.flipBoxes();
    }

    // Flips which control buttons are disabled.
    flipBoxes() {
        this.boxItems[1].disabled = this.selectMode;
        this.boxItems[2].disabled = this.currDraw === 2;
        this.boxItems[3].disabled = this.currDraw === 3;
        this.boxItems[4].disabled = this.currDraw === 4;
        this.boxItems[5].disabled = this.currDraw === 5;
        this.boxItems[6].disabled = this.params.length < 2;
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
        this.toggleBoxes();
    }

    // Handles key press events when draw mode is active.
    handleSwitchEvent(key: string) {
        if (key === '2') {
            this.currParams = {
                ellipse: false,
                fill: true,
                close: true,
                rect: true,
            };
            this.currDraw = 2;
        } else if (key === '3') {
            this.currParams = {
                ellipse: true,
                fill: true,
                close: true,
            };
            this.currDraw = 3;
        } else if (key === '4') {
            this.currParams = { ellipse: false, fill: true, close: true };
            this.currDraw = 4;
        } else if (key === '5') {
            this.currParams = { ellipse: false, fill: false, close: false };
            this.currDraw = 5;
        } else if (key === '6' && !this.selectMode) {
            this.setNewObject();
        }
        if (key === '1') {
            this.currDraw = 1;
            this.selectMode = !this.selectMode;
        } else {
            this.selectMode = false;
        }
        this.params = [];
    }

    // Handles key press events when draw mode is active.
    handleKeySwitchEvent(key: string) {
        if (this.active && this.params.length === 0) {
            this.handleSwitchEvent(key);
        } else if (
            this.active &&
            key === '6' &&
            this.params.length > 2 &&
            this.currDraw >= 4
        ) {
            this.handleSwitchEvent(key);
        } else if (this.active && key === '7') {
            this.handleSwitchEvent(key);
        }
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        can.addEventListener('keydown', (event) => {
            if (this.active) {
                this.handleKeySwitchEvent(event.key);
                this.flipBoxes();
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                if (this.currDraw < 4 || this.selectMode) {
                    this.params.push(
                        board.determineTile(
                            board.mouseCoords.x -
                                this.currLayer.layerOffset.x *
                                    board.zoomVal *
                                    5,
                            board.mouseCoords.y -
                                this.currLayer.layerOffset.y *
                                    board.zoomVal *
                                    5,
                            CoordModes.Center,
                        ),
                    );
                } else {
                    this.params.push(
                        board.determineTile(
                            board.mouseCoords.x,
                            board.mouseCoords.y,
                            CoordModes.Vertex,
                        ),
                    );
                    this.boxItems[6].disabled =
                        this.params.length < 3 &&
                        (this.params.length < 2 || this.currDraw !== 5);
                }
            }
        });

        // Seriously suboptimal code for finishing construction of ellipses and rectangles.
        can.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                if (this.params.length === 0) {
                    return;
                } else if (this.active && this.selectMode) {
                    const newPos = board.determineTile(
                        board.mouseCoords.x +
                            1 -
                            this.currLayer.layerOffset.x * board.zoomVal * 5,
                        board.mouseCoords.y +
                            1 -
                            this.currLayer.layerOffset.y * board.zoomVal * 5,
                        CoordModes.Center,
                    );
                    if (
                        newPos.x === this.params[0].x &&
                        newPos.y === this.params[0].y
                    ) {
                        this.selectState = 1;
                    } else {
                        const res = rectangleFromPoints(this.params[0], newPos);
                        this.params = [
                            { x: res[0], y: res[1] },
                            { x: res[0] + res[2], y: res[1] + res[3] },
                        ];
                        this.selectState = 2;
                    }
                } else if (this.active && this.currDraw < 4) {
                    const res = board.determineTile(
                        board.mouseCoords.x -
                            this.currLayer.layerOffset.x * board.zoomVal * 5,
                        board.mouseCoords.y -
                            this.currLayer.layerOffset.y * board.zoomVal * 5,
                        CoordModes.Center,
                    );
                    this.params.push({ x: res.x, y: res.y });
                    this.setNewObject();
                }
            }
        });
    }

    // Finalizes the current object and sends it to the server.
    setNewObject() {
        let tempObj: ObjectCreatePayload;
        if (this.currDraw < 4 && this.params.length === 2) {
            const res = rectangleFromPoints(this.params[0], this.params[1]);
            tempObj = {
                params: this.currParams,
                points: [
                    { x: res[0], y: res[1] },
                    { x: res[0] + res[2], y: res[1] },
                    { x: res[0] + res[2], y: res[1] + res[3] },
                    { x: res[0], y: res[1] + res[3] },
                ],
                colour: colourBox.getCurrColour(),
                layerId: board.activeLayer,
                objectId: -1,
                image: false,
                token: {
                    name: 'none',
                    colour: '#cccccc',
                    active: false,
                    movable: false,
                },
            };
        } else if (this.currDraw >= 4 && this.params.length > 2) {
            for (const pt of this.params) {
                pt.x -= this.currLayer.layerOffset.x;
                pt.y -= this.currLayer.layerOffset.y;
            }
            tempObj = {
                params: this.currParams,
                points: this.params,
                colour: colourBox.getCurrColour(),
                layerId: board.activeLayer,
                objectId: -1,
                image: false,
                token: {
                    name: 'none',
                    colour: '#cccccc',
                    active: false,
                    movable: false,
                },
            };
        } else {
            return;
        }
        serveInter.createObject({
            entity: Entity.Object,
            action: Action.Create,
            object: tempObj,
            userId: '-1',
            token: {
                name: 'na',
                colour: '#cccccc',
                active: false,
                movable: false,
            },
        });
        for (const pt of tempObj.points) {
            pt.x += this.currLayer.layerOffset.x;
            pt.y += this.currLayer.layerOffset.y;
        }
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
            return new BoardObject(
                -1,
                this.tempObject.colour,
                this.currParams,
                this.tempObject.points,
            );
        }
        if (this.selectMode) {
            if (this.params.length >= 1) {
                const res = board.determineTile(
                    board.mouseCoords.x,
                    board.mouseCoords.y,
                    CoordModes.Center,
                );
                const extParams = {
                    x: this.params[0].x + this.currLayer.layerOffset.x,
                    y: this.params[0].y + this.currLayer.layerOffset.y,
                };
                const res2 = rectangleFromPoints(extParams, res);
                const col = WHITE_50;
                return new BoardObject(
                    -1,
                    col,
                    {
                        ellipse: false,
                        fill: true,
                        close: true,
                        rect: true,
                    },
                    [
                        { x: res2[0], y: res2[1] },
                        { x: res2[0] + res2[2], y: res2[1] },
                        { x: res2[0] + res2[2], y: res2[1] + res2[3] },
                        { x: res2[0], y: res2[1] + res2[3] },
                    ],
                );
            }
        } else if (this.currDraw < 4 && this.params.length >= 1) {
            const res = board.determineTile(
                board.mouseCoords.x,
                board.mouseCoords.y,
                CoordModes.Center,
            );
            const extParams = {
                x: this.params[0].x + this.currLayer.layerOffset.x,
                y: this.params[0].y + this.currLayer.layerOffset.y,
            };
            const res2 = rectangleFromPoints(extParams, res);
            const col = colourBox.getCurrColour();
            return new BoardObject(-1, col, this.currParams, [
                { x: res2[0], y: res2[1] },
                { x: res2[0] + res2[2], y: res2[1] },
                { x: res2[0] + res2[2], y: res2[1] + res2[3] },
                { x: res2[0], y: res2[1] + res2[3] },
            ]);
        } else if (this.params.length >= 2 && this.currDraw >= 4) {
            const newObj = new BoardObject(
                -1,
                colourBox.getCurrColour(),
                this.currParams,
                this.params,
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
