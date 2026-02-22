import { GRAY } from '../colors.ts';
import { getRequiredElement } from '../dom.ts';

const rightBar = getRequiredElement('rightBar', HTMLElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const rollBox = getRequiredElement('rollContainer', HTMLElement);
const colBox = getRequiredElement('colContainer', HTMLElement);

export class RollMenu {
  textBox: HTMLElement;
  active: boolean;

  constructor() {
    this.textBox = document.createElement('textarea');
    this.active = false;
    this.setMainElements();
  }

  setMainElements() {
    chatBox.append(this.textBox);
    chatBox.style.background = GRAY.toString();
    this.textBox.style.position = 'absolute';
    this.textBox.style.bottom = '11px';
    this.textBox.style.height = '50px';
    this.textBox.style.left = '11px';
    this.textBox.style.visibility = 'visible';
    this.textBox.style.resize = 'none';
  }

  toggleActive(newAct: boolean) {
    this.active = newAct;
    rollBox.style.visibility = this.active ? 'visible' : 'hidden';
    rollBox.style.pointerEvents = this.active ? 'auto' : 'none';
    colBox.style.visibility = this.active ? 'hidden' : 'visible';
    colBox.style.pointerEvents = this.active ? 'none' : 'auto';
    chatBox.style.visibility = this.active ? 'visible' : 'hidden';
    chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
  }

  step() {
    const rH = rightBar.style.height;
    const rW = rightBar.style.width;
    if (chatBox.style.height !== rH || chatBox.style.width !== rW) {
      chatBox.style.width = rW;
      chatBox.style.height = rH;
      const w = parseInt(rW, 10);
      if (!Number.isNaN(w)) {
        this.textBox.style.width = `${w - 30}px`;
      }
    }
  }
}
