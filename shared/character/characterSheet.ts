import { Ability } from './ability.ts';
import { Skill } from './skill.ts';

export class CharacterSheet {
    name: string;
    game: string;
    species: string;
    player: string;
    proficiency: number;
    abilities: Map<string, Ability>;
    skills: Map<string, Skill>;
    levels: Map<string, number>;
    constructor() {
        this.name = 'grog';
        this.game = 'none';
        this.species = 'bug';
        this.player = 'none';
        this.proficiency = 2;
        this.abilities = new Map();
        this.skills = new Map();
        this.levels = new Map();
        this.levels.set('total', 1);
    }

    setAbilities(abilities: Map<string, string>) {
        abilities.forEach((value: string, key: string) => {
            this.abilities.set(key, new Ability(value));
        });
    }

    getAbilities() {
        return this.abilities;
    }

    setSkills(skills: Map<string, Map<string, string>>) {
        skills.forEach((value: any, key: string) => {
            this.skills.set(key, new Skill(value.name, value.ability));
        });
    }

    getSkills() {
        return this.skills;
    }

    getLevel() {
        return this.levels.get('total');
    }

    debugRandomize() {
        this.abilities.forEach((value: any, key: string) => {
            value.randomScore();
        });
        this.skills.forEach((value: any, key: string) => {
            if (this.abilities.has(value.ability)) {
                const abAdd = this.abilities.get(value.ability)!.modifier;
                value.updateMod(abAdd, this.proficiency);
            }
        });
    }
}
