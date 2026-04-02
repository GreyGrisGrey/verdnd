import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import type { ObjectRecolourEvent, ObjectMoveEvent } from '../../shared/objectEvents.ts';
import { CoordModes } from './localBoard.ts';
import { SelectBall } from './selectBall.ts';
import { BoardLayer } from './boardLayer.ts';
import { GOLD } from '../../shared/colours.ts';
import { tempStore } from '../serveInter.ts';
import { ColourBox } from '../leftBar/colourBox.ts';
const colourBox = new ColourBox();
const board = new Board();
const can = getRequiredElement('board', HTMLCanvasElement);
const storedLayers: Map<number, BoardLayer> = new Map();
const ctx = can.getContext('2d') as CanvasRenderingContext2D;
const nameInput = getRequiredElement('tokenName', HTMLInputElement);
const fileInput = getRequiredElement('fileInput', HTMLInputElement);
const serveInter = new tempStore();

// Activates following a completed selection from draw mode or token mode.
export class BoardSelectMode {
    active: boolean;
    exitOnNextStep: boolean;
    selectedObjects: BoardObject[];
    selectClick: boolean;
    thirdOffset: Vec2;
    currColour: string;
    boxItems: HTMLButtonElement[];
    orbs: SelectBall[];
    currLayer: BoardLayer;
    currPath: Path2D;
    boxDraw: boolean;

    constructor() {
        this.active = false;
        this.exitOnNextStep = false;
        this.selectedObjects = [];
        this.selectClick = false;
        this.thirdOffset = { x: 0, y: 0 };
        this.currColour = 'none';
        this.boxItems = [];
        this.orbs = [];
        this.currLayer = new BoardLayer(0, true, true, 0);
        this.currPath = new Path2D();
        this.boxDraw = true;
        this.setUpBoxes();

        this.addEventListeners();
    }

