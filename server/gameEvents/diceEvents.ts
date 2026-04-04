import type { DicePayload } from '../../shared/objectEvents.ts';
import { SingleRoll } from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { rollPayloadToRow } from '../converter.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';

// Function for adding a new roll to a specified game.
export async function addDice(
    newDice: DicePayload,
    userId: string,
    userName: string,
    currGame: GameObject,
    cli: PostGresData,
) {
    const rollList: SingleRoll[] = [];
    const rollResult = { result: newDice.modifier, rolls: rollList };
    if (newDice.advantage || newDice.disadvantage) {
        const rolls = [
            Math.ceil(Math.random() * 20),
            Math.ceil(Math.random() * 20),
        ];
        rollResult.result += newDice.advantage
            ? Math.max(rolls[0], rolls[1])
            : Math.min(rolls[0], rolls[1]);
        if (newDice.advantage) {
            rollResult.rolls.push({
                result: Math.max(rolls[0], rolls[1]),
                size: 20,
                exclude: false,
            });
            rollResult.rolls.push({
                result: Math.min(rolls[0], rolls[1]),
                size: 20,
                exclude: true,
            });
        } else {
            rollResult.rolls.push({
                result: Math.min(rolls[0], rolls[1]),
                size: 20,
                exclude: false,
            });
            rollResult.rolls.push({
                result: Math.max(rolls[0], rolls[1]),
                size: 20,
                exclude: true,
            });
        }
    } else {
        while (newDice.diceCount > 0) {
            const newResult = Math.ceil(Math.random() * newDice.diceSize);
            rollResult.result += newResult;
            rollList.push({
                result: newResult,
                size: newDice.diceSize,
                exclude: false,
            });
            newDice.diceCount -= 1;
        }
    }
    await currGame.waitLock('dice');
    currGame.diceLock = true;
    currGame.diceMap.set(currGame.currDice, {
        entity: Entity.Roll,
        action: Action.Update,
        id: currGame.currDice,
        result: rollResult,
        userId: userId,
        userName: userName,
    });
    const sendObj = JSON.stringify({
        entity: Entity.Roll,
        action: Action.Update,
        id: currGame.currDice,
        result: rollResult,
        userId: userId,
        userName: userName,
    });
    await currGame.waitLock('db');
    currGame.dbLock = true;
    cli.addRoll(
        currGame.gameId,
        rollPayloadToRow({
            entity: Entity.Roll,
            action: Action.Update,
            id: currGame.currDice,
            result: rollResult,
            userId: userId,
            userName: userName,
        }),
    );
    currGame.dbLock = false;
    currGame.currDice++;
    currGame.broadcast(sendObj);
    currGame.diceLock = false;
}
