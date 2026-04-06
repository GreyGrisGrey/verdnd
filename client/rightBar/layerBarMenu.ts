import { GREY, GREY_DARK } from '../../shared/colours.ts';
import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { LayerState } from '../../shared/objectEvents.ts';
import { ModeManager } from '../boardCanvas/modeManager.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const currLayerText = getRequiredElement('currLayerText', HTMLElement);
const layerBottom = getRequiredElement('layerBottom', HTMLElement);
const layerRenameInput = getRequiredElement('rename', HTMLInputElement);
const layerXInput = getRequiredElement('xChange', HTMLInputElement);
const layerYInput = getRequiredElement('yChange', HTMLInputElement);
const deleteButton = getRequiredElement('deleteLayerButton', HTMLElement);
const upButton = getRequiredElement('layerUpButton', HTMLButtonElement);
const downButton = getRequiredElement('layerDownButton', HTMLButtonElement);
const storedLayerStates: Map<number, LayerState> = new Map();
const serveInter = new TempStore();
const modeMan = new ModeManager();

// Class managing the right-bar's layer menu.
// It's questionable that this effectively holds an entirely separate set of objects from localBoard. Something should be done about this.
export class LayerMenu {
    active: boolean;
    descObj: HTMLElement;
    layerObj: HTMLElement;
    boxHeight: number;
    currSelect: number;
    addLayerButton: HTMLElement;

    constructor() {
        this.active = false;
        this.descObj = getRequiredElement('descLayerObj', HTMLElement);
        this.layerObj = getRequiredElement('layerLayerObj', HTMLElement);
        this.boxHeight = 50;
        this.currSelect = 0;
        this.addLayerButton = getRequiredElement('addLayerButton', HTMLElement);
        currLayerText.style.overflow = 'hidden';
        this.addEventListeners();
        this.moveLayers();
    }

    // Add event listeners.
    addEventListeners() {
        this.addLayerButton.addEventListener('click', () => {
            if (this.active) {
                this.createLayer();
            }
        });

        upButton.addEventListener('click', () => {
            const layer = storedLayerStates.get(this.currSelect)!;
            if (layer.zOrder === storedLayerStates.size - 1) {
                return;
            }
            layer.zOrder += 1;
            serveInter.updateLayer(layer);
            this.moveLayers();
        });

        downButton.addEventListener('click', () => {
            const layer = storedLayerStates.get(this.currSelect)!;
            if (layer.zOrder === 0) {
                return;
            }
            layer.zOrder -= 1;
            serveInter.updateLayer(layer);
            this.moveLayers();
        });

        layerRenameInput.addEventListener('change', () => {
            const layer = storedLayerStates.get(this.currSelect)!;
            (layer.element!.children[0] as any).innerText =
                layerRenameInput.value === 'none'
                    ? `Layer ${this.currSelect}`
                    : layerRenameInput.value;
            layer.name = layerRenameInput.value;
            serveInter.updateLayer(layer);
        });

        layerXInput.addEventListener('change', () => {
            const newX = layerXInput.value;
            if (Number.isNaN(Number(newX))) {
                layerXInput.value = '0';
            } else {
                const layer = storedLayerStates.get(this.currSelect);
                if (layer) {
                    layer.x = Number(newX);
                    serveInter.updateLayer(layer);
                }
            }
        });

        layerYInput.addEventListener('change', () => {
            const newY = layerYInput.value;
            if (Number.isNaN(Number(newY))) {
                layerYInput.value = '0';
            } else {
                const layer = storedLayerStates.get(this.currSelect);
                if (layer) {
                    layer.y = Number(newY);
                    serveInter.updateLayer(layer);
                }
            }
        });

        deleteButton.addEventListener('click', () => {
            const targLayer = storedLayerStates.get(this.currSelect)!;
            serveInter.destroyLayer(targLayer);
        });
    }

