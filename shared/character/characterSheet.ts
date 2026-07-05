import { Ability } from './ability.ts';
import { Skill } from './skill.ts';

export class CharacterSheet {
    name: string;
    game: string;
    player: string;
    proficiency: number;
    level: number;
    abilities: Map<string, Ability>;
    skills: Map<string, Skill>;
    constructor() {
        this.name = 'grog';
        this.game = 'none';
        this.player = 'none';
        this.proficiency = 2;
        this.level = 1;
        this.abilities = new Map();
        this.skills = new Map();
    }

    setAbilities(abilities: Map<string, string>) {
        abilities.forEach((value: string, key: string) => {
            this.abilities.set(key, new Ability(value));
        });
    }

    setSkills(skills: Map<string, Map<string, string>>) {
        skills.forEach((value: any, key: string) => {
            this.skills.set(key, new Skill(value.name, value.ability));
        });
    }
}
