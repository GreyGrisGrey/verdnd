import { ColourBox } from './colourBox.ts';
export class LeftBarManager {
    colourPicker: ColourBox;
    constructor() {
        this.colourPicker = new ColourBox();
    }
}
