import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { DicePayload } from '../scripts/rightBar/rollBarMenu.ts';
import { ddb, DICE_TABLE, META_TABLE } from './dynamo.ts';

const META_KEY = 'counters';
const DICE_BUFFER_SIZE = 50;

export class StoredDice {
    async rollDice(newDice: DicePayload): Promise<number | undefined> {
        let result = newDice.modifier;
        if (newDice.singleDice) {
            const mainDice = [newDice.singleNum, 0];
            switch (newDice.singleNum) {
                case 4:
                    mainDice[1] = newDice.four;
                    break;
                case 6:
                    mainDice[1] = newDice.six;
                    break;
                case 8:
                    mainDice[1] = newDice.eight;
                    break;
                case 10:
                    mainDice[1] = newDice.ten;
                    break;
                case 12:
                    mainDice[1] = newDice.twelve;
                    break;
                case 20:
                    mainDice[1] = newDice.twenty;
                    break;
                case 100:
                    mainDice[1] = newDice.hundred;
                    break;
            }
            if (newDice.dropLow + newDice.dropHigh < mainDice[1]) {
                let results = [];
                while (mainDice[1] > 0) {
                    results.push(
                        (Math.round(Math.random() * 10000) % mainDice[0]) + 1,
                    );
                    mainDice[1]--;
                }
                while (mainDice[1] < 0) {
                    results.push(
                        -(
                            (Math.round(Math.random() * 10000) % mainDice[0]) +
                            1
                        ),
                    );
                    mainDice[1]++;
                }
                results = results.sort(function (curr, next) {
                    return next - curr;
                });
                let currIndex = newDice.dropLow;
                while (currIndex < results.length - newDice.dropHigh) {
                    result += results[currIndex];
                    currIndex++;
                }
                newDice.result = result;
                await this.recordDice(newDice);
                return result;
            }
        } else {
            //WIP
            await this.recordDice(newDice);
            return result;
        }
    }

    async recordDice(newDice: DicePayload): Promise<void> {
        const metaRes = await ddb.send(
            new UpdateCommand({
                TableName: META_TABLE,
                Key: { key: META_KEY },
                UpdateExpression: 'ADD nextDiceIndex :one',
                ExpressionAttributeValues: { ':one': 1 },
                ReturnValues: 'UPDATED_NEW',
            }),
        );
        const index =
            ((metaRes.Attributes!.nextDiceIndex as number) - 1) % DICE_BUFFER_SIZE;
        await ddb.send(
            new PutCommand({
                TableName: DICE_TABLE,
                Item: { index, ...newDice },
            }),
        );
    }

    async getDice(): Promise<{ start: number; map: Map<number, DicePayload> }> {
        const [metaRes, scanRes] = await Promise.all([
            ddb.send(new GetCommand({ TableName: META_TABLE, Key: { key: META_KEY } })),
            ddb.send(new ScanCommand({ TableName: DICE_TABLE })),
        ]);

        const start =
            ((metaRes.Item?.nextDiceIndex as number) ?? 0) % DICE_BUFFER_SIZE;
        const map = new Map<number, DicePayload>();
        for (const item of scanRes.Items ?? []) {
            const { index, ...payload } = item;
            map.set(index as number, payload as DicePayload);
        }
        return { start, map };
    }
}
