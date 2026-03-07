// Class representing an instance of a colour.
// Just has basic setters for RGBA, and a toString method.
export class ColInst {
    blue: number;
    green: number;
    red: number;
    alpha: number;

    constructor(newR: number, newG: number, newB: number, newA: number) {
        this.red = newR;
        this.green = newG;
        this.blue = newB;
        this.alpha = newA;
    }

    setR(newR: number) {
        this.red = newR;
    }

    setG(newG: number) {
        this.green = newG;
    }

    setB(newB: number) {
        this.blue = newB;
    }

    setA(newA: number) {
        this.alpha = newA;
    }

    toString(): string {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha / 100})`;
    }
}

export function stringToColInst(newS: string) {
    if (newS.charAt(0) === '#') {
        return new ColInst(
            parseInt(newS.slice(1, 3), 16),
            parseInt(newS.slice(3, 5), 16),
            parseInt(newS.slice(5, 7), 16),
            100,
        );
    } else if (newS.slice(0, 4) === 'rgba') {
        const splits = newS.slice(5).split(' ');
        return new ColInst(
            parseInt(splits[0].slice(0, splits[0].length)),
            parseInt(splits[1].slice(0, splits[1].length)),
            parseInt(splits[2].slice(0, splits[2].length)),
            Math.round(parseFloat(splits[3].slice(0, splits[3].length)) * 100),
        );
    } else if (newS.slice(0, 3) === 'rgb') {
        const splits = newS.slice(4).split(' ');
        return new ColInst(
            parseInt(splits[0].slice(0, splits[0].length)),
            parseInt(splits[1].slice(0, splits[1].length)),
            parseInt(splits[2].slice(0, splits[2].length)),
            100,
        );
    }
    console.log('Error, unrecognized colour string format');
    return new ColInst(255, 0, 255, 100);
}

export const GREY = '#cccccc';
export const GREY_LIGHT = '#eeeeee';
export const RED = '#cc0000';
export const BLUE = '#0000cc';
export const GOLD = '#ffd500';
export const BLACK = '#000000';
export const WHITE = 'rgba(255, 255, 255, 1)';
export const WHITE_50 = 'rgba(255, 255, 255, 0.5)';
