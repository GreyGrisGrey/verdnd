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
        // If you don't add event.preventDefault here then all the text gets selected everywhere.
        // This didn't use to be the case, but it is now, and I don't know why.
        this.element.addEventListener('mousedown', (event) => {
            this.moving = true;
            event.preventDefault();
        });

        this.element.addEventListener('dragstart', (event) => {
            event.preventDefault();
        });
    }

    // Updates the actual underlying HTML button's location on the document.
    updateDocumentOffset(zoom: number, newX: number, newY: number) {
        this.element.style.left = this.coord.x * zoom + newX - 10 + 'px';
        this.element.style.top = this.coord.y * zoom + newY - 10 + 'px';
    }

    // Updates the coordinates position relative to two new values
    updateOrbOffset(newX: number, newY: number) {
        this.coord.x += newX;
        this.coord.y += newY;
    }

    // Updates the coordinates position to a new one.
    updateOrbLoc(newCoord: Vec2) {
        this.coord = newCoord;
    }

    // Says resize, doesn't resize anything, just updates the coordinates of the orb to a corner of the underlying object.
    // Only used by the select-resize tool.
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

    // Deconstructs the orb, readying it for deletion.
    deconstruct() {
        this.element.remove();
    }
}
