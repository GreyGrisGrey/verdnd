import { tempStore } from '../serveInter.ts';
import { getRequiredElement } from '../dom.ts';
import { BottomDrawManager } from './bottomDrawMan.ts';
import { BottomSelectManager } from './bottomSelectMan.ts';
const bottomBar = getRequiredElement('bottomBar', HTMLElement);

export class BottomBarManager {
    serveInter: tempStore
    drawMan: BottomDrawManager
    selectMan: BottomSelectManager
    boxItems: HTMLElement[]
    constructor(server: tempStore) {
        this.serveInter = server
        this.drawMan = new BottomDrawManager(server)
        this.selectMan = new BottomSelectManager(server)
        this.boxItems = [];
    }
    
    setUpBoxes() {
        for(let i = 1; i < 11; i++) {
            this.boxItems.push(getRequiredElement('bottomBox' + i.toString(), HTMLElement))
        }
    }
}