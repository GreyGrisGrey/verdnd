import { BoardObject } from '../boardCanvas/boardObject.ts';
import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { ColourBox } from '../leftBar/colourBox.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import type { Vec2 } from '../../shared/coords.ts';
import type { ObjectCreatePayload } from '../../shared/objectEvents.ts';
const topHalf = getRequiredElement('topObjBox', HTMLElement);
const bottomHalf = getRequiredElement('bottomObjBox', HTMLElement);
const objBox = getRequiredElement('objBox', HTMLElement);
const fileInput = getRequiredElement('fileInput', HTMLInputElement);
const serveInter = new TempStore();
const colourBox = new ColourBox();

interface ObjTemplate {
    container: HTMLCanvasElement;
    rename: HTMLInputElement;
    recol: HTMLButtonElement;
    recolEdge: HTMLButtonElement;
    activeCheck: HTMLInputElement;
    swap: HTMLButtonElement;
    currObj: BoardObject;
    updateImg: HTMLButtonElement;
    removeImg: HTMLButtonElement;
}

export class ObjectMenu {
    active: boolean;
    loadedActive: boolean;
    currTemplate: ObjTemplate;
    loadedTemplate: ObjTemplate;
    changeTopImg: boolean;
    changeBottomImg: boolean;
    currSelected: BoardObject;
    ctx1: CanvasRenderingContext2D;
    ctx2: CanvasRenderingContext2D;

    constructor() {
        this.active = false;
        this.loadedActive = false;
        this.currTemplate = this.buildTemplatePrimary();
        this.currTemplate.currObj.updateToken({
            name: 'Squonch',
            movable: true,
            active: true,
            colour: 'none',
        });
        this.loadedTemplate = this.buildTemplateSecondary();
        this.currTemplate.swap.style.visibility = 'hidden';
        this.currTemplate.swap.style.pointerEvents = 'none';
        this.currTemplate.rename.value = this.currTemplate.currObj!.token.name;
        this.currTemplate.activeCheck.checked = true;
        this.addEventListeners(this.currTemplate, true);
        this.addEventListeners(this.loadedTemplate, false);
        this.changeTopImg = false;
        this.changeBottomImg = false;
        this.currSelected = this.loadedTemplate.currObj;
        this.ctx1 = this.currTemplate.container.getContext('2d')!;
        this.ctx2 = this.loadedTemplate.container.getContext('2d')!;
    }

    // Adds event listeners.
    addEventListeners(temp: ObjTemplate, top: boolean) {
        temp.rename.addEventListener('change', () => {
            if (temp.currObj) {
                temp.currObj.token.name = temp.rename.value;
                this.updateToken(!top);
            }
        });

        temp.recol.addEventListener('click', () => {
            if (temp.currObj) {
                temp.currObj.colour = colourBox.getCurrColour();
                if (!top && this.currSelected.objectId >= 0) {
                    serveInter.recolourObjects([
                        {
                            entity: Entity.Object,
                            action: Action.Recolour,
                            objectId: this.currSelected.objectId,
                            colour: colourBox.getCurrColour(),
                            oldCol: this.currSelected.getColour(),
                        },
                    ]);
                }
            }
        });

        temp.recolEdge.addEventListener('click', () => {
            if (temp.currObj) {
                temp.currObj.token.colour = colourBox.getCurrColour();
                this.updateToken(!top);
            }
        });

        temp.activeCheck.addEventListener('change', () => {
            if (temp.currObj) {
                temp.currObj.token.active = temp.activeCheck.checked;
                this.updateToken(!top);
            }
        });

        temp.swap.addEventListener('click', () => {
            if (temp.currObj) {
                this.swapObject(top);
            }
        });

        temp.updateImg.addEventListener('click', () => {
            if (temp.currObj) {
                fileInput.click();
                if (top) {
                    this.changeTopImg = true;
                } else {
                    this.changeBottomImg = true;
                }
            }
        });

        temp.removeImg.addEventListener('click', () => {
            if (temp.currObj) {
                if (top) {
                    this.currTemplate.currObj.updateImage(false);
                    this.currTemplate.currObj.imageObj.drawFlag = false;
                } else if (this.loadedTemplate.currObj) {
                    serveInter.removeFile(this.currSelected.objectId);
                }
            }
        });

        fileInput.addEventListener('change', async () => {
            if (this.changeBottomImg && this.currSelected.objectId >= 0) {
                const file = fileInput.files ? fileInput.files[0] : null;
                const curr = this.loadedTemplate.currObj;
                if (curr && file) {
                    const br = curr.getBottomRight();
                    const tl = curr.getTopLeft();
                    await curr.imageObj.updateImageLocal(
                        URL.createObjectURL(file),
                        br.x - tl.x,
                        br.y - tl.y,
                    );
                    curr.imageObj.blob = file;
                }
                this.changeTopImg = false;
                serveInter.uploadFile(this.currSelected.objectId);
                this.changeBottomImg = false;
            } else if (this.changeTopImg) {
                const file = fileInput.files ? fileInput.files[0] : null;
                const curr = this.currTemplate.currObj;
                if (curr && file) {
                    const br = curr.getBottomRight();
                    const tl = curr.getTopLeft();
                    await curr.imageObj.updateImageLocal(
                        URL.createObjectURL(file),
                        br.x - tl.x,
                        br.y - tl.y,
                    );
                    curr.imageObj.blob = file;
                }
                this.changeTopImg = false;
            }
        });
    }

