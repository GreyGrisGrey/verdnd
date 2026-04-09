import { getRequiredElement } from './dom.ts';
import { TooltipManager, TooltipMode } from './tooltip.ts';
import { ModeManager } from './boardCanvas/modeManager.ts';
const tooltipManager = new TooltipManager();
const bottomBar = getRequiredElement('bottomBar', HTMLElement);
const modeMan = new ModeManager();
const measureBox = getRequiredElement('measureBox', HTMLElement);

export class BottomBarManager {
    boxDrawItems: HTMLButtonElement[];
    boxSelectItems: HTMLButtonElement[];
    boxViewItems: HTMLButtonElement[];
    bottomActive: boolean;

    constructor() {
        this.boxDrawItems = [];
        this.boxSelectItems = [];
        this.boxViewItems = [];
        this.setUpBoxes();
        this.bottomActive = false;
        this.addEventListeners();
    }

    // Sets up boxes for each mode.
    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxDrawItems.push(
                getRequiredElement(
                    'bottomDrawBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            this.boxSelectItems.push(
                getRequiredElement(
                    'bottomSelectBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            this.boxViewItems.push(
                getRequiredElement(
                    'bottomViewBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
        }
    }

    // Updates the location of the bottom bar.
    updateSizes() {
        bottomBar.style.left = window.innerWidth / 2 - 300 + 'px';
        // Should this be here? I'm not sure, but I don't immediately see a better alternative.
        measureBox.style.left = window.innerWidth / 2 - 200 + 'px';
    }

    // Adds event listeners
    addEventListeners() {
        for (let i = 0; i < 10; i++) {
            this.boxDrawItems[i].addEventListener('mouseenter', () => {
                tooltipManager.updateTooltipData(
                    TooltipMode.Bottom,
                    `draw${i}`,
                );
            });

            this.boxDrawItems[i].addEventListener('mouseleave', () => {
                tooltipManager.disable();
            });

            this.boxViewItems[i].addEventListener('mouseenter', () => {
                tooltipManager.updateTooltipData(
                    TooltipMode.Bottom,
                    `view${i}`,
                );
            });

            this.boxViewItems[i].addEventListener('mouseleave', () => {
                tooltipManager.disable();
            });

            this.boxSelectItems[i].addEventListener('mouseenter', () => {
                if (modeMan.selectMan.selectedObjects.length === 1) {
                    tooltipManager.updateTooltipData(
                        TooltipMode.Bottom,
                        `selOne${i}`,
                    );
                } else {
                    tooltipManager.updateTooltipData(
                        TooltipMode.Bottom,
                        `selMany${i}`,
                    );
                }
            });

            this.boxSelectItems[i].addEventListener('mouseleave', () => {
                this.bottomActive = false;
                tooltipManager.disable();
            });
        }
    }
}
