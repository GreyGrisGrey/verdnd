import type { DicePayload } from '../../shared/objectEvents.ts';
import { SingleRoll } from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { rollPayloadToRow } from '../converter.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';

export async function addDice(
    newDice: DicePayload,
    userId: string,
    userName: string,
    currGame: GameObject,
    cli: PostGresData,
) {
    const rollList: SingleRoll[] = [];
    const rollResult = { result: newDice.modifier, rolls: rollList };
    for (const obj of newDice.toRoll) {
        if (obj.dropHigh + obj.dropLow > obj.diceCount) {
            return;
        }
        const rolls = [];
        for (let i = 0; i < obj.diceCount; i++) {
            rolls.push(Math.ceil(Math.random() * obj.diceSize));
        }
        rolls.sort((a, b) => a - b);
        for (let i = 0; i < obj.diceCount; i++) {
            if (obj.dropLow > 0) {
                obj.dropLow--;
                rollResult.rolls.push({
                    result: rolls[i],
                    exclude: true,
                    size: obj.diceSize,
                });
            } else if (!(i + obj.dropHigh >= obj.diceCount)) {
                rollResult.result += rolls[i];
                rollResult.rolls.push({
                    result: rolls[i],
                    exclude: false,
                    size: obj.diceSize,
                });
            } else {
                rollResult.rolls.push({
                    result: rolls[i],
                    exclude: true,
                    size: obj.diceSize,
                });
            }
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
