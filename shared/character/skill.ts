export enum SkillCalc {
    Default = 'DEFAULT',
    Manual = 'MANUAL',
}

export class Skill {
    name: string;
    proficiency: number;
    calculation: SkillCalc;
    ability: string;
    modifier: number;
    constructor(name: string, ability: string) {
        this.name = name;
        this.proficiency = 0;
        this.calculation = SkillCalc.Default;
        this.ability = ability;
        this.modifier = 0;
    }

    updateMod(ability: number, proficiency: number) {
        this.modifier = ability + this.proficiency * proficiency;
    }
}
