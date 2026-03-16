import { getRequiredElement } from './dom.ts';
const layerTab = getRequiredElement('layerTab', HTMLElement);
const tokenTab = getRequiredElement('tokenTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);
const nameInput = getRequiredElement('tokenName', HTMLInputElement);
const nameLabel = getRequiredElement('tokenNameLabel', HTMLLabelElement);
//This probably shouldn't be its own thing.

export class TooltipManager {
    boxDrawItems: HTMLButtonElement[];
    boxSelectItems: HTMLButtonElement[];
    bottomTooltip: HTMLElement;
    bottomTooltipText: HTMLElement;
    bottomContent: any[];
    bottomActive: boolean;

    constructor() {
        this.boxDrawItems = [];
        this.boxSelectItems = [];
        this.bottomTooltip = getRequiredElement('bottomTooltip', HTMLElement);
        this.bottomTooltipText = getRequiredElement(
            'bottomTooltipText',
            HTMLElement,
        );
        this.setUpBoxes();
        this.bottomActive = false;
        this.bottomContent = [];
        this.setEventListeners();
        this.getData();
    }

    async getData() {
        const response = await fetch('./client/assets/tooltips.json');
        const data = await response.json();
        this.bottomContent = data.bottomContent;
    }

    async awaitDisable() {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!this.bottomActive) {
            this.bottomTooltip.style.visibility = 'hidden';
            nameInput.style.visibility = 'hidden';
            nameLabel.style.visibility = 'hidden';
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
        }
    }

    setEventListeners() {
        for (let i = 0; i < 10; i++) {
            this.boxDrawItems[i].addEventListener('mouseover', () => {
                this.bottomActive = true;
                this.bottomTooltipText.innerText = this.bottomContent[i].draw;
                nameInput.style.visibility = 'hidden';
                nameLabel.style.visibility = 'hidden';
                this.bottomTooltip.style.visibility = 'visible';
            });

            this.boxDrawItems[i].addEventListener('mouseout', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });

            this.boxSelectItems[i].addEventListener('mouseover', () => {
                this.bottomActive = true;
                this.bottomTooltipText.innerText = this.bottomContent[i].select;
                if (i === 6 || i === 7) {
                    nameInput.style.visibility = 'visible';
                    nameLabel.style.visibility = 'visible';
                } else {
                    nameInput.style.visibility = 'hidden';
                    nameLabel.style.visibility = 'hidden';
                }
                this.bottomTooltip.style.visibility = 'visible';
            });

            this.boxSelectItems[i].addEventListener('mouseout', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });

            this.bottomTooltip.addEventListener('mouseenter', () => {
                this.bottomActive = true;
            });

            this.bottomTooltip.addEventListener('mouseleave', () => {
                this.bottomActive = false;
                this.awaitDisable();
            });
        }
    }
}
