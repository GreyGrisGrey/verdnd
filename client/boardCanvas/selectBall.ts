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
        this.element.style.zIndex = '5';
        this.element.style.visibility = 'visible';
        this.element.style.backgroundColor = GOLD;
        this.setEventListeners();
    }

    setEventListeners() {
        this.element.addEventListener('mousedown', (event) => {
            this.moving = true;
            console.log(event.button);
            console.log('moving');
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

    deconstruct() {
        this.element.remove();
    }
}
