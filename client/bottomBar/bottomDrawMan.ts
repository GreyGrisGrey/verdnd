import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
const bottomBar = getRequiredElement('bottomBar', HTMLElement);

export class BottomDrawManager {
    serveInter: tempStore
    boxItems: HTMLElement[]
    constructor(server: tempStore) {
        this.serveInter = server
        this.boxItems = [];
    }
    
    setUpBoxes() {
        for(let i = 1; i < 11; i++) {
            this.boxItems.push(getRequiredElement('bottomDrawBox' + i.toString(), HTMLElement))
        }
    }
}