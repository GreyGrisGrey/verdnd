import { getRequiredElement } from './dom.ts';
const layerTab = getRequiredElement('layerTab', HTMLElement);
const objectTab = getRequiredElement('objectTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);
const measureDegrees = getRequiredElement('measureDegrees', HTMLInputElement);
const bottomBar = getRequiredElement('bottomBar', HTMLElement);
const bottomTooltip = getRequiredElement('bottomTooltip', HTMLElement);
const bottomTooltipText = getRequiredElement('bottomTooltipText', HTMLElement);
//This probably shouldn't be its own thing.

export class BottomBarManager {
    boxDrawItems: HTMLButtonElement[];
    boxSelectItems: HTMLButtonElement[];
    boxViewItems: HTMLButtonElement[];
    bottomContent: any[];
    bottomActive: boolean;

    constructor() {
        this.boxDrawItems = [];
        this.boxSelectItems = [];
        this.boxViewItems = [];
        this.setUpBoxes();
        this.bottomActive = false;
        this.bottomContent = [];
        this.setEventListeners();
        this.getData();
        measureDegrees.value = '360';
    }

    async getData() {
        const response = await fetch('./client/assets/tooltips.json');
        const data = await response.json();
        this.bottomContent = data.bottomContent;
    }

    async awaitDisable() {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!this.bottomActive) {
            bottomTooltip.style.visibility = 'hidden';
            measureDegrees.style.visibility = 'hidden';
        }
    }

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

    step() {
        bottomBar.style.left = window.innerWidth / 2 - 300 + 'px';
    }

    setEventListeners() {
        for (let i = 0; i < 10; i++) {
            this.boxDrawItems[i].addEventListener('mouseover', () => {
                this.bottomActive = true;
                bottomTooltipText.innerText = this.bottomContent[i].draw;
                measureDegrees.style.visibility = 'hidden';
                bottomTooltip.style.visibility = 'visible';
            });

            this.boxDrawItems[i].addEventListener('mouseout', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });

            this.boxViewItems[i].addEventListener('mouseover', () => {
                this.bottomActive = true;
                bottomTooltipText.innerText = this.bottomContent[i].view;
                if (i === 8) {
                    measureDegrees.style.visibility = 'visible';
                } else {
                    measureDegrees.style.visibility = 'hidden';
                }
                bottomTooltip.style.visibility = 'visible';
            });

            this.boxViewItems[i].addEventListener('mouseout', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });

            this.boxSelectItems[i].addEventListener('mouseover', () => {
                this.bottomActive = true;
                bottomTooltipText.innerText = this.bottomContent[i].select;
                measureDegrees.style.visibility = 'hidden';
                bottomTooltip.style.visibility = 'visible';
            });

            this.boxSelectItems[i].addEventListener('mouseout', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });

            bottomTooltip.addEventListener('mouseenter', () => {
                this.bottomActive = true;
            });

            bottomTooltip.addEventListener('mouseleave', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });
        }
    }
}
