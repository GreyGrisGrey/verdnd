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
    width?: string;
    height?: string;
    bottom?: string;
    right?: string;
    left?: string;
    top?: string;
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
        this.updateTooltipPosition();
        if (curr) {
            this.updateTooltipText(curr.get(index) || [], index);
        }
        tooltip.style.height = 'fit-content';
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
            if (text.width) {
                tooltip.style.width = text.width;
            }
            if (text.height) {
                tooltip.style.height = text.height;
            }
            if (text.bottom) {
                tooltip.style.bottom = text.bottom;
                tooltip.style.top = '';
            }
            if (text.left) {
                tooltip.style.left = text.left;
                tooltip.style.right = '';
            }
            if (text.right) {
                tooltip.style.right = text.right;
                tooltip.style.left = '';
            }
            if (text.top) {
                tooltip.style.top = text.top;
                tooltip.style.bottom = '';
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
            tooltip.style.fontSize = '12px';
        } else if (this.currMode === TooltipMode.Left) {
            tooltip.style.left = '300px';
            tooltip.style.top = '40px';
            tooltip.style.width = '100px';
            tooltip.style.fontSize = '14px';
        } else if (this.currMode === TooltipMode.Right) {
            tooltip.style.right = '320px';
            tooltip.style.top = '40px';
            tooltip.style.left = '';
            tooltip.style.width = '150px';
            tooltip.style.fontSize = '14px';
        } else {
            tooltip.style.left = '80px';
            tooltip.style.bottom = '20px';
            tooltip.style.top = '';
            tooltip.style.width = '160px';
            tooltip.style.fontSize = '14px';
        }
        tooltip.style.height = 'fit-content';
    }

    // Disables the tooltip immediately
    hardDisable() {
        this.active = false;
        tooltip.style.visibility = 'hidden';
    }

    // Waits a moment and then disables the tooltip if it's not active.
    // For the purposes of avoiding it flickering too much when a user is moving between a bunch of buttons really fast.
    async shutOff() {
        await new Promise((resolve) => setTimeout(resolve, 75));
        if (!this.active) {
            tooltip.style.visibility = 'hidden';
        }
    }

    // Disables, but only after a delay.
    disable() {
        this.active = false;
        this.shutOff();
    }

    // Disdisables
    enable() {
        this.active = true;
        tooltip.style.visibility = 'visible';
    }
}
