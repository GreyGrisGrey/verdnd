import { getRequiredElement } from './dom.ts';
const topBar = getRequiredElement('topBar', HTMLElement);
const nameBox = getRequiredElement('playerDataBox', HTMLElement);

export class TopBarManager {
    constructor() {
        topBar.style.width = window.innerWidth + 'px';
        this.updateUserBox();
    }

    updateUserBox() {
        const newText = `Curr user : Id:${localStorage['id']}, Name:${localStorage['name']}`;
        nameBox.innerText = newText;
        nameBox.style.left = window.innerWidth / 2 - 100 + 'px';
    }
}
