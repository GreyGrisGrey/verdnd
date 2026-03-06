import { GREY, RED } from '../colours.ts';
import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { LayerState } from '../objectEvents.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);

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

    constructor(server: tempStore) {
        this.active = false;
        this.serveInter = server;
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

    // Toggles whether this menu is active or not.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.layerObj.style.visibility = this.active ? 'visible' : 'hidden';
        this.layerObj.style.pointerEvents = this.active ? 'auto' : 'none';
    }

    // Modifies and styles the main elements of the page.
    // Why is this here and not in a style element? I don't know.
    // TODO - Fix that.
    setMainElements() {
        this.descObj.style.height = `${this.boxHeight}px`;

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

        (this.tempButtonObj as any).type = 'button';
        (this.tempButtonObj as any).value = 'Make layer';
        this.tempButtonObj.style.width = '190px';
        this.tempButtonObj.style.position = 'absolute';
        this.tempButtonObj.style.left = '0px';
        this.tempButtonObj.style.bottom = '0px';
        this.tempButtonObj.style.height = '50px';

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

    // Calls the server interface to create a new layer.
    createLayer() {
        this.serveInter.createLayer();
    }

    // Updates the layer corresponding to a key value from a LayerState.
    updateLayer(key: number, val: LayerState) {
        const toUpdate = this.layerMap.get(key)!;
        toUpdate.gmVisible = val.gmVisible;
        toUpdate.playerVisible = val.playerVisible;
        toUpdate.zOrder = val.zOrder;
        (toUpdate.element!.children[1] as any).checked = val.playerVisible;
        (toUpdate.element!.children[2] as any).checked = val.gmVisible;
    }

    // Handles a new batch of LayerStates from the server.
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
                this.serveInter.updateLayer({
                    id: buildData.id,
                    gmVisible: !checkVisibleGM.checked,
                    playerVisible: checkVisibleAll.checked,
                    zOrder: buildData.zOrder,
                });
            }
        });

        checkVisibleAll.addEventListener('mousedown', () => {
            if (this.active) {
                this.serveInter.updateLayer({
                    id: buildData.id,
                    gmVisible: checkVisibleGM.checked,
                    playerVisible: !checkVisibleAll.checked,
                    zOrder: buildData.zOrder,
                });
            }
        });
    }

    // Changes the location of the HTMLElements of each layer.
    // Something of a misnomer.
    moveLayers() {
        this.currElements.forEach((el, i) => {
            el.style.top = `${(this.boxHeight + 4) * (i + 1)}px`;
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

    // Performs a single step updating the layer menu.
    step() {
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
    }
}
