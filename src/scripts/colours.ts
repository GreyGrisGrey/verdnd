
export class ColInst {
    blue: number
    green: number
    red: number
    alpha: number
    
    constructor(newR: number, newG: number, newB: number, newA: number) {
        this.red = newR;
        this.green = newG;
        this.blue = newB;
        this.alpha = newA;
    }
    
    setR(newR: number) {
        this.red = newR
    }
    
    setG(newG: number) {
        this.green = newG
    }
    
    setB(newB: number) {
        this.blue = newB
    }
    
    setA(newA: number) {
        this.alpha = newA
    }
}

export const GREY = '#cccccc';
export const GREY_LIGHT = '#eeeeee';
export const RED = '#cc0000';
export const BLUE = '#0000cc';
export const GOLD = '#ffd500';
export const BLACK = '#000000';
export const WHITE = 'rgba(255, 255, 255, 1)';
export const WHITE_50 = 'rgba(255, 255, 255, 0.5)';
