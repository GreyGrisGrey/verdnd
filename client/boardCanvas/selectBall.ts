import type { Vec2 } from '../../shared/coords.ts';
import { GOLD } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
const body = getRequiredElement('body', HTMLElement);

export class SelectBall {
    coord: Vec2;
    element: HTMLElement;
    id: number;
    moving: boolean;
    constructor(x: number, y: number, id: number) {
        this.coord = { x, y };
        this.element = document.createElement('div');
        body.append(this.element);
        this.id = id;
        this.moving = false;

        this.element.style.position = 'absolute';
        this.element.style.border = 'none';
        this.element.style.borderRadius = '50%';
        this.element.style.width = '20px';
        this.element.style.height = '20px';
        this.element.style.zIndex = '1';
        this.element.style.visibility = 'visible';
        this.element.style.backgroundColor = GOLD;
        this.setEventListeners();
    }

    setEventListeners() {
        this.element.addEventListener('mousedown', (event) => {
            this.moving = true;
        });
    }

    updateDocumentOffset(zoom: number, newX: number, newY: number) {
        this.element.style.left = this.coord.x * zoom + newX - 10 + 'px';
        this.element.style.top = this.coord.y * zoom + newY - 10 + 'px';
    }

    updateOrbOffset(newX: number, newY: number) {
        this.coord.x += newX;
        this.coord.y += newY;
    }

    updateOrbLoc(newCoord: Vec2) {
        this.coord = newCoord;
    }

    resize(tl: Vec2, br: Vec2) {
        if (this.id === 0) {
            this.coord = tl;
        } else if (this.id === 2) {
            this.coord = br;
        } else if (this.id === 1) {
            this.coord.x = br.x;
            this.coord.y = tl.y;
        } else if (this.id === 3) {
            this.coord.x = tl.x;
            this.coord.y = br.y;
        }
    }

    deconstruct() {
        this.element.remove();
    }
}