    // Sets up bottom toolbar boxes.
    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomSelectBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            this.boxItems[i].addEventListener('click', () => {
                this.handleSwitchEvent(i.toString());
            });
        }
        this.toggleBoxes();
    }

    // Renames currently selected tokens.
    attemptRename() {
        for (const obj of this.selectedObjects) {
            if (obj.token.active) {
                const newToken = {
                    name: nameInput.value,
                    colour: obj.token.colour,
                    active: true,
                    movable: obj.token.movable,
                };
                obj.updateToken(newToken);
                serveInter.updateToken(newToken, obj.objectId);
            }
        }
    }

    // Recolours the edge of currently selected tokens.
    attemptTokenRecolour() {
        for (const obj of this.selectedObjects) {
            if (obj.token.active) {
                const newToken = {
                    name: obj.token.name,
                    colour: colourBox.getCurrColour(),
                    active: true,
                    movable: obj.token.movable,
                };
                obj.updateToken(newToken);
                serveInter.updateToken(newToken, obj.objectId);
            }
        }
    }

    // Turns the currently selected object into a token.
    tokenize() {
        for (const obj of this.selectedObjects) {
            if (!obj.token.active) {
                const newToken = {
                    name: nameInput.value,
                    colour: colourBox.getCurrColour(),
                    active: true,
                    movable: true,
                };
                obj.updateToken(newToken);
                serveInter.updateToken(newToken, obj.objectId);
            }
        }
    }

    // Updates the visibility of bottom toolbar boxes.
    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
        }
    }

    // Handles any event switching between different select tools.
    handleSwitchEvent(key: string) {
        if (key === 'Escape' || key === '1') {
            this.exitOnNextStep = true;
        } else if (key === 'Backspace' || key === 'Delete' || key === '2') {
            const idList: number[] = [];
            for (const obj of this.selectedObjects) {
                idList.push(obj.objectId);
            }
            serveInter.destroyObjects(idList);
            this.exitOnNextStep = true;
        } else if (key === '3') {
            this.recolour();
        } else if (key === '4') {
            this.layerSwitch(true);
        } else if (key === '5') {
            this.layerSwitch(false);
        } else if (key === '6') {
            this.tokenize();
        } else if (key === '7') {
            this.attemptRename();
        } else if (key === '8') {
            this.attemptTokenRecolour();
        } else if (key === '9' && this.selectedObjects.length === 1) {
            for (const obj of this.orbs) {
                obj.deconstruct();
            }
            this.orbs = [];
            this.setUpCorners();
            this.updateCornerOffset();
            this.boxDraw = true;
        } else if (key === '0' && this.selectedObjects.length === 1) {
            for (const obj of this.orbs) {
                obj.deconstruct();
            }
            this.orbs = [];
            this.setUpPoints();
            this.updateCornerOffset();
            this.boxDraw = false;
        } else if (key === 'b' && this.selectedObjects.length === 1) {
            fileInput.click();
        } else if (key === 'n' && this.selectedObjects.length === 1) {
            serveInter.removeFile(this.selectedObjects[0].objectId);
        }
    }

    // Moves selected objects to a new layer.
    // Also of course checks if such a layer exists.
    layerSwitch(up: boolean) {
        const curr = this.selectedObjects[0].layerId;
        if (curr === 0 && !up) {
            return;
        } else if (curr === storedLayers.size - 1 && up) {
            return;
        }
        for (const obj of this.selectedObjects) {
            serveInter.changeObjLayer(obj, up);
        }
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        for (const obj of this.selectedObjects) {
            obj.setSelected(false);
        }
        this.active = setOn;
        this.selectedObjects = [];
        for (const obj of this.orbs) {
            obj.deconstruct();
        }
        this.orbs = [];
        this.currPath = new Path2D();
        this.exitOnNextStep = false;
        this.currColour = colourBox.getCurrColour();
        this.selectClick = board.leftMouseDown;
        this.thirdOffset = { x: 0, y: 0 };
        if (serveInter.isGm) {
            this.toggleBoxes();
        }
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        fileInput.addEventListener('change', () => {
            serveInter.uploadFile(this.selectedObjects[0].objectId);
        });

        can.addEventListener('keydown', (event) => {
            if (this.active) {
                this.handleSwitchEvent(event.key);
            }
        });

        can.addEventListener('mousemove', (event) => {
            if (this.active && this.selectClick) {
                const change: Vec2 = {
                    x: Math.round(board.mouseCoords.x - event.clientX),
                    y: Math.round(board.mouseCoords.y - event.clientY),
                };
                if (!board.rightMouseDown) {
                    this.thirdOffset.x -= change.x;
                    this.thirdOffset.y -= change.y;
                }
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                const point = board.determineTile(
                    event.clientX -
                        this.currLayer.layerOffset.x * board.zoomVal * 5,
                    event.clientY -
                        this.currLayer.layerOffset.y * board.zoomVal * 5,
                    CoordModes.Center,
                );
                for (const candidate of this.selectedObjects) {
                    if (
                        'isPointInside' in candidate &&
                        candidate.isPointInside(point)
                    ) {
                        this.selectClick = true;
                    }
                }
            }
        });

        can.addEventListener('mouseup', (event) => {
            if (this.active && this.selectClick && event.button === 0) {
                this.moveObjects();
                this.selectClick = false;
                if (
                    this.selectedObjects.length === 1 &&
                    this.selectedObjects[0].hasToken()
                ) {
                    this.exitOnNextStep = true;
                }
            }
        });

        // document.addEventListener,
        // specifically because it's for orb management and those are HTML elements rather than board objects.
        document.addEventListener('mouseup', (event) => {
            if (this.active && event.button === 0) {
                if (this.orbs.length > 0) {
                    this.updateObject(true);
                }
            }
        });
    }

    // Checks if the currently selected object has been modified, calls one of two child functions if so.
    // Only actually updates the object if commit is true.
    updateObject(commit: boolean) {
        let modification = false;
        let movedOrb = this.orbs[0];
        for (const orb of this.orbs) {
            if (orb.moving) {
                movedOrb = orb;
                if (commit) {
                    movedOrb.moving = false;
                }
                modification = true;
                break;
            }
        }
        if (!modification) {
            return;
        }
        if (this.boxDraw) {
            this.resizeObject(movedOrb, commit);
        } else {
            this.restructureObject(movedOrb, commit);
        }
    }

    // Resizes the currently selected object.
    // Only updates the object for the server if commit is true.
    resizeObject(movedOrb: SelectBall, commit: boolean) {
        const currObj = this.selectedObjects[0];
        const point = board.determineTile(
            board.mouseCoords.x -
                this.currLayer.layerOffset.x * board.zoomVal * 5,
            board.mouseCoords.y -
                this.currLayer.layerOffset.y * board.zoomVal * 5,
            CoordModes.Vertex,
        );
        if (commit) {
            currObj.updateSize(point, movedOrb.id);
        }
        const tl = currObj.getTopLeft();
        const br = currObj.getBottomRight();
        const newTl = { x: tl.x, y: tl.y };
        const newBr = { x: br.x, y: br.y };
        if (!commit) {
            newTl.x = movedOrb.id === 0 || movedOrb.id === 3 ? point.x : tl.x;
            newTl.y = movedOrb.id === 0 || movedOrb.id === 1 ? point.y : tl.y;
            newBr.x = movedOrb.id === 2 || movedOrb.id === 1 ? point.x : br.x;
            newBr.y = movedOrb.id === 2 || movedOrb.id === 3 ? point.y : br.y;
        }
        for (const orb of this.orbs) {
            orb.resize(newTl, newBr);
        }
        return;
    }

    // Restructures a single point on the currently selected object.
    // Only updates the object for the server if commit is true.
    restructureObject(movedOrb: SelectBall, commit: boolean) {
        const point = board.determineTile(
            board.mouseCoords.x -
                this.currLayer.layerOffset.x * board.zoomVal * 5,
            board.mouseCoords.y -
                this.currLayer.layerOffset.y * board.zoomVal * 5,
            CoordModes.Vertex,
        );
        movedOrb.coord = point;
        if (commit) {
            this.selectedObjects[0].updatePoint(point.x, point.y, movedOrb.id);
        }
        return;
    }

    // Moves each selected object individually.
    moveObjects() {
        const point = board.determineTile(
            board.offset.x + this.thirdOffset.x,
            board.offset.y + this.thirdOffset.y,
            CoordModes.Vertex,
        );
        const moveList: ObjectMoveEvent[] = [];
        for (const obj of this.selectedObjects) {
            moveList.push({
                entity: Entity.Object,
                action: Action.Move,
                objectId: obj.objectId,
                x: point.x,
                y: point.y,
            });
        }
        serveInter.moveObjects(moveList);
        this.updateCornerPos(point);
        this.thirdOffset.x = 0;
        this.thirdOffset.y = 0;
    }

    // Recolours each selected object individually.
    recolour() {
        const recolourList: ObjectRecolourEvent[] = [];
        for (const obj of this.selectedObjects) {
            recolourList.push({
                entity: Entity.Object,
                action: Action.Recolour,
                objectId: obj.objectId,
                colour: colourBox.getCurrColour(),
            });
            obj.setColour(colourBox.getCurrColour());
        }
        serveInter.recolourObjects(recolourList, this.currColour);
        this.currColour = colourBox.getCurrColour();
    }

    // Sets the list of currently selected objects.
    setSelected(newObjs: BoardObject[]) {
        this.selectedObjects = newObjs;
        this.boxItems[9].disabled = this.selectedObjects.length > 1;
        this.boxItems[0].disabled =
            this.selectedObjects.length > 1 ||
            this.selectedObjects[0].drawParams.ellipse;
        this.currLayer = storedLayers.get(newObjs[0].layerId)!;
        for (const obj of this.selectedObjects) {
            obj.setSelected(true);
        }
    }

    // Updates orbs when an object is moved, allowing object movement to be clean when resize/restructure is selected.
    updateCornerPos(point: Vec2) {
        if (this.orbs.length === 0) {
            return;
        }
        for (const orb of this.orbs) {
            orb.updateOrbOffset(point.x, point.y);
        }
    }

    // Updates the location of the orbs on the document.
    updateCornerOffset() {
        if (this.orbs.length === 0) {
            return;
        }
        const res = {
            x:
                board.offset.x +
                this.currLayer.layerOffset.x * board.zoomVal * 5 +
                this.thirdOffset.x,
            y:
                board.offset.y +
                this.currLayer.layerOffset.y * board.zoomVal * 5 +
                this.thirdOffset.y,
        };
        for (const orb of this.orbs) {
            orb.updateDocumentOffset(board.zoomVal * 5, res.x, res.y);
        }
    }

    // Sets up corners for resizing an object.
    setUpCorners() {
        const topLeft = this.selectedObjects[0].getTopLeft();
        const bottomRight = this.selectedObjects[0].getBottomRight();
        this.orbs.push(new SelectBall(topLeft.x, topLeft.y, 0));
        this.orbs.push(new SelectBall(bottomRight.x, topLeft.y, 1));
        this.orbs.push(new SelectBall(bottomRight.x, bottomRight.y, 2));
        this.orbs.push(new SelectBall(topLeft.x, bottomRight.y, 3));
    }

    // Sets up points for restructuring an object.
    setUpPoints() {
        let count = 0;
        const currObj = this.selectedObjects[0];
        if (!currObj.drawParams.ellipse) {
            for (const pt of currObj.points) {
                this.orbs.push(new SelectBall(pt.x, pt.y, count));
                count++;
            }
        }
    }

    // Updates the yellow outline used by restructure/resize.
    updatePath() {
        this.currPath = new Path2D();
        const currSpecs = this.selectedObjects[0].currPathSpecs;
        this.currPath.moveTo(
            Math.round(
                this.orbs[0].coord.x * (board.zoomVal * 5) + currSpecs[1],
            ),
            Math.round(
                this.orbs[0].coord.y * (board.zoomVal * 5) + currSpecs[2],
            ),
        );
        for (const pt of this.orbs) {
            this.currPath.lineTo(
                Math.round(pt.coord.x * (board.zoomVal * 5) + currSpecs[1]),
                Math.round(pt.coord.y * (board.zoomVal * 5) + currSpecs[2]),
            );
        }
        this.currPath.closePath();
        if (this.selectedObjects[0].drawParams.close) {
            this.currPath.closePath();
        }
    }

    // Draws the outline surrounding a resized/restructured object.
    drawSkeleton() {
        if (this.selectedObjects.length === 1) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 3;
            ctx.stroke(this.currPath);
        }
    }

    // Performs one step of updates, mainly for orb purposes.
    step() {
        if (this.orbs.length > 0) {
            this.updateObject(false);
            this.updatePath();
        }
        this.updateCornerOffset();
        this.drawSkeleton();
    }
}
