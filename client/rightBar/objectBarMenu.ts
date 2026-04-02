import { BoardObject } from '../boardCanvas/boardObject.ts';
import { getRequiredElement } from '../dom.ts';
const topHalf = getRequiredElement('topObjBox', HTMLElement);
const bottomHalf = getRequiredElement('bottomObjBox', HTMLElement);
const objBox = getRequiredElement('objBox', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);

interface ObjTemplate {
    container: HTMLCanvasElement;
    rename: HTMLInputElement;
    recol: HTMLButtonElement;
    recolEdge: HTMLButtonElement;
    activeCheck: HTMLInputElement;
    swap: HTMLButtonElement;
    currObj: BoardObject | null;
    updateImg: HTMLButtonElement;
    removeImg: HTMLButtonElement;
}

export class ObjectMenu {
    active: boolean;
    loadedActive: boolean;
    currTemplate: ObjTemplate;
    loadedTemplate: ObjTemplate;

    constructor() {
        this.active = false;
        this.loadedActive = false;
        this.currTemplate = this.buildTemplatePrimary();
        this.currTemplate.currObj!.updateToken({
            name: 'Squonch',
            movable: true,
            active: true,
            colour: 'none',
        });
        this.loadedTemplate = this.buildTemplateSecondary();
        this.currTemplate.swap.style.visibility = 'hidden';
        this.currTemplate.swap.style.pointerEvents = 'none';
    }

    buildTemplatePrimary(): ObjTemplate {
        return {
            currObj: new BoardObject(
                -5,
                '#cccccc',
                { ellipse: true, fill: true, close: true },
                [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 0, y: 1 },
                ],
            ),
            rename: getRequiredElement('renameTopObj', HTMLInputElement),
            recol: getRequiredElement('recolTopObj', HTMLButtonElement),
            recolEdge: getRequiredElement('recolTopEdge', HTMLButtonElement),
            activeCheck: getRequiredElement('setActiveTop', HTMLInputElement),
            swap: getRequiredElement('copyTopFromBottom', HTMLButtonElement),
            container: getRequiredElement('topObjContainer', HTMLCanvasElement),
            updateImg: getRequiredElement('updateTopImage', HTMLButtonElement),
            removeImg: getRequiredElement('removeTopImage', HTMLButtonElement),
        };
    }

    buildTemplateSecondary(): ObjTemplate {
        return {
            currObj: null,
            rename: getRequiredElement('renameBottomObj', HTMLInputElement),
            recol: getRequiredElement('recolBottomObj', HTMLButtonElement),
            recolEdge: getRequiredElement('recolBottomEdge', HTMLButtonElement),
            activeCheck: getRequiredElement(
                'setActiveBottom',
                HTMLInputElement,
            ),
            swap: getRequiredElement('copyBottomFromTop', HTMLButtonElement),
            container: getRequiredElement(
                'bottomObjContainer',
                HTMLCanvasElement,
            ),
            updateImg: getRequiredElement(
                'updateBottomImage',
                HTMLButtonElement,
            ),
            removeImg: getRequiredElement(
                'removeBottomImage',
                HTMLButtonElement,
            ),
        };
    }

    disableSecondary() {
        bottomHalf.style.visibility = 'hidden';
        bottomHalf.style.pointerEvents = 'none';
        this.currTemplate.swap.style.visibility = 'hidden';
        this.currTemplate.swap.style.pointerEvents = 'none';
        this.loadedActive = false;
    }

    updateSecondary(newObject: BoardObject) {
        this.loadedTemplate.currObj = newObject;
        bottomHalf.style.visibility = 'inherit';
        bottomHalf.style.pointerEvents = 'auto';
        this.currTemplate.swap.style.visibility = 'inherit';
        this.currTemplate.swap.style.pointerEvents = 'auto';
        this.loadedActive = true;
        this.draw();
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        objBox.style.visibility = newAct ? 'inherit' : 'hidden';
        objBox.style.pointerEvents = newAct ? 'auto' : 'none';
    }

    draw() {
        if (this.currTemplate.currObj) {
            const curr = this.currTemplate.currObj;
            const tl = curr.getTopLeft();
            const br = curr.getBottomRight();
            const ctx = this.currTemplate.container.getContext('2d')!;
            ctx.clearRect(0, 0, 100, 100);
            const size = { x: br.x - tl.x, y: br.y - tl.y };
            const scale = Math.min(100 / size.x, 100 / size.y);
            const offset = { x: scale * size.x, y: scale * size.y };
            curr.draw(ctx, scale, {
                x: -tl.x * scale + (100 - offset.x) / 2,
                y: -tl.y * scale + (100 - offset.y) / 2,
            });
        }
        if (this.loadedActive && this.loadedTemplate.currObj) {
            const curr = this.loadedTemplate.currObj;
            const tl = curr.getTopLeft();
            const br = curr.getBottomRight();
            const ctx = this.loadedTemplate.container.getContext('2d')!;
            ctx.clearRect(0, 0, 100, 100);
            const size = { x: br.x - tl.x, y: br.y - tl.y };
            const scale = Math.min(100 / size.x, 100 / size.y);
            const offset = { x: scale * size.x, y: scale * size.y };
            curr.draw(ctx, scale, {
                x: -tl.x * scale + (100 - offset.x) / 2,
                y: -tl.y * scale + (100 - offset.y) / 2,
            });
        }
    }

    step(height: number) {
        const newHeight = `${(height / 2).toString()}px`;
        topHalf.style.height = newHeight;
        bottomHalf.style.height = newHeight;
        bottomHalf.style.top = newHeight;
        this.draw();
    }
}
