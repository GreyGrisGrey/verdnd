import { getRequiredElement } from './dom.ts';
const bottomBar = getRequiredElement('bottomBar', HTMLElement);
const leftBar = getRequiredElement('leftBar', HTMLElement);
const rightBar = getRequiredElement('rightBar', HTMLElement);
const modeMenu = getRequiredElement('modeMenu', HTMLElement);
const tooltip = getRequiredElement('tooltip', HTMLElement);
const tooltipText = getRequiredElement('tooltipText', HTMLElement);

export enum TooltipMode {
    Left = 0,
    Right = 1,
    Bottom = 2,
    Mode = 3,
}

export class TooltipManager {
    active: boolean;
    data: Map<string, string>[];
    currMode: TooltipMode;
    currText: string;
    constructor() {
        this.active = false;
        this.data = [];
        this.currMode = TooltipMode.Left;
        this.currText = 'lorem ipsum etcetera';
        this.getData();
        tooltip.style.zIndex = '10';
        this.disable();
    }

    async getData() {
        const response = await fetch('./client/assets/tooltipsTwo.json');
        const data = await response.json();
        this.data = [data.left, data.right, data.bottom, data.mode].map(
            (obj: Record<string, string>) => new Map(Object.entries(obj)),
        );
    }

    updateTooltipData(newMode: TooltipMode, index: string) {
        this.currMode = newMode;
        const curr = this.data[newMode];
        if (curr) {
            this.currText = curr.get(index) || 'lorem ipsum etcetera';
            console.log(this.currText);
            tooltipText.innerText = this.currText;
        }
        this.updateTooltipPosition();
        this.enable();
    }

    updateTooltipPosition() {
        if (this.currMode === TooltipMode.Bottom) {
            tooltip.style.bottom = '100px';
            tooltip.style.left = '400px';
            tooltip.style.top = '';
        } else if (this.currMode === TooltipMode.Left) {
            tooltip.style.left = '300px';
            tooltip.style.top = '40px';
        } else if (this.currMode === TooltipMode.Right) {
            tooltip.style.right = '320px';
            tooltip.style.top = '40px';
            tooltip.style.left = '';
        } else {
            tooltip.style.left = '120px';
            tooltip.style.bottom = '20px';
            tooltip.style.top = '';
        }
    }

    disable() {
        this.active = false;
        tooltip.style.visibility = 'hidden';
    }

    enable() {
        this.active = true;
        tooltip.style.visibility = 'visible';
    }
}
