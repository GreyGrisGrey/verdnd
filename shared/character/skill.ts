import {Ability} from './ability.ts';

export enum SkillCalc {
    Default = 'DEFAULT',
    Manual = 'MANUAL',
}

export class Skill {
    name: string;
    proficiency: number;
    calculation: SkillCalc;
    ability: Ability | null;
    constructor() {
        this.name = 'grog';
        this.proficiency = 0;
        this.calculation = SkillCalc.Default;
        this.ability = null;
    }
}