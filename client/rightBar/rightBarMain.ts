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
    Layer = 'LAYER',
    Object = 'OBJECT',
    Roll = 'ROLL',
    Character = 'CHARACTER',
}

type RightBarMenu = ObjectMenu | LayerMenu | CharacterMenu | RollMenu;

// Class managing the right bar and its constituent menues.
export class RightBarManager {
    currActive: RightBarTab;
    visible: boolean;
    buttons: Record<RightBarTab, HTMLButtonElement>;
    menus: Record<RightBarTab, RightBarMenu>;

    constructor() {
        this.currActive = RightBarTab.Layer;
        this.visible = true;
        this.buttons = {
            LAYER: layerTab,
            OBJECT: objectTab,
            ROLL: rollTab,
            CHARACTER: characterTab,
        };
        this.menus = {
            LAYER: layerMan,
            OBJECT: objectMan,
            ROLL: rollMan,
            CHARACTER: characterMan,
        };
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
        for (const tab of Object.values(RightBarTab)) {
            this.buttons[tab].addEventListener('click', () => {
                this.updateActive(tab);
            });

            this.buttons[tab].addEventListener('mouseenter', () => {
                tooltipManager.updateTooltipData(
                    TooltipMode.Right,
                    tab.toLowerCase(),
                );
            });

            this.buttons[tab].addEventListener('mouseleave', () => {
                tooltipManager.disable();
            });
        }

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
        this.menus[this.currActive].toggleActive(false);
        this.menus[newActive].toggleActive(true);
        this.currActive = newActive;
    }

    // Toggles which menus should be visible given if the user is a gm or not.
    toggleModeSwitcher(gm: boolean) {
        if (!gm) {
            this.updateActive(RightBarTab.Roll);
            layerTab.style.visibility = 'hidden';
            objectTab.style.visibility = 'hidden';
            rollTab.style.visibility = 'hidden';
            characterTab.style.visibility = 'hidden';
        } else {
            this.updateActive(RightBarTab.Layer);
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
