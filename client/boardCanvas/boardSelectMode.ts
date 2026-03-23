import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import type { ObjectRecolourEvent } from '../../shared/objectEvents.ts';
import { stringToColInst } from '../../shared/colours.ts';
import { CoordModes } from './localBoard.ts';
import { SelectBall } from './selectBall.ts';
import { BoardLayer } from './boardLayer.ts';
import { GOLD } from '../../shared/colours.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;
const colourSquare = getRequiredElement('colourSquare', HTMLElement);
const nameInput = getRequiredElement('tokenName', HTMLInputElement);

// Activates following a completed selection from draw mode or token mode.
export class BoardSelectMode {
    board: Board;
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

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.exitOnNextStep = false;
        this.selectedObjects = [];
        this.selectClick = false;
        this.thirdOffset = { x: 0, y: 0 };
        this.currColour = 'none';
        this.boxItems = [];
        this.orbs = [];
        this.currLayer = new BoardLayer(0, true, true);
        this.currPath = new Path2D();
        this.boxDraw = true;
        this.setUpBoxes();

        this.addEventListeners();
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomSelectBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            if (i > 3 && i < 6) {
                this.boxItems[i].disabled = true;
            }
            this.boxItems[i].addEventListener('click', () => {
                this.handleSwitchEvent(i.toString());
            });
        }
    }

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
                this.board.serveInter.updateToken(newToken, obj.objectId);
            }
        }
    }

    attemptTokenRecolour() {
        for (const obj of this.selectedObjects) {
            if (obj.token.active) {
                const newToken = {
                    name: obj.token.name,
                    colour: colourSquare.style.background,
                    active: true,
                    movable: obj.token.movable,
                };
                obj.updateToken(newToken);
                this.board.serveInter.updateToken(newToken, obj.objectId);
            }
        }
    }

    tokenize() {
        for (const obj of this.selectedObjects) {
            if (!obj.token.active) {
                const newToken = {
                    name: nameInput.value,
                    colour: colourSquare.style.background,
                    active: true,
                    movable: true,
                };
                obj.updateToken(newToken);
                this.board.serveInter.updateToken(newToken, obj.objectId);
            }
        }
    }

    toggleBoxes() {
        for (const box of this.boxItems) {
            box.style.visibility = this.active ? 'visible' : 'hidden';
            box.style.pointerEvents = this.active ? 'auto' : 'none';
        }
    }

    handleSwitchEvent(key: string) {
        if (key === 'Escape' || key === '1') {
            this.exitOnNextStep = true;
        } else if (key === 'Backspace' || key === '2') {
            const idList: number[] = [];
            for (const obj of this.selectedObjects) {
                idList.push(obj.objectId);
            }
            this.board.serveInter.destroyObjects(idList);
            this.exitOnNextStep = true;
        } else if (key === '3') {
            this.recolour();
        } else if (key === '6') {
            this.tokenize();
        } else if (key === '7') {
            this.attemptRename();
        } else if (key === '8') {
            this.attemptTokenRecolour();
        } else if (key === '9') {
            for (const obj of this.orbs) {
                obj.deconstruct();
            }
            this.orbs = [];
            this.setUpCorners();
            this.updateCornerOffset();
            this.boxDraw = true;
        } else if (key === '0') {
            for (const obj of this.orbs) {
                obj.deconstruct();
            }
            this.orbs = [];
            this.setUpPoints();
            this.updateCornerOffset();
            this.boxDraw = false;
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
        this.exitOnNextStep = false;
        this.currColour = colourSquare.style.background;
        this.selectClick = this.board.leftMouseDown;
        this.thirdOffset = { x: 0, y: 0 };
        if (this.board.serveInter.isGm) {
            this.toggleBoxes();
        }
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        can.addEventListener('keydown', (event) => {
            if (this.active) {
                this.handleSwitchEvent(event.key);
            }
        });

        can.addEventListener('mousemove', (event) => {
            if (this.active && this.selectClick) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                if (!this.board.rightMouseDown) {
                    this.thirdOffset.x -= change.x;
                    this.thirdOffset.y -= change.y;
                }
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active && event.button === 0) {
                const point = this.board.determineTile(
                    event.clientX,
                    event.clientY,
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
                this.updateCornerOffset();
            } else if (this.active && event.button === 0) {
                if (this.orbs.length > 0) {
                    this.updateObject();
                }
            }
        });
    }

    updateObject() {
        let modification = false;
        let movedOrb = this.orbs[0];
        for (const orb of this.orbs) {
            if (orb.moving) {
                movedOrb = orb;
                orb.moving = false;
                modification = true;
                break;
            }
        }
        console.log(modification);
        if (!modification) {
            return;
        }
        if (this.boxDraw) {
            this.resizeObject(movedOrb);
        } else {
            this.restructureObject(movedOrb);
        }
    }

    resizeObject(movedOrb: SelectBall) {}

    restructureObject(movedOrb: SelectBall) {
        const newCoord = this.board.determineTile(
            this.board.mouseCoords.x,
            this.board.mouseCoords.y,
            CoordModes.Vertex,
        );
        this.selectedObjects[0].updatePoint(
            newCoord.x,
            newCoord.y,
            movedOrb.id,
        );
        movedOrb.updateOrbLoc(newCoord);
    }

    // Moves each selected object individually.
    moveObjects() {
        const point = this.board.determineTile(
            this.board.offset.x + this.thirdOffset.x,
            this.board.offset.y + this.thirdOffset.y,
            CoordModes.Vertex,
        );
        const moveList = [];
        for (const obj of this.selectedObjects) {
            moveList.push({
                entity: Entity.Object,
                action: Action.Move,
                objectId: obj.objectId,
                x: point.x,
                y: point.y,
            });
        }
        this.board.serveInter.moveObjects(moveList as any);
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
                colour: stringToColInst(colourSquare.style.background),
            });
            obj.setColour(colourSquare.style.background);
        }
        this.board.serveInter.recolourObjects(
            recolourList,
            stringToColInst(this.currColour),
        );
        this.currColour = colourSquare.style.background;
    }

    // Sets the list of currently selected objects.
    setSelected(newObjs: BoardObject[]) {
        this.selectedObjects = newObjs;
        this.boxItems[9].disabled = this.selectedObjects.length > 1;
        this.boxItems[0].disabled = this.selectedObjects.length > 1;
        this.currLayer = this.board.layerMap.get(newObjs[0].layerId)!;
        for (const obj of this.selectedObjects) {
            obj.setSelected(true);
        }
    }

    updateCornerPos(point: Vec2) {
        if (this.orbs.length === 0) {
            return;
        }
        for (const orb of this.orbs) {
            orb.updateOrbOffset(point.x, point.y);
        }
    }

    updateCornerOffset() {
        if (this.orbs.length === 0) {
            return;
        }
        const res = {
            x:
                this.board.offset.x +
                this.currLayer.layerOffset.x +
                this.thirdOffset.x,
            y:
                this.board.offset.y +
                this.currLayer.layerOffset.y +
                this.thirdOffset.y,
        };
        for (const orb of this.orbs) {
            orb.updateDocumentOffset(this.board.zoomVal * 5, res.x, res.y);
        }
        if (!this.boxDraw) {
            const topLeft = this.selectedObjects[0].getTopLeft();
            const bottomRight = this.selectedObjects[0].getBottomRight();
            this.currPath = new Path2D();
            this.currPath.moveTo(
                topLeft.x * (this.board.zoomVal * 5) + res.x,
                topLeft.y * (this.board.zoomVal * 5) + res.y,
            );
            this.currPath.lineTo(
                bottomRight.x * (this.board.zoomVal * 5) + res.x,
                topLeft.y * (this.board.zoomVal * 5) + res.y,
            );
            this.currPath.lineTo(
                bottomRight.x * (this.board.zoomVal * 5) + res.x,
                bottomRight.y * (this.board.zoomVal * 5) + res.y,
            );
            this.currPath.lineTo(
                topLeft.x * (this.board.zoomVal * 5) + res.x,
                bottomRight.y * (this.board.zoomVal * 5) + res.y,
            );
            this.currPath.closePath();
        }
    }

    setUpCorners() {
        const topLeft = this.selectedObjects[0].getTopLeft();
        const bottomRight = this.selectedObjects[0].getBottomRight();
        this.orbs.push(new SelectBall(topLeft.x, topLeft.y, 0));
        this.orbs.push(new SelectBall(bottomRight.x, topLeft.y, 1));
        this.orbs.push(new SelectBall(bottomRight.x, bottomRight.y, 2));
        this.orbs.push(new SelectBall(topLeft.x, bottomRight.y, 3));
    }

    setUpPoints() {
        let count = 0;
        const currObj = this.selectedObjects[0];
        for (const pt of currObj.points) {
            this.orbs.push(
                new SelectBall(
                    pt.x * currObj.scale.x + currObj.offset.x,
                    pt.y * currObj.scale.y + currObj.offset.y,
                    count,
                ),
            );
            count++;
        }
    }

    drawSkeleton() {
        if (this.selectedObjects.length === 1) {
            if (!this.boxDraw) {
                this.currPath = this.selectedObjects[0].currPath;
            }
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 3;
            ctx.stroke(this.currPath);
        }
    }
}
