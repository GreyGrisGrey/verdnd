import { getRequiredElement } from './dom.ts';
const topBar = getRequiredElement('topBar', HTMLElement);
const nameBox = getRequiredElement('playerDataBox', HTMLElement);

export class TopBarManager {
    constructor() {
        topBar.style.width = window.innerWidth + 'px';
        this.updateUserBox();
    }

    // Updates the user box to match the user's credentials.
    updateUserBox() {
        const newText = `Curr user : Id:${localStorage['id']}, Name:${localStorage['name']}`;
        nameBox.innerText = newText;
        nameBox.style.left = window.innerWidth / 2 - 100 + 'px';
    }

    updateSize() {
        if (topBar.style.width !== window.innerWidth + 'px') {
            topBar.style.width = window.innerWidth + 'px';
            nameBox.style.left = window.innerWidth / 2 - 100 + 'px';
        }
    }
}
