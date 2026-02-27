import { GREY, RED } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import { actions } from 'astro:actions';

const rightBar = getRequiredElement('rightBar', HTMLElement);

export interface LayerState {
    gmVisible: boolean;
    playerVisible: boolean;
    zOrder: number;
    id: number;
    element?: HTMLElement;
}

export class LayerMenu {
    active: boolean;
    button: HTMLElement;
    layers: LayerState[];
    descObj: HTMLElement;
    currElements: HTMLElement[];
    layerMap: Map<number, LayerState>;
    layerObj: HTMLElement;
    boxHeight: number;
    currSelect: number;
    tempButtonObj: HTMLElement;

    constructor() {
        this.active = false;
        this.button = getRequiredElement('layerTab', HTMLElement);
        this.layers = [];
        this.descObj = getRequiredElement('descLayerObj', HTMLElement);
        this.currElements = [];
        this.layerMap = new Map();
        this.layerObj = getRequiredElement('layerLayerObj', HTMLElement);
        this.boxHeight = 50;
        this.currSelect = 0;
        this.tempButtonObj = document.createElement('input');
        this.setMainElements();
        this.moveLayers();
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.layerObj.style.visibility = this.active ? 'visible' : 'hidden';
        this.layerObj.style.pointerEvents = this.active ? 'auto' : 'none';
    }

    setMainElements() {
        this.layerObj.style.background = GREY.toString();
        this.layerObj.style.visibility = 'hidden';
        this.layerObj.style.fontSize = '14px';

        this.descObj.style.border = 'solid black';
        this.descObj.style.height = `${this.boxHeight}px`;
        this.descObj.style.width = '250px';

        const numText = document.createElement('p');
        numText.innerText = 'Layer #';
        numText.style.position = 'absolute';
        numText.style.left = '10px';

        const firstCheck = document.createElement('p');
        firstCheck.innerText = 'GM\nVis';
        firstCheck.style.width = '50px';
        firstCheck.style.position = 'absolute';
        firstCheck.style.left = '187px';
        firstCheck.style.textAlign = 'center';

        const secondCheck = document.createElement('p');
        secondCheck.innerText = 'Player\nVis';
        secondCheck.style.width = '50px';
        secondCheck.style.position = 'absolute';
        secondCheck.style.left = '137px';
        secondCheck.style.textAlign = 'center';

        this.tempButtonObj.type = 'button';
        this.tempButtonObj.value = 'Make layer';
        this.tempButtonObj.style.width = '190px';
        this.tempButtonObj.style.position = 'absolute';
        this.tempButtonObj.style.left = '50px';
        this.tempButtonObj.style.top = '0px';

        this.layerObj.append(this.tempButtonObj);
        this.descObj.append(numText);
        this.descObj.append(firstCheck);
        this.descObj.append(secondCheck);

        this.tempButtonObj.addEventListener('mousedown', () => {
            if (this.active) {
                this.createLayer();
            }
        });
    }

    createLayer() {
        actions.boardActions.createLayer();
    }

    updateLayer(key: number, val: LayerState) {
        const toUpdate = this.layerMap.get(key)!;
        toUpdate.gmVisible = val.gmVisible;
        toUpdate.playerVisible = val.playerVisible;
        toUpdate.zOrder = val.zOrder;
        toUpdate.element!.children[1].checked = val.playerVisible;
        toUpdate.element!.children[2].checked = val.gmVisible;
    }

    handleNewLayers(newLayers: Map<number, LayerState>) {
        for (const [key, val] of newLayers) {
            if (!this.layerMap.has(key)) {
                this.constructLayer(val);
            } else {
                this.updateLayer(key, val);
            }
        }
        this.moveLayers();
        this.resizeLayerBoxes();
    }

    addNewLayer(layer: LayerState) {
        this.constructLayer(layer);
        this.moveLayers();
        this.resizeLayerBoxes();
    }

    constructLayer(buildData: LayerState) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        const checkVisibleAll = document.createElement('input');
        const checkVisibleGM = document.createElement('input');
        this.layerMap.set(buildData.id!, {
            id: buildData.id,
            gmVisible: buildData.gmVisible,
            playerVisible: buildData.playerVisible,
            zOrder: buildData.zOrder,
            element: newBox,
        });

        newBox.style.position = 'absolute';
        newBox.style.border = 'solid black';
        newBox.style.height = `${this.boxHeight}px`;
        newBox.style.width = '100px';
        newBox.style.left = '0px';
        newBox.style.top = '50px';

        newText.style.position = 'absolute';
        newText.style.width = '100px';
        newText.style.left = '10px';
        newText.style.top = '5px';
        newText.innerText = `Layer ${buildData.id}`;

        checkVisibleAll.type = 'checkbox';
        checkVisibleAll.style.position = 'absolute';
        checkVisibleAll.style.top = '15px';
        checkVisibleAll.style.left = '150px';
        checkVisibleAll.checked = buildData.playerVisible;
        checkVisibleAll.id = 'check1';

        checkVisibleGM.type = 'checkbox';
        checkVisibleGM.style.position = 'absolute';
        checkVisibleGM.style.top = '15px';
        checkVisibleGM.style.left = '200px';
        checkVisibleGM.checked = buildData.gmVisible;

        this.layerObj.append(newBox);
        newBox.append(newText);
        newBox.append(checkVisibleAll);
        newBox.append(checkVisibleGM);
        this.currElements.push(newBox);

        newBox.addEventListener('mousedown', () => {
            if (this.active) {
                if (
                    this.currSelect !== parseInt(newText.innerText.slice(6), 10)
                ) {
                    this.exitCurrSelect();
                    this.currSelect = parseInt(newText.innerText.slice(6), 10);
                }
            }
        });

        checkVisibleGM.addEventListener('mousedown', () => {
            if (this.active) {
                actions.boardActions.updateLayer({
                    id: buildData.id,
                    gmVisible: !checkVisibleGM.checked,
                    playerVisible: checkVisibleAll.checked,
                    zOrder: buildData.zOrder,
                });
            }
        });

        checkVisibleAll.addEventListener('mousedown', () => {
            if (this.active) {
                actions.boardActions.updateLayer({
                    id: buildData.id,
                    gmVisible: checkVisibleGM.checked,
                    playerVisible: !checkVisibleAll.checked,
                    zOrder: buildData.zOrder,
                });
            }
        });
    }

    moveLayers() {
        this.currElements.forEach((el, i) => {
            el.style.top = `${(this.boxHeight + 4) * (i + 1)}px`;
        });
    }

    resizeLayerBoxes() {
        const w = `${parseInt(this.layerObj.style.width, 10) - 4}px`;
        for (const el of this.currElements) {
            el.style.width = w;
        }
    }

    exitCurrSelect() {
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element.style.background = GREY.toString();
        }
    }

    step() {
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element.style.background = RED.toString();
        }
        if (this.layerObj.style.width !== rightBar.style.width) {
            this.layerObj.style.width = rightBar.style.width;
            this.layerObj.style.height = rightBar.style.height;
            this.descObj.style.width = `${parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2), 10) - 4}px`;
            this.resizeLayerBoxes();
        }
    }
}
