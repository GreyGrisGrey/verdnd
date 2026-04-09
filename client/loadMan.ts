import { getRequiredElement } from './dom.ts';
const loadWall = getRequiredElement('loadBlock', HTMLElement);
const loadText = getRequiredElement('loadText', HTMLElement);

export function updateLoadText(newText: string = '') {
    if (newText !== '') {
        loadText.innerText = newText;
    }
    const box = loadText.getBoundingClientRect();
    const leftOffset = (box.right - box.left) / 2;
    const topOffset = (box.bottom - box.top) / 2;
    loadText.style.left = `${window.innerWidth / 2 - leftOffset}px`;
    loadText.style.top = `${window.innerHeight / 2 - topOffset}px`;
}

export function updateLoadBoxSize() {
    updateLoadText();
    loadWall.style.width = window.innerWidth + 'px';
    loadWall.style.height = window.innerHeight + 'px';
}

export function updateLoadVis(active: boolean) {
    loadWall.style.visibility = active ? 'visible' : 'hidden';
}
