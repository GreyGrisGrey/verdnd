import type * as BoardLayer from './boardLayer.ts';
import { ObjType } from './boardObject.ts';
import type { Vec2 } from './coords.ts';
import type { Board } from './localBoard.ts';
import { getRequiredElement } from '../dom.ts';

const can = getRequiredElement('board', HTMLCanvasElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);

// Activates following a completed selection from draw mode or token mode.
export class BoardSelectMode {
  board: Board;
  active: boolean;
  exitOnNextStep: boolean;
  selectedObjects: BoardLayer.LayerObject[];
  selectClick: boolean;
  thirdOffset: Vec2;
  currColour: string;
  moveReady: boolean;

  constructor(parentBoard: Board) {
    this.board = parentBoard;
    this.active = false;
    this.selectedObjects = [];
    this.exitOnNextStep = false;
    this.selectClick = false;
    this.addEventListeners();
    this.thirdOffset = { x: 0, y: 0 };
    this.currColour = 'none';
    this.moveReady = false;
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
          if ('isPointInside' in candidate && candidate.isPointInside(point)) {
            this.selectClick = true;
            break;
          }
        }
      }
    });

    can.addEventListener('mouseup', () => {
      if (this.active && this.selectClick) {
        this.moveReady = true;
        if (
          this.selectedObjects.length === 1 &&
          this.selectedObjects[0].objType === ObjType.Token
        ) {
          this.exitOnNextStep = true;
          this.board.modeMan.moveFlag = true;
        }
      }
    });

    document.addEventListener('keydown', (event) => {
      if (this.active && event.key === 'Escape') {
        this.exitOnNextStep = true;
      }
    });
  }

  getText() {
    return 'nah';
  }

  setSelected(newObjs: BoardLayer.LayerObject[]) {
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
      if (candidate.objType !== ObjType.Token) {
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

  canEditColour() {
    if (colourSquare.style.background !== this.currColour) {
      this.currColour = colourSquare.style.background;
      return true;
    }
    return false;
  }

  piecesMoved() {
    this.moveReady = false;
    this.selectClick = false;
    this.thirdOffset = { x: 0, y: 0 };
  }
}
