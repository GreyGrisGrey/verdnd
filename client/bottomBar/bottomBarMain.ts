import { tempStore } from '../serveInter.ts';
import { getRequiredElement } from '../dom.ts';
import { BottomDrawManager } from './bottomDrawMan.ts';
import { BottomSelectManager } from './bottomSelectMan.ts';
import { BoardSelectMode } from '../boardCanvas/boardSelectMode.ts';
import { BoardDrawMode } from '../boardCanvas/boardDrawMode.ts';
const bottomBar = getRequiredElement('bottomBar', HTMLElement);

export class BottomBarManager {
    serveInter: tempStore;
    drawMan: BottomDrawManager;
    selectMan: BottomSelectManager;
    boxItems: HTMLElement[];
    constructor(server: tempStore, drawMode: BoardDrawMode) {
        this.serveInter = server;
        this.drawMan = new BottomDrawManager(server, drawMode);
        this.selectMan = new BottomSelectManager(server);
        this.boxItems = [];
        this.setUpBoxes();
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement('bottomBox' + i.toString(), HTMLElement),
            );
            this.boxItems[i].style.left = ((i + 9) % 10) * 60 + 'px';
        }
    }
}
