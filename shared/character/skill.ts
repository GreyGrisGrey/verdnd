import { Ability } from './ability.ts';

export enum SkillCalc {
    Default = 'DEFAULT',
    Manual = 'MANUAL',
}

export class Skill {
    name: string;
    proficiency: number;
    calculation: SkillCalc;
    ability: string;
    constructor(name: string, ability: string) {
        this.name = name;
        this.proficiency = 0;
        this.calculation = SkillCalc.Default;
        this.ability = ability;
    }
}
