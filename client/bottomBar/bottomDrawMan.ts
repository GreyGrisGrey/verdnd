import { getRequiredElement } from '../dom.ts';
import { tempStore } from '../serveInter.ts';
import { BoardDrawMode } from '../boardCanvas/boardDrawMode.ts';
const bottomBar = getRequiredElement('bottomBar', HTMLElement);
const can = getRequiredElement('board', HTMLCanvasElement);

export class BottomDrawManager {
    serveInter: tempStore;
    boxItems: HTMLButtonElement[];
    mode: BoardDrawMode;
    constructor(server: tempStore, mode: BoardDrawMode) {
        this.serveInter = server;
        this.boxItems = [];
        this.mode = mode;
        this.setUpBoxes();
        this.flipBoxes(0);
    }

    setUpBoxes() {
        for (let i = 0; i < 10; i++) {
            this.boxItems.push(
                getRequiredElement(
                    'bottomDrawBox' + i.toString(),
                    HTMLButtonElement,
                ),
            );
            this.boxItems[i].addEventListener('click', () => {
                this.mode.handleSwitchEvent(i.toString());
                if (i < 8) {
                    this.flipBoxes(i);
                }
            });
        }
        document.addEventListener('keydown', (event) => {
            this.mode.handleKeySwitchEvent(event.key);
            if (!Number.isNaN(event.key) && parseInt(event.key) < 8) {
                this.flipBoxes(parseInt(event.key));
            }
        });
    }

    flipBoxes(onIndex: number) {
        for (let i = 0; i < 10; i++) {
            this.boxItems[i].disabled = onIndex === i && (i < 5 || i > 7);
        }
    }
}
