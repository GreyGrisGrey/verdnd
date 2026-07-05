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

    setScore(num: number) {
        this.score = num;
        this.modifier = Math.floor((num - 10) / 2);
    }

    randomScore() {
        const nums = [];
        for (let i = 0; i < 4; i++) {
            nums.push(Math.ceil(Math.random() * 6));
        }
        nums.sort();
        this.setScore(nums[1] + nums[2] + nums[3]);
    }
}