    // Toggles whether this menu is active or not.
    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.layerObj.style.visibility = this.active ? 'inherit' : 'hidden';
        this.layerObj.style.pointerEvents = this.active ? 'auto' : 'none';
        this.enterCurrSelect();
    }

    // Calls the server interface to create a new layer.
    createLayer() {
        serveInter.createLayer();
    }

    // Updates the input elements to match the given layer state.
    updateInputs(val: LayerState) {
        layerXInput.value = val.x.toString();
        layerYInput.value = val.y.toString();
        layerRenameInput.value = val.name.toString();
        currLayerText.innerText =
            val.name === 'none'
                ? `Edit Layer : Layer ${this.currSelect}`
                : `Edit Layer : ${val.name}`;
        console.log(val);
        downButton.disabled = val.zOrder === 0;
        upButton.disabled = val.zOrder === storedLayerStates.size - 1;
    }

    // Updates the layer corresponding to a key value from a LayerState.
    updateLayer(key: number, val: LayerState) {
        const toUpdate = storedLayerStates.get(key)!;
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
    }

    // Constructs a new layer, including relevant HTMLElements.
    constructLayer(buildData: LayerState) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        const checkVisibleAll = document.createElement('input');
        const checkVisibleGM = document.createElement('input');
        storedLayerStates.set(buildData.id!, {
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
        newBox.style.height = `${this.boxHeight}px`;
        newBox.style.width = '100px';
        newBox.style.left = '0px';
        newBox.style.top = '50px';
        newBox.style.visibility = 'inherit';

        newText.style.position = 'absolute';
        newText.style.width = '100px';
        newText.style.left = '10px';
        newText.style.top = '5px';
        newText.style.width = '120px';
        newText.innerText =
            buildData.name === 'none'
                ? `Layer ${buildData.id}`
                : buildData.name;
        newText.style.overflow = 'hidden';

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

        newBox.addEventListener('mousedown', () => {
            if (this.active) {
                if (this.currSelect !== num) {
                    this.exitCurrSelect();
                    this.currSelect = num;
                    modeMan.drawMan.updateLayer();
                    modeMan.viewMan.updateLayerOffset({
                        x: buildData.x,
                        y: buildData.y,
                    });
                    this.enterCurrSelect();
                }
            }
        });

        checkVisibleGM.addEventListener('change', () => {
            if (this.active) {
                const layer = storedLayerStates.get(num);
                if (layer) {
                    layer.gmVisible = checkVisibleGM.checked;
                    serveInter.updateLayer(layer);
                }
            }
        });

        checkVisibleAll.addEventListener('change', () => {
            if (this.active) {
                const layer = storedLayerStates.get(num);
                if (layer) {
                    layer.playerVisible = checkVisibleAll.checked;
                    serveInter.updateLayer(layer);
                }
            }
        });

        if (num === 0) {
            this.updateInputs(buildData);
        }
        this.step();
    }

    // Changes the location of the HTMLElements of each layer.
    // Something of a misnomer.
    moveLayers() {
        storedLayerStates.forEach((val, key) => {
            val.element!.style.top = `${(this.boxHeight + 4) * (storedLayerStates.size - (val.zOrder + 1))}px`;
        });
    }

    // Resizes the HTMLElements of each layer.
    resizeLayerBoxes() {
        const w = `${parseInt(this.layerObj.style.width, 10)}px`;
        for (const [key, val] of storedLayerStates) {
            val.element!.style.width = w;
        }
    }

    // Unselects the currently selected layer, in preparation for it not being the currently selected layer.
    exitCurrSelect() {
        const layer = storedLayerStates.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = 'none';
        }
    }

    // Destroys a layer element.
    destroyLayerElement(id: number) {
        const currLayer = storedLayerStates.get(id);
        if (currLayer) {
            currLayer.element!.remove();
            currLayer.element!.style.visibility = 'hidden';
            currLayer.element!.style.pointerEvents = 'none';
            currLayer.element!.innerHTML = '';
        }
        storedLayerStates.delete(id);
        this.moveLayers();
    }

    // Selects the currently selected layer.
    enterCurrSelect() {
        let layer = storedLayerStates.get(this.currSelect);
        if (!layer) {
            this.currSelect = storedLayerStates.keys().next().value!;
            layer = storedLayerStates.get(this.currSelect);
        }
        if (layer) {
            layer.element!.style.background = GREY_DARK.toString();
            this.updateInputs(layer);
        } else {
            console.log(this.currSelect);
            console.log('Error, layerMan has invalid layer.');
        }
    }

    // Performs a single step updating the layer menu.
    step() {
        layerBottom.style.height = `${Number(rightBar.style.height.slice(0, rightBar.style.height.length - 2)) - 350}px`;
        const layer = storedLayerStates.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = GREY_DARK.toString();
        }
        if (this.layerObj.style.width !== rightBar.style.width) {
            this.layerObj.style.width = rightBar.style.width;
            this.layerObj.style.height = rightBar.style.height;
            this.descObj.style.width = `${parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2), 10)}px`;
        }
        this.resizeLayerBoxes();
    }
}
