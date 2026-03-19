import {
    objectTableToPayloads,
    layerTableToPayloads,
    rollTableToPayloads,
    tokenTableToPayloads,
} from './converter.ts';

import { Client } from 'pg';
import crypto from 'crypto';

export class PostGresData {
    client: Client;
    secClient: Client;
    gameLock: boolean;
    queue: string[];

    constructor() {
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'boardtest',
        });
        this.secClient = new Client({
            user: 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'template1',
        });
        this.gameLock = false;
        this.client.on('error', (err) => {
            console.error('something bad has happened!', err.stack);
        });
        this.queue = [];
        this.client.connect();
    }

    async resetData() {
        await this.blowUpEverything();
        await this.constructTables();
    }

    async constructTables() {
        try {
            await this.client.query({
                text: `CREATE SCHEMA mainschema`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `CREATE TABLE mainschema.users (UserId text NOT NULL, Username text NOT NULL, Password text NOT NULL)`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `CREATE TABLE mainschema.meta (FreeGame int)`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `CREATE TABLE mainschema.games (GameId int NOT NULL, GmId text, BgColour text)`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `INSERT INTO mainschema.meta VALUES (0)`,
                rowMode: 'array',
            });
        } catch (err) {
            console.log('Database error: Base table already constructed.', err);
        }
    }

    // who needs a database anyway
    async blowUpEverything() {
        try {
            await this.client.query({
                text: `DROP SCHEMA mainschema CASCADE`,
            });
        } catch (err) {
            console.log(
                'Database error: Base schema does not exist to be destroyed.',
                err,
            );
        }
    }

    async printUsers() {
        try {
            const res = await this.client.query({
                text: `SELECT * FROM mainschema.users`,
                rowMode: 'array',
            });
            console.log(res.rows);
        } catch (err) {
            console.log(
                'Database error: Could not select from mainschema.users.',
                err,
            );
        }
    }

    async printTokens() {
        try {
            const res = await this.client.query({
                text: `SELECT * FROM mainschema.tokens0`,
                rowMode: 'array',
            });
            console.log(res.rows);
        } catch (err) {
            console.log(
                'Database error: Could not select from mainschema.tokens0.',
                err,
            );
        }
    }

    async printGames() {
        try {
            const res = await this.client.query({
                text: `SELECT * FROM mainschema.games`,
                rowMode: 'array',
            });
            console.log(res.rows);
        } catch (err) {
            console.log(
                'Database error: Could not select from mainschema.games.',
                err,
            );
        }
    }

    async printAll() {
        try {
            const res = await this.client.query({
                text: `SELECT table_schema, table_name
                FROM information_schema.tables WHERE table_schema = 'mainschema'`,
                rowMode: 'array',
            });
            for (const val of res.rows) {
                console.log(val);
            }
        } catch (err) {
            console.log('Database error: Could not select something', err);
        }
    }

    async constructGameTables(newId: number) {
        try {
            await this.client.query({
                text: `CREATE TABLE mainschema.objects${newId} (Shape text NOT NULL, Colour text, LayerId int, ObjectId int PRIMARY KEY, StructureData text NOT NULL, Owner text)`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `CREATE TABLE mainschema.layers${newId} (GmVisible boolean, PlayerVisible boolean, zOrder int, Id int PRIMARY KEY, X real, Y real, Name text)`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `CREATE TABLE mainschema.rolls${newId} (Id int PRIMARY KEY, Result int NOT NULL, UserId text, ResultData text)`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `CREATE TABLE mainschema.tokens${newId} (Id int PRIMARY KEY, Name text, Colour text, Move boolean, Active boolean)`,
                rowMode: 'array',
            });
        } catch (err) {
            console.log(
                `Database error: Failed to construct game Id ${newId}.`,
                err,
            );
        }
    }

    async addUser(newName: string, suppliedPass: string, newId: string) {
        try {
            const newPass = this.encrypt(suppliedPass);
            const res = await this.client.query({
                text: `SELECT userId FROM mainschema.users WHERE UserId = '${newId}'`,
                rowMode: 'array',
            });
            if (res.rows.length > 0) {
                return false;
            }
            await this.client.query({
                text: `INSERT INTO mainschema.users VALUES ('${newId}', '${newName}', '${newPass}')`,
                rowMode: 'array',
            });
            return true;
        } catch (err) {
            console.log('Database error: Could not add user.', err);
            return false;
        }
    }

    async verifyUser(id: string, suppliedPass: string) {
        try {
            const query = {
                text: `SELECT Password FROM mainschema.users WHERE UserId = '${id}'`,
                rowMode: 'array',
            };
            const result = await this.client.query(query);
            if (
                result.rows.length == 1 &&
                this.testEncrypt(suppliedPass, result.rows[0][0])
            ) {
                return true;
            }
            return false;
        } catch (err) {
            console.log('Database error: Could not verify user', err);
            return false;
        }
    }

    async checkGame(gameId: number) {
        try {
            const res = await this.client.query({
                text: `SELECT GameId FROM mainschema.games WHERE GameId = ${gameId}`,
                rowMode: 'array',
            });
            if (res.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.log(
                `Database error: Could not get game with Id ${gameId}`,
                err,
            );
            return false;
        }
    }

    async getGame(gameId: number) {
        try {
            if (await this.checkGame(gameId)) {
                const first = await this.client.query({
                    text: `SELECT * FROM mainschema.objects${gameId}`,
                    rowMode: 'array',
                });
                const second = await this.client.query({
                    text: `SELECT * FROM mainschema.layers${gameId}`,
                    rowMode: 'array',
                });
                const third = await this.client.query({
                    text: `SELECT * FROM mainschema.rolls${gameId}`,
                    rowMode: 'array',
                });
                const fourth = await this.client.query({
                    text: `SELECT * FROM mainschema.tokens${gameId}`,
                    rowMode: 'array',
                });
                const fifth = await this.client.query({
                    text: `SELECT BgColour FROM mainschema.games WHERE GameId = ${gameId}`,
                    rowMode: 'array',
                });
                const firstRes = objectTableToPayloads(first.rows);
                tokenTableToPayloads(fourth.rows, firstRes);
                return [
                    firstRes,
                    layerTableToPayloads(second.rows),
                    rollTableToPayloads(third.rows),
                    fifth.rows[0][0],
                ];
            }
            return false;
        } catch (err) {
            console.log(
                `Database error: Could not get game with Id ${gameId}`,
                err,
            );
            return false;
        }
    }

    async updateGame(gameId: number, newCol: string) {
        try {
            await this.client.query({
                text: `UPDATE mainschema.games SET BgColour = '${newCol}' WHERE GameId = ${gameId}`,
            });
            return true;
        } catch (err) {
            console.log(`Database error: Could not update game ${gameId}`, err);
            return false;
        }
    }

    async addToken(gameId: number, token: string) {
        try {
            await this.client.query({
                text: `INSERT INTO mainschema.tokens${gameId} VALUES ${token}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not add token ${token} to game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async destroyToken(gameId: number, objectId: number) {
        try {
            await this.client.query({
                text: `DELETE FROM mainschema.tokens${gameId} WHERE Id = ${objectId}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not destroy token ${objectId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async updateToken(gameId: number, objectId: number, token: string[]) {
        try {
            await this.client.query({
                text: `UPDATE mainschema.tokens${gameId} SET Name = '${token[0]}', Colour = '${token[1]}', Move = '${token[2]}', Active = '${token[3]}' WHERE Id = ${objectId}`,
            });
        } catch (err) {
            console.log(
                `Database error: Could not update token ${objectId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async addObject(gameId: number, object: string) {
        try {
            await this.client.query({
                text: `INSERT INTO mainschema.objects${gameId} VALUES ${object}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not add object ${object} to game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async updateObject(gameId: number, objectId: number, object: string[]) {
        try {
            await this.client.query({
                text: `UPDATE mainschema.objects${gameId} SET Colour = '${object[0]}', StructureData = '${object[1]}' WHERE ObjectId = ${objectId}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not update object ${objectId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async destroyObject(gameId: number, objectId: number) {
        try {
            await this.client.query({
                text: `DELETE FROM mainschema.objects${gameId} WHERE ObjectId = ${objectId}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not destroy object ${objectId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async addLayer(gameId: number, layer: string) {
        try {
            await this.client.query({
                text: `INSERT INTO mainschema.layers${gameId} VALUES ${layer}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not add layer ${layer} to game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async updateLayer(gameId: number, layerId: number, layer: any[]) {
        try {
            await this.client.query({
                text: `UPDATE mainschema.layers${gameId} SET GmVisible = '${layer[0]}', PlayerVisible = '${layer[1]}', zOrder = ${layer[2]}, Name = '${layer[3]}', X = ${layer[4]}, Y = ${layer[5]} WHERE Id = ${layerId}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not update layer ${layerId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async destroyLayer(gameId: number, layerId: number) {
        try {
            await this.client.query({
                text: `DELETE FROM mainschema.layers${gameId} WHERE Id = ${layerId}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not remove layer ${layerId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async addRoll(gameId: number, roll: string) {
        try {
            await this.client.query({
                text: `INSERT INTO mainschema.rolls${gameId} VALUES ${roll}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not add roll ${roll} to game ${gameId}`,
                err,
            );
            return false;
        }
    }

    async constructGame(gmId: string) {
        try {
            await this.delayGameLock();
            this.gameLock = true;
            const query = {
                text: 'SELECT freeGame FROM mainschema.meta',
                rowMode: 'array',
            };
            const result = await this.client.query(query);

            await this.client.query({
                text: `INSERT INTO mainschema.games VALUES ('${result.rows[0]}', '${gmId}', '#444444')`,
                rowMode: 'array',
            });
            await this.client.query({
                text: `UPDATE mainschema.meta SET freeGame = ${Number(result.rows[0]) + 1}`,
                rowMode: 'array',
            });
            this.gameLock = false;
            await this.constructGameTables(result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.log('Database error: Could not construct new game', err);
            return false;
        }
    }

    // checks if the supplied password matches the goal password.
    // being as we're currently using http this is only so useful, but it's better than plaintext.
    testEncrypt(startVal: string, goalVal: string) {
        for (let i = 0; i < 201; i++) {
            const hash = crypto.createHash('sha256');
            hash.update(startVal + i.toString());
            const res = hash.digest('hex');
            if (res === goalVal) {
                return true;
            }
        }
        return false;
    }

    // mediocre salting + sha256 encryption.
    // at least the passwords aren't in plaintext anymore.
    encrypt(val: string) {
        val += Math.round(Math.random() * 200).toString();
        const hash = crypto.createHash('sha256');
        hash.update(val);
        return hash.digest('hex');
    }

    async delayGameLock() {
        while (this.gameLock) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
}
