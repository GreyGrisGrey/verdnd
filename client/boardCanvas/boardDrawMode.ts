import { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { Board, CoordModes } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import type {
    ObjectCreatePayload,
    ObjectParams,
} from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { TempStore } from '../serveInter.ts';
import { BoardLayer } from './boardLayer.ts';
import { ColourBox } from '../leftBar/colourBox.ts';
import { LayerMenu } from '../rightBar/layerBarMenu.ts';
import { ObjectMenu } from '../rightBar/objectBarMenu.ts';
import { Selector } from './selector.ts';
const selector = new Selector();
const layerMan = new LayerMenu();
const colourBox = new ColourBox();
const board = new Board();
const storedLayers: Map<number, BoardLayer> = new Map();
const can = getRequiredElement('board', HTMLCanvasElement);
const serveInter = new TempStore();
const objectMan = new ObjectMenu();

export function rectangleFromPoints(point1: Vec2, point2: Vec2): number[] {
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
    selectState: number;
    tempObject: ObjectCreatePayload | null;
    stickTemp: boolean;
    boxItems: HTMLButtonElement[];
    currParams: ObjectParams;
    currDraw: number;
    currLayer: BoardLayer;
    paste: boolean;

    constructor() {
        this.currDraw = 1;
        this.active = false;
        this.params = [];
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
        this.currLayer = new BoardLayer(0, true, true, 0);
        this.paste = false;
        this.addEventListeners();
        this.setUpBoxes();
        this.flipBoxes();
        this.toggleBoxes();
    }

    // Updates the currently active layer.
    updateLayer() {
        if (storedLayers.has(layerMan.currSelect)) {
            this.currLayer = storedLayers.get(layerMan.currSelect)!;
        } else {
            console.log(
                'Draw mode: requested layer does not exist on storedLayers',
            );
        }
    }

    // Sets up control buttons.
    setUpBoxes() {
        for (let i = 2; i < 9; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomDrawBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );

            this.boxItems[i - 2].addEventListener('click', () => {
                this.handleSwitchEvent((i - 1).toString());
                this.flipBoxes();
            });
        }
    }

    // Toggles functionality of control buttons.
    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
            box.style.left = '30px';
        }
        this.flipBoxes();
    }

    // Flips which control buttons are disabled.
    flipBoxes() {
        this.boxItems[0].disabled = !selector.active && this.currDraw === 1;
        this.boxItems[1].disabled = !selector.active && this.currDraw === 2;
        this.boxItems[2].disabled = !selector.active && this.currDraw === 3;
        this.boxItems[3].disabled = !selector.active && this.currDraw === 4;
        this.boxItems[4].disabled = this.params.length < 2;
        this.boxItems[5].disabled = this.params.length < 1;
        this.boxItems[6].disabled = !selector.active && this.currDraw === 7;
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        this.params = [];
        this.selectState = 0;
        this.toggleBoxes();
    }

    // Handles key press events when draw mode is active.
    handleSwitchEvent(key: string) {
        this.paste = false;
        if (key === '1') {
            this.currParams = {
                ellipse: false,
                fill: true,
                close: true,
                rect: true,
            };
            this.currDraw = 1;
        } else if (key === '2') {
            this.currParams = {
                ellipse: true,
                fill: true,
                close: true,
            };
            this.currDraw = 2;
        } else if (key === '3') {
            this.currParams = { ellipse: false, fill: true, close: true };
            this.currDraw = 3;
        } else if (key === '4') {
            this.currParams = { ellipse: false, fill: false, close: false };
            this.currDraw = 4;
        } else if (key === '5') {
            this.setNewObject();
        } else if (key === '7') {
            this.currDraw = 7;
            this.paste = true;
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
            this.currDraw >= 3
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
                if (this.currDraw < 3) {
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
                } else if (this.currDraw < 7) {
                    this.params.push(
                        board.determineTile(
                            board.mouseCoords.x,
                            board.mouseCoords.y,
                            CoordModes.Vertex,
                        ),
                    );
                    this.flipBoxes();
                } else {
                    objectMan.createObjectFromTemplate(
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
                }
            }
        });

        can.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                if (this.params.length === 0) {
                    return;
                } else if (this.active && this.currDraw < 3) {
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
        if (this.currDraw < 3 && this.params.length === 2) {
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
                layerId: layerMan.currSelect,
                objectId: -1,
                image: false,
                token: {
                    name: 'none',
                    colour: '#cccccc',
                    active: false,
                    movable: false,
                },
            };
        } else if (this.currDraw >= 3 && this.params.length > 2) {
            for (const pt of this.params) {
                pt.x -= this.currLayer.layerOffset.x;
                pt.y -= this.currLayer.layerOffset.y;
            }
            tempObj = {
                params: this.currParams,
                points: this.params,
                colour: colourBox.getCurrColour(),
                layerId: layerMan.currSelect,
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
                name: '',
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
    getTempObject(): BoardObject | undefined {
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
        if (this.currDraw < 3 && this.params.length >= 1) {
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
        } else if (this.params.length >= 2 && this.currDraw >= 3) {
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
        this.tempObject = null;
    }
}
