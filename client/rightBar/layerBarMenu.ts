import { GREY, RED } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { LayerState } from '../../shared/objectEvents.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const layerTop = getRequiredElement('layerTop', HTMLElement);
const layerMid = getRequiredElement('layerMid', HTMLElement);
const currLayerText = getRequiredElement('currLayerText', HTMLElement);
const layerBottom = getRequiredElement('layerBottom', HTMLElement);
const layerRenameInput = getRequiredElement('rename', HTMLInputElement);
const layerXInput = getRequiredElement('xChange', HTMLInputElement);
const layerYInput = getRequiredElement('yChange', HTMLInputElement);

// Class managing the right-bar's layer menu.
// It's questionable that this effectively holds an entirely separate set of objects from localBoard. Something should be done about this.
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
    serveInter: tempStore;

    constructor(server: tempStore, layerMap: Map<number, LayerState>) {
        this.active = false;
        this.serveInter = server;
        this.button = getRequiredElement('layerTab', HTMLElement);
        this.layers = [];
        this.descObj = getRequiredElement('descLayerObj', HTMLElement);
        this.currElements = [];
        this.layerMap = layerMap;
        this.layerObj = getRequiredElement('layerLayerObj', HTMLElement);
        this.boxHeight = 50;
        this.currSelect = 0;
        this.tempButtonObj = getRequiredElement('tempButtonObj', HTMLElement);
        this.tempButtonObj.addEventListener('mousedown', () => {
            if (this.active) {
                this.createLayer();
            }
        });
        this.moveLayers();

        layerRenameInput.addEventListener('change', () => {
            const layer = this.layerMap.get(this.currSelect)!;
            (layer.element!.children[0] as any).innerText =
                layerRenameInput.value === 'none'
                    ? `Layer ${this.currSelect}`
                    : layerRenameInput.value;
            layer.name = layerRenameInput.value;
            this.serveInter.updateLayer(layer);
        });

        layerXInput.addEventListener('change', () => {
            const newX = layerXInput.value;
            if (Number.isNaN(Number(newX))) {
                layerXInput.value = '0';
            } else {
                const layer = this.layerMap.get(this.currSelect);
                if (layer) {
                    layer.x = Number(newX);
                    this.serveInter.updateLayer(layer);
                }
            }
        });

        layerYInput.addEventListener('change', () => {
            const newY = layerYInput.value;
            if (Number.isNaN(Number(newY))) {
                layerYInput.value = '0';
            } else {
                const layer = this.layerMap.get(this.currSelect);
                if (layer) {
                    layer.y = Number(newY);
                    this.serveInter.updateLayer(layer);
                }
            }
        });
    }

    // Toggles whether this menu is active or not.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.layerObj.style.visibility = this.active ? 'visible' : 'hidden';
        this.layerObj.style.pointerEvents = this.active ? 'auto' : 'none';
        this.enterCurrSelect();
    }

    // Calls the server interface to create a new layer.
    createLayer() {
        this.serveInter.createLayer();
    }

    updateInputs(val: LayerState) {
        console.log('a');
        console.log(val);
        layerXInput.value = val.x.toString();
        layerYInput.value = val.y.toString();
        layerRenameInput.value = val.name.toString();
        console.log('done');
        currLayerText.innerText =
            val.name === 'none' ? `Layer ${this.currSelect}` : val.name;
    }

    // Updates the layer corresponding to a key value from a LayerState.
    updateLayer(key: number, val: LayerState) {
        const toUpdate = this.layerMap.get(key)!;
        toUpdate.gmVisible = val.gmVisible;
        toUpdate.playerVisible = val.playerVisible;
        toUpdate.zOrder = val.zOrder;
        (toUpdate.element!.children[1] as any).checked = val.playerVisible;
        (toUpdate.element!.children[2] as any).checked = val.gmVisible;
        toUpdate.x = val.x;
        toUpdate.y = val.y;
        toUpdate.name = val.name;
        (toUpdate.element!.children[0] as any).innerText =
            val.name === 'none' ? `Layer ${key}` : val.name;
        if (key === this.currSelect) {
            this.updateInputs(val);
        }
        console.log(this.layerMap);
    }

    // Constructs a new layer, including relevant HTMLElements.
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
            name: buildData.name,
            x: buildData.x,
            y: buildData.y,
        });
        const num = buildData.id;
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
        newText.innerText =
            buildData.name === 'none'
                ? `Layer ${buildData.id}`
                : buildData.name;

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
        layerBottom.append(newBox);
        newBox.append(newText);
        newBox.append(checkVisibleAll);
        newBox.append(checkVisibleGM);
        this.currElements.push(newBox);

        newBox.addEventListener('mousedown', () => {
            if (this.active) {
                if (this.currSelect !== num) {
                    this.exitCurrSelect();
                    this.currSelect = num;
                    this.enterCurrSelect();
                }
            }
        });

        checkVisibleGM.addEventListener('change', () => {
            if (this.active) {
                const layer = this.layerMap.get(num);
                if (layer) {
                    layer.gmVisible = checkVisibleGM.checked;
                    this.serveInter.updateLayer(layer);
                }
            }
        });

        checkVisibleAll.addEventListener('change', () => {
            if (this.active) {
                const layer = this.layerMap.get(num);
                if (layer) {
                    layer.playerVisible = checkVisibleAll.checked;
                    this.serveInter.updateLayer(layer);
                }
            }
        });

        if (num === 0) {
            this.updateInputs(buildData);
        }
    }

    // Changes the location of the HTMLElements of each layer.
    // Something of a misnomer.
    moveLayers() {
        this.currElements.forEach((el, i) => {
            el.style.top = `${(this.boxHeight + 4) * i}px`;
        });
    }

    // Resizes the HTMLElements of each layer.
    resizeLayerBoxes() {
        const w = `${parseInt(this.layerObj.style.width, 10) - 4}px`;
        for (const el of this.currElements) {
            el.style.width = w;
        }
        this.tempButtonObj.style.width = `${parseInt(this.layerObj.style.width, 10)}px`;
    }

    // Unselects the currently selected layer.
    exitCurrSelect() {
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = GREY.toString();
        }
    }

    enterCurrSelect() {
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = RED.toString();
            layerXInput.value = layer.x.toString();
            layerYInput.value = layer.y.toString();
            currLayerText.innerText =
                layer.name === 'none' ? `Layer ${this.currSelect}` : layer.name;
        }
    }

    // Performs a single step updating the layer menu.
    step() {
        layerBottom.style.height = `${window.innerHeight - 370}px`;
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = RED.toString();
        }
        if (this.layerObj.style.width !== rightBar.style.width) {
            this.layerObj.style.width = rightBar.style.width;
            this.layerObj.style.height = rightBar.style.height;
            this.descObj.style.width = `${parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2), 10) - 4}px`;
            this.resizeLayerBoxes();
        }
        this.moveLayers();
        this.resizeLayerBoxes();
    }
}
