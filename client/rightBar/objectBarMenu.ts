import { BoardObject } from '../boardCanvas/boardObject.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { ColourBox } from '../leftBar/colourBox.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
const topHalf = getRequiredElement('topObjBox', HTMLElement);
const bottomHalf = getRequiredElement('bottomObjBox', HTMLElement);
const objBox = getRequiredElement('objBox', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);
const serveInter = new tempStore();
const colourBox = new ColourBox();

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
        this.currTemplate.rename.value = this.currTemplate.currObj!.token.name;
        this.addEventListeners(this.currTemplate, true);
        this.addEventListeners(this.loadedTemplate, false);
    }

    addEventListeners(temp: ObjTemplate, top: boolean) {
        temp.rename.addEventListener('change', () => {
            if (temp.currObj) {
                temp.currObj.token.name = temp.rename.value;
                this.updateToken(temp.currObj);
            }
        });

        temp.recol.addEventListener('click', () => {
            if (temp.currObj) {
                temp.currObj.colour = colourBox.getCurrColour();
                if (temp.currObj.objectId >= 0) {
                    serveInter.recolourObjects(
                        [
                            {
                                entity: Entity.Object,
                                action: Action.Recolour,
                                objectId: temp.currObj.objectId,
                                colour: colourBox.getCurrColour(),
                            },
                        ],
                        colourBox.getCurrColour(),
                    );
                }
            }
        });

        temp.recolEdge.addEventListener('click', () => {
            if (temp.currObj) {
                temp.currObj.token.colour = colourBox.getCurrColour();
                this.updateToken(temp.currObj);
            }
        });

        temp.activeCheck.addEventListener('change', () => {
            if (temp.currObj) {
                temp.currObj.token.active = temp.activeCheck.checked;
                this.updateToken(temp.currObj);
            }
        });

        temp.swap.addEventListener('click', () => {
            if (temp.currObj) {
                this.swapObject(top);
            }
        });

        temp.updateImg.addEventListener('click', () => {
            if (temp.currObj) {
                this.updateToken(temp.currObj);
            }
        });

        temp.removeImg.addEventListener('click', () => {
            if (temp.currObj) {
                this.updateObject();
            }
        });
    }

    swapObject(top: boolean) {
        const toChange = top
            ? this.currTemplate.currObj
            : this.loadedTemplate.currObj;
        const fromChange = top
            ? this.loadedTemplate.currObj
            : this.currTemplate.currObj;
        if (toChange && fromChange) {
            const setUp = fromChange.payloadFromObject();
            const oldTl = toChange.getTopLeft();
            toChange.updateFromPayload(setUp);
            const newTl = toChange.getTopLeft();
            toChange.move(oldTl.x - newTl.x, oldTl.y - newTl.y);
            toChange.updateObject(true);
            this.updateToken(toChange);
        }
    }

    updateObject() {}

    updateToken(obj: BoardObject) {
        if (obj.objectId >= 0) {
            serveInter.updateToken(obj.token, obj.objectId);
        }
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
        this.loadedTemplate.activeCheck.checked = newObject.token.active;
        this.loadedTemplate.rename.value = newObject.token.name;
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
