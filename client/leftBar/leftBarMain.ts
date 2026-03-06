import { ColourBox } from './colourBox.ts';

// Class managing the top-left box.
// Somewhat poorly named.
export class LeftBarManager {
    colourPicker: ColourBox;
    constructor() {
        this.colourPicker = new ColourBox();
    }
}
