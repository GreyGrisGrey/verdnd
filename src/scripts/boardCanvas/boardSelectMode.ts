import type { BoardObject } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';
import { Action, Entity, Shape } from '../objectEvents.ts';
import { actions } from 'astro:actions';

const can = getRequiredElement('board', HTMLCanvasElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

// Activates following a completed selection from draw mode or token mode.
export class BoardSelectMode {
    board: Board;
    active: boolean;
    exitOnNextStep: boolean;
    selectedObjects: BoardObject[];
    selectClick: boolean;
    thirdOffset: Vec2;
    currColour: string;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.selectedObjects = [];
        this.exitOnNextStep = false;
        this.selectClick = false;
        this.addEventListeners();
        this.thirdOffset = { x: 0, y: 0 };
        this.currColour = 'none';
    }

    flipListeners(setOn: boolean) {
        for (const obj of this.selectedObjects) {
            obj.setSelected(false);
        }
        this.active = setOn;
        this.selectedObjects = [];
        this.exitOnNextStep = false;
        this.currColour = colourSquare.style.background;
        this.selectClick = this.board.leftMouseDown;
        this.thirdOffset = { x: 0, y: 0 };
    }

    addEventListeners() {
        can.addEventListener('mousemove', (event) => {
            if (this.active && this.selectClick) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                this.thirdOffset.x -= change.x;
                this.thirdOffset.y -= change.y;
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active) {
                const point = this.board.determineTile(
                    event.clientX,
                    event.clientY,
                    false,
                );
                for (const candidate of this.selectedObjects) {
                    if (
                        'isPointInside' in candidate &&
                        candidate.isPointInside(point)
                    ) {
                        this.selectClick = true;
                        break;
                    }
                }
            }
        });

        can.addEventListener('mouseup', () => {
            if (this.active && this.selectClick) {
                this.moveObjects()
                this.selectClick = false
                if (
                    this.selectedObjects.length === 1 &&
                    this.selectedObjects[0].objType === Shape.Token
                ) {
                    this.exitOnNextStep = true;
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (this.active && event.key === 'Escape') {
                this.exitOnNextStep = true;
            } else if (this.active && event.key === 'Backspace') {
                const idList: number[] = [];
                for (const obj of this.selectedObjects) {
                    idList.push(obj.objectId)
                }
                actions.boardActions.destroyObjects(idList)
                this.exitOnNextStep = true
            }
        });
    }
    
    moveObjects() {
        const point = this.board.determineTile(
                    this.board.originCoords.x + this.thirdOffset.x,
                    this.board.originCoords.y + this.thirdOffset.y,
                    true,
                );
        for (const i of this.selectedObjects) {
            actions.boardActions.moveObject({
                entity: Entity.Object,
                action: Action.Move,
                objectId: i.objectId,
                x: point.x,
                y: point.y
            })
        }
        this.thirdOffset.x = 0
        this.thirdOffset.y = 0
    }

    getText() {
        return 'nah';
    }

    setSelected(newObjs: BoardObject[]) {
        this.selectedObjects = newObjs;
        for (const obj of this.selectedObjects) {
            obj.setSelected(true);
        }
    }

    draw(
        ctx: CanvasRenderingContext2D,
        squareSize: number,
        offset: Vec2,
        offset2: Vec2,
    ) {
        const outlineOffset: Vec2 = {
            x: offset.x + offset2.x + this.thirdOffset.x,
            y: offset.y + offset2.y + this.thirdOffset.y,
        };
        for (const candidate of this.selectedObjects) {
            if (candidate.objType !== Shape.Token) {
                if ('drawOutline' in candidate) {
                    candidate.drawOutline(ctx, squareSize, outlineOffset);
                }
                candidate.draw(ctx, squareSize, outlineOffset);
                candidate.selected = true;
            } else {
                if ('drawOutline' in candidate) {
                    candidate.drawOutline(ctx, squareSize, outlineOffset);
                }
                candidate.selected = true;
            }
        }
    }
}