    // Copies either the top template to the bottom or the reverse.
    // Also if it's copying to the bottom it copies to the currently selected object too.
    swapObject(top: boolean) {
        const toChange = top ? this.currTemplate : this.loadedTemplate;
        const fromChange = top ? this.loadedTemplate : this.currTemplate;
        const setUp = fromChange.currObj.payloadFromObject();
        toChange.currObj.updateFromPayload(setUp);
        toChange.rename.value = fromChange.rename.value;
        toChange.activeCheck.checked = fromChange.activeCheck.checked;
        if (fromChange.currObj.imageObj.drawFlag) {
            const currImg = fromChange.currObj.imageObj;
            toChange.currObj.imageObj.updateImageLocal(
                currImg.stringUrl,
                currImg.width,
                currImg.height,
            );
            toChange.currObj.imageObj.blob = fromChange.currObj.imageObj.blob;
            toChange.currObj.imageObj.drawFlag = true;
        } else {
            toChange.currObj.imageObj.drawFlag = false;
        }
        if (!top) {
            const oldTl = this.currSelected.getTopLeft();
            this.currSelected.updateFromPayload(setUp);
            const newTl = this.currSelected.getTopLeft();
            this.currSelected.move(oldTl.x - newTl.x, oldTl.y - newTl.y);
            this.currSelected.updateObject(true);
            this.updateToken(true);
            if (fromChange.currObj.imageObj.drawFlag) {
                this.updateImage();
            } else {
                serveInter.removeFile(this.currSelected.objectId);
            }
        }
    }

    // Updates the image on the selected object.
    updateImage() {
        serveInter.uploadBlob(
            this.currSelected.objectId,
            this.currTemplate.currObj.imageObj.blob,
        );
    }

    // Updates the selected object's token, if it can.
    updateToken(bottom: boolean) {
        if (bottom && this.currSelected.objectId >= 0) {
            this.currSelected.token.name = this.loadedTemplate.rename.value;
            this.currSelected.token.active =
                this.loadedTemplate.activeCheck.checked;
            this.currSelected.token.colour =
                this.loadedTemplate.currObj.token.colour;
            serveInter.updateToken(
                this.currSelected.token,
                this.currSelected.objectId,
            );
        }
    }

    // Builds the top template.
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

