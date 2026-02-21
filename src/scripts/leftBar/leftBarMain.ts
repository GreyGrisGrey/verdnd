import * as colourBox from "./colourBox.ts"
export class LeftBarManager {
    colourPicker: colourBox.ColourBox
    constructor() {
        this.colourPicker = new colourBox.ColourBox()
    }
}