import { getRequiredElement } from './dom.ts';
const tooltip = getRequiredElement('tooltip', HTMLElement);

export enum TooltipMode {
    Left = 0,
    Right = 1,
    Bottom = 2,
    Mode = 3,
}

export interface TooltipData {
    type?: string;
    boldText?: string;
    text: string;
    colour?: string;
    size?: string;
}

export class TooltipManager {
    active: boolean;
    data: Map<string, TooltipData[]>[];
    currMode: TooltipMode;
    activeDiv: HTMLElement;
    constructor() {
        this.active = false;
        this.data = [];
        this.currMode = TooltipMode.Left;
        this.activeDiv = document.createElement('div');
        this.getData();
        tooltip.style.zIndex = '10';
        this.disable();
    }

    // Gets the tooltip text data.
    async getData() {
        const response = await fetch('./client/assets/tooltips.json');
        const data = await response.json();
        this.data = [data.left, data.right, data.bottom, data.mode].map(
            (obj: Record<string, TooltipData[]>) =>
                new Map(Object.entries(obj)),
        );
    }

    // Updates the tooltip.
    updateTooltipData(newMode: TooltipMode, index: string) {
        this.currMode = newMode;
        const curr = this.data[newMode];
        if (curr) {
            this.updateTooltipText(curr.get(index) || [], index);
        }
        this.updateTooltipPosition();
        this.enable();
    }

    // Updates the text of the tooltip based on the wonderful bundle of tool tip data objects it gets given.
    updateTooltipText(newText: TooltipData[], index: string) {
        this.activeDiv.remove();
        this.activeDiv = document.createElement('div');
        tooltip.append(this.activeDiv);
        for (const text of newText) {
            const newDiv = document.createElement(
                text.type === 'header' ? 'header' : 'p',
            );
            if (text.boldText) {
                newDiv.innerHTML = `<b>${text.boldText}</b>${text.text}`;
            } else if (text.type !== 'header') {
                newDiv.innerText = text.text;
            } else {
                newDiv.innerHTML = `<b>${text.text}</b>`;
            }
            if (text.colour) {
                newDiv.style.color = text.colour;
            }
            if (text.size) {
                newDiv.style.fontSize = text.size;
            }
            this.activeDiv.append(newDiv);
        }
    }

    // Updates the position of the tooltip based on its current mode.
    updateTooltipPosition() {
        if (this.currMode === TooltipMode.Bottom) {
            tooltip.style.bottom = '100px';
            tooltip.style.left = `${window.innerWidth / 2 - 200}px`;
            tooltip.style.top = '';
            tooltip.style.width = '400px';
            tooltip.style.height = '60px';
            tooltip.style.fontSize = '12px';
        } else if (this.currMode === TooltipMode.Left) {
            tooltip.style.left = '300px';
            tooltip.style.top = '40px';
            tooltip.style.width = '100px';
            tooltip.style.height = '200px';
            tooltip.style.fontSize = '14px';
        } else if (this.currMode === TooltipMode.Right) {
            tooltip.style.right = '320px';
            tooltip.style.top = '40px';
            tooltip.style.left = '';
            tooltip.style.width = '150px';
            tooltip.style.height = '270px';
            tooltip.style.fontSize = '14px';
        } else {
            tooltip.style.left = '80px';
            tooltip.style.bottom = '20px';
            tooltip.style.top = '';
            tooltip.style.width = '160px';
            tooltip.style.height = '250px';
            tooltip.style.fontSize = '14px';
        }
    }

    // Disables
    disable() {
        this.active = false;
        tooltip.style.visibility = 'hidden';
    }

    // Disdisables
    enable() {
        this.active = true;
        tooltip.style.visibility = 'visible';
    }
}