    // Builds the bottom template.
    buildTemplateSecondary(): ObjTemplate {
        return {
            currObj: new BoardObject(
                -6,
                '#cccccc',
                { ellipse: true, fill: true, close: true },
                [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 0, y: 1 },
                ],
            ),
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

    // Disables the second template.
    // Called when nothing is selected, or when too many things are selected.
    disableSecondary() {
        bottomHalf.style.visibility = 'hidden';
        bottomHalf.style.pointerEvents = 'none';
        this.currTemplate.swap.style.visibility = 'hidden';
        this.currTemplate.swap.style.pointerEvents = 'none';
        this.loadedActive = false;
    }

    // Updates the secondary template to match a new object.
    updateSecondary(newObject: BoardObject) {
        this.currSelected = newObject;
        this.loadedTemplate.currObj.updateFromPayload(
            newObject.payloadFromObject(),
        );
        if (newObject.imageObj.drawFlag) {
            this.loadedTemplate.currObj.imageObj.updateImageLocal(
                newObject.imageObj.stringUrl,
                newObject.imageObj.width,
                newObject.imageObj.height,
            );
            this.loadedTemplate.currObj.imageObj.blob = newObject.imageObj.blob;
            this.loadedTemplate.currObj.imageObj.drawFlag = true;
        } else {
            this.loadedTemplate.currObj.imageObj.drawFlag = false;
        }
        bottomHalf.style.visibility = 'inherit';
        bottomHalf.style.pointerEvents = 'auto';
        this.currTemplate.swap.style.visibility = 'inherit';
        this.currTemplate.swap.style.pointerEvents = 'auto';
        this.loadedActive = true;
        this.loadedTemplate.activeCheck.checked = newObject.token.active;
        this.loadedTemplate.rename.value = newObject.token.name;
        this.draw();
    }

    // Toggles if the menu is active.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        objBox.style.visibility = newAct ? 'inherit' : 'hidden';
        objBox.style.pointerEvents = newAct ? 'auto' : 'none';
    }

    // Draws the templates.
    draw() {
        if (this.currTemplate.currObj) {
            const curr = this.currTemplate.currObj;
            const tl = curr.getTopLeft();
            const br = curr.getBottomRight();
            this.ctx1.clearRect(0, 0, 100, 100);
            const size = { x: br.x - tl.x, y: br.y - tl.y };
            const scale = Math.min(100 / size.x, 100 / size.y);
            const offset = { x: scale * size.x, y: scale * size.y };
            curr.draw(this.ctx1, scale, {
                x: -tl.x * scale + (100 - offset.x) / 2,
                y: -tl.y * scale + (100 - offset.y) / 2,
            });
        }
        if (this.loadedActive && this.loadedTemplate.currObj) {
            const curr = this.loadedTemplate.currObj;
            const tl = curr.getTopLeft();
            const br = curr.getBottomRight();
            this.ctx2.clearRect(0, 0, 100, 100);
            const size = { x: br.x - tl.x, y: br.y - tl.y };
            const scale = Math.min(100 / size.x, 100 / size.y);
            const offset = { x: scale * size.x, y: scale * size.y };
            curr.draw(this.ctx2, scale, {
                x: -tl.x * scale + (100 - offset.x) / 2,
                y: -tl.y * scale + (100 - offset.y) / 2,
            });
        }
    }

    // Does a single step updating size parameters and drawing the objects.
    step(height: number) {
        const newHeight = `${(height / 2).toString()}px`;
        topHalf.style.height = newHeight;
        bottomHalf.style.height = newHeight;
        bottomHalf.style.top = newHeight;
        this.draw();
    }

    // Creates an object from the top template at a given location.
    createObjectFromTemplate(startLoc: Vec2) {
        const currTemp = this.currTemplate.currObj;
        const currCreate: ObjectCreatePayload = currTemp.payloadFromObject();
        const newPoints = [];
        const tl = currTemp.getTopLeft();
        const dist = { x: startLoc.x - tl.x, y: startLoc.y - tl.y };
        for (const pt of currCreate.points) {
            newPoints.push({ x: pt.x + dist.x, y: pt.y + dist.y });
        }
        currCreate.points = newPoints;
        serveInter.createObject({
            entity: Entity.Object,
            action: Action.Create,
            object: currCreate,
            token: currTemp.token,
            userId: 'a',
        });
    }
}
