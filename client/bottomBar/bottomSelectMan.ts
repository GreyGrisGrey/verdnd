import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { BoardSelectMode } from '../boardCanvas/boardSelectMode.ts';
const bottomBar = getRequiredElement('bottomBar', HTMLElement);

export class BottomSelectManager {
    serveInter: tempStore;
    boxItems: HTMLElement[];
    constructor(server: tempStore) {
        this.serveInter = server;
        this.boxItems = [];
        this.setUpBoxes();
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomSelectBox' + i.toString(),
                    HTMLElement,
                ),
            );
        }
    }
}
