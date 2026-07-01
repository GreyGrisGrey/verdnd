export class Ability {
    name: string
    proficiency: number;
    default: number;
    modifier: number;
    constructor() {
        this.name = "grog";
        this.proficiency = 0;
        this.default = 10;
        this.modifier = 0;
    }
}