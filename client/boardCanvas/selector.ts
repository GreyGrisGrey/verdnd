import { BoardObject } from './boardObject.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { Board, CoordModes } from './localBoard.ts';
import { WHITE_50 } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import { BoardLayer } from './boardLayer.ts';
import { rectangleFromPoints } from './boardDrawMode.ts';
const board = new Board();

export class Selector {
    active: boolean;
    start: Vec2;
    selectParams: Vec2[];
    selectState: number;
    currLayer: BoardLayer;
    constructor() {
        this.active = false;
        this.start = { x: 0, y: 0 };
        this.selectState = 0;
        this.currLayer = new BoardLayer(0, true, true, 0);
        this.selectParams = [];
    }

    activate(newLayer: BoardLayer) {
        if (newLayer !== this.currLayer) {
            this.currLayer = newLayer;
        }
        this.active = true;
        this.start = board.determineTile(
            board.mouseCoords.x -
                this.currLayer.layerOffset.x * board.zoomVal * 5,
            board.mouseCoords.y -
                this.currLayer.layerOffset.y * board.zoomVal * 5,
            CoordModes.Center,
        );
    }

    complete() {
        const newPos = board.determineTile(
            board.mouseCoords.x -
                this.currLayer.layerOffset.x * board.zoomVal * 5,
            board.mouseCoords.y -
                this.currLayer.layerOffset.y * board.zoomVal * 5,
            CoordModes.Center,
        );
        if (newPos.x === this.start.x && newPos.y === this.start.y) {
            this.selectParams = [this.start];
            this.selectState = 1;
        } else {
            const res = rectangleFromPoints(this.start, newPos);
            this.selectParams = [
                { x: res[0], y: res[1] },
                { x: res[0] + res[2], y: res[1] + res[3] },
            ];
            this.selectState = 2;
        }
        if (this.selectState === 0) {
            this.active = false;
        }
    }

    getTempObject(): BoardObject {
        const res = board.determineTile(
            board.mouseCoords.x,
            board.mouseCoords.y,
            CoordModes.Center,
        );
        const extParams = {
            x: this.start.x + this.currLayer.layerOffset.x,
            y: this.start.y + this.currLayer.layerOffset.y,
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

    deactivate() {
        this.active = false;
        this.start = { x: 0, y: 0 };
        this.selectState = 0;
    }
}
