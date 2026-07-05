export class Ability {
    name: string;
    proficiency: number;
    score: number;
    modifier: number;
    constructor(name: string) {
        this.name = name;
        this.proficiency = 0;
        this.score = 10;
        this.modifier = 0;
    }

    setScore() {}
}
