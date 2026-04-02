import { BoardObject } from '../boardCanvas/boardObject.ts';
import { getRequiredElement } from '../dom.ts';
const topHalf = getRequiredElement('topObjBox', HTMLElement);
const bottomHalf = getRequiredElement('bottomObjBox', HTMLElement);
const objBox = getRequiredElement('objBox', HTMLElement);

interface ObjTemplate {
    container: HTMLElement;
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
    currTemplate: ObjTemplate;
    loadedTemplate: ObjTemplate;

    constructor() {
        this.active = false;
        this.currTemplate = this.buildTemplatePrimary();
        this.currTemplate.currObj!.updateToken({
            name: 'Squonch',
            movable: true,
            active: true,
            colour: 'none',
        });
        this.loadedTemplate = this.buildTemplatePrimary();
    }

    buildTemplatePrimary(): ObjTemplate {
        return {
            currObj: new BoardObject(
                -1,
                '#cccccc',
                { ellipse: false, fill: true, close: true },
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
            container: getRequiredElement('topObjContainer', HTMLElement),
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
            container: getRequiredElement('bottomObjContainer', HTMLElement),
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

    toggleActive(newAct: boolean) {
        this.active = newAct;
        objBox.style.visibility = newAct ? 'inherit' : 'hidden';
    }

    step() {}
}
