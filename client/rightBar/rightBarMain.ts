import { CharacterMenu } from './characterBarMenu.ts';
import { LayerMenu } from './layerBarMenu.ts';
import { RollMenu } from './rollBarMenu.ts';
import { ObjectMenu } from './objectBarMenu.ts';
import { getRequiredElement } from '../dom.ts';
import { TempStore } from '../serveInter.ts';
import { TooltipManager, TooltipMode } from '../tooltip.ts';
const rightBar = getRequiredElement('rightBar', HTMLElement);
const layerBox = getRequiredElement('layerLayerObj', HTMLElement);
const layerTab = getRequiredElement('layerTab', HTMLButtonElement);
const objectTab = getRequiredElement('objectTab', HTMLButtonElement);
const rollTab = getRequiredElement('rollTab', HTMLButtonElement);
const characterTab = getRequiredElement('characterTab', HTMLButtonElement);
const hideRight = getRequiredElement('hideRightBar', HTMLButtonElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const objBox = getRequiredElement('objBox', HTMLElement);
const serveInter = new TempStore();
const layerMan = new LayerMenu();
const objectMan = new ObjectMenu();
const characterMan = new CharacterMenu();
const rollMan = new RollMenu();
const tooltipManager = new TooltipManager();

export enum RightBarTab {
    None = 'NONE',
    Layer = 'LAYER',
    Object = 'OBJECT',
    Roll = 'ROLL',
    Character = 'CHARACTER',
}

// Class managing the right bar and its constituent menues.
export class RightBarManager {
    currActive: RightBarTab;
    visible: boolean;

    constructor() {
        this.currActive = RightBarTab.Layer;
        this.visible = true;
        rightBar.style.width = '250px';
        this.addEventListeners();
    }

    // Toggles visibility of right bar.
    toggleVisible() {
        rightBar.style.visibility = this.visible ? 'visible' : 'hidden';
        hideRight.style.left = this.visible ? '-50px' : '210px';
        hideRight.style.visibility = 'visible';
        hideRight.innerText = this.visible ? 'Hide' : 'Show';
    }

    // Adds relevant event listeners to each tab object.
    addEventListeners() {
        layerTab.addEventListener('click', () => {
            this.updateActive(RightBarTab.Layer);
        });

        layerTab.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Right, 'layers');
        });

        layerTab.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        objectTab.addEventListener('click', () => {
            this.updateActive(RightBarTab.Object);
        });

        objectTab.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Right, 'obj');
        });

        objectTab.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        rollTab.addEventListener('click', () => {
            this.updateActive(RightBarTab.Roll);
        });

        rollTab.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Right, 'roll');
        });

        rollTab.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        characterTab.addEventListener('click', () => {
            this.updateActive(RightBarTab.Character);
        });

        characterTab.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(TooltipMode.Right, 'char');
        });

        characterTab.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        hideRight.addEventListener('click', () => {
            this.visible = !this.visible;
            this.toggleVisible();
            tooltipManager.hardDisable();
        });

        hideRight.addEventListener('mouseenter', () => {
            tooltipManager.updateTooltipData(
                TooltipMode.Right,
                this.visible ? 'hide' : 'show',
            );
        });

        hideRight.addEventListener('mouseleave', () => {
            tooltipManager.disable();
        });

        document.addEventListener('keydown', (event) => {
            if (
                document.activeElement &&
                document.activeElement.tagName === 'INPUT'
            ) {
                return;
            }
            if (event.key === 'p') {
                this.updateActive(RightBarTab.Roll);
            } else if (event.key === 'l' && serveInter.isGm) {
                this.updateActive(RightBarTab.Layer);
            } else if (event.key === 'o' && serveInter.isGm) {
                this.updateActive(RightBarTab.Object);
            } else if (event.key === 'k' && serveInter.isGm) {
                this.updateActive(RightBarTab.Character);
            }
        });
    }

    updateActive(newActive: RightBarTab) {
        if (newActive === RightBarTab.Layer) {
            layerMan.toggleActive(true);
            rollMan.toggleActive(false);
            objectMan.toggleActive(false);
            characterMan.toggleActive(false);
        } else if (newActive === RightBarTab.Roll) {
            layerMan.toggleActive(false);
            rollMan.toggleActive(true);
            objectMan.toggleActive(false);
            characterMan.toggleActive(false);
        } else if (newActive === RightBarTab.Object) {
            layerMan.toggleActive(false);
            rollMan.toggleActive(false);
            objectMan.toggleActive(true);
            characterMan.toggleActive(false);
            objectMan.updateSizes(Math.min(800, window.innerHeight - 50));
            objectMan.draw();
        } else if (newActive === RightBarTab.Character) {
            layerMan.toggleActive(false);
            rollMan.toggleActive(false);
            objectMan.toggleActive(false);
            characterMan.toggleActive(true);
        }
        this.currActive = newActive;
    }

    // Toggles which menus should be visible given if the user is a gm or not.
    toggleModeSwitcher(gm: boolean) {
        if (!gm) {
            layerMan.toggleActive(false);
            rollMan.toggleActive(true);
            objectMan.toggleActive(false);
            characterMan.toggleActive(false);
            this.currActive = RightBarTab.Roll;
            layerTab.style.visibility = 'hidden';
            objectTab.style.visibility = 'hidden';
            rollTab.style.visibility = 'hidden';
            characterTab.style.visibility = 'hidden';
        } else {
            layerMan.toggleActive(true);
            rollMan.toggleActive(false);
            objectMan.toggleActive(false);
            characterMan.toggleActive(false);
            layerTab.style.visibility = 'inherit';
            objectTab.style.visibility = 'inherit';
            rollTab.style.visibility = 'inherit';
            characterTab.style.visibility = 'inherit';
        }
    }

    // A single step updating the state of the currently active menu.
    step() {
        if (this.currActive === RightBarTab.Layer) {
            layerMan.step();
        } else if (this.currActive === RightBarTab.Object) {
            objectMan.draw();
        }
    }

    updateSizes() {
        const barHeight = `${Math.min(800, window.innerHeight - 50)}px`;
        rightBar.style.height = barHeight;
        layerBox.style.height = barHeight;
        chatBox.style.height = barHeight;
        objBox.style.height = barHeight;
        chatBox.style.width = rightBar.style.width;
        if (this.currActive === RightBarTab.Layer) {
            layerMan.step();
        } else if (this.currActive === RightBarTab.Object) {
            objectMan.updateSizes(Math.min(800, window.innerHeight - 50));
        }
    }
}
