import { GRAY, RED } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import { actions } from 'astro:actions';

// const { data, error } = await actions.coinItems.getCoin();

const rightBar = getRequiredElement('rightBar', HTMLElement);

export interface LayerState {
    gmVisible: boolean;
    playerVisible: boolean;
    zOrder: number;
    id?: number;
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
    currNum: number;
    currSelect: number;
    tempButtonObj: HTMLElement;

    constructor() {
        this.active = false;
        this.button = getRequiredElement('layerTab', HTMLElement);
        this.layers = [];
        this.currElements = [];
        this.layerObj = document.createElement('div');
        this.descObj = document.createElement('div');
        this.layerMap = new Map();
        rightBar.append(this.layerObj);
        this.boxHeight = 50;
        this.currNum = 0;
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
        this.layerObj.style.background = GRAY.toString();
        this.layerObj.style.visibility = 'hidden';
        this.layerObj.style.fontSize = '14px';

        this.descObj.style.border = 'solid black';
        this.descObj.style.height = `${this.boxHeight}px`;
        this.descObj.style.width = '250px';
        this.layerObj.style.fontSize = '14px';

        const numText = document.createElement('p');
        numText.innerText = 'Layer #';
        numText.style.position = 'absolute';
        numText.style.left = '10px';

        const firstCheck = document.createElement('p');
        firstCheck.innerText = 'GM\nVis';
        firstCheck.style.width = '50px';
        firstCheck.style.position = 'absolute';
        firstCheck.style.left = '137px';
        firstCheck.style.textAlign = 'center';

        const secondCheck = document.createElement('p');
        secondCheck.innerText = 'Player\nVis';
        secondCheck.style.width = '50px';
        secondCheck.style.position = 'absolute';
        secondCheck.style.left = '187px';
        secondCheck.style.textAlign = 'center';

        this.tempButtonObj.type = 'button';
        this.tempButtonObj.value = 'Make layer';
        this.tempButtonObj.style.width = '190px';
        this.tempButtonObj.style.position = 'absolute';
        this.tempButtonObj.style.left = '50px';
        this.tempButtonObj.style.top = '0px';

        this.layerObj.append(this.descObj);
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

    handleNewLayers(newLayers: Map<number, LayerState>) {
        for (const [key, val] of newLayers) {
            if (!this.layerMap.has(key)) {
                this.currNum = key;
                this.constructLayer(val);
            }
        }
        this.moveLayers();
        this.resizeLayerBoxes();
    }

    constructLayer(buildData: LayerState) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        const checkVisibleAll = document.createElement('input');
        const checkVisibleGM = document.createElement('input');
        this.layerMap.set(this.currNum, {
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
        checkVisibleAll.checked = true;

        checkVisibleGM.type = 'checkbox';
        checkVisibleGM.style.position = 'absolute';
        checkVisibleGM.style.top = '15px';
        checkVisibleGM.style.left = '200px';
        checkVisibleGM.checked = true;

        this.layerObj.append(newBox);
        newBox.append(newText);
        newBox.append(checkVisibleAll);
        newBox.append(checkVisibleGM);
        this.currElements.push(newBox);
        this.currNum++;

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
            layer.element.style.background = GRAY.toString();
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
