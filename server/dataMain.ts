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

    // Resets all database data.
    // Please don't let this continue existing when we launch.
    async resetData() {
        await this.blowUpEverything();
        await this.constructTables();
    }

    // Constructs main database tables.
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
                text: `CREATE TABLE mainschema.games (GameId int NOT NULL, GmId text, BgColour text, BgImage boolean, GameName text, GameNum int)`,
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

    // Prints all users
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

    // Prints all tokens from game 0, why
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

    // Prints all games
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

    // Prints just about everything from the main tables.
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

    // Constructs tables for a newly created game.
    async constructGameTables(newId: number) {
        try {
            await this.client.query({
                text: `CREATE TABLE mainschema.objects${newId} (Params int NOT NULL, Colour text, LayerId int, ObjectId int PRIMARY KEY, StructureData text NOT NULL, Owner text)`,
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

    // Adds user to the user table.
    async addUser(
        newName: string,
        suppliedPass: string,
        newId: string,
    ): Promise<boolean> {
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

    // Verifies a user exists and their password is correct.
    async verifyUser(id: string, suppliedPass: string): Promise<boolean> {
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

    async checkGameObf(gameNum: number): Promise<boolean> {
        try {
            const res = await this.client.query({
                text: `SELECT GameId FROM mainschema.games WHERE GameNum = ${gameNum}`,
                rowMode: 'array',
            });
            if (res.rows.length > 0) {
                return true;
            }
            return false;
        } catch (err) {
            console.log(
                `Database error: Could not get game with num ${gameNum}`,
                err,
            );
            return false;
        }
    }

    async getIdFromObf(gameNum: number): Promise<number> {
        try {
            const res = await this.client.query({
                text: `SELECT GameId FROM mainschema.games WHERE GameNum = ${gameNum}`,
                rowMode: 'array',
            });
            if (res.rows.length > 0) {
                return res.rows[0][0];
            }
            return -1;
        } catch (err) {
            console.log(
                `Database error: Could not get game with Num ${gameNum}`,
                err,
            );
            return -1;
        }
    }

    // Checks the existence of a game.
    async checkGame(gameId: number): Promise<boolean> {
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

    // Gets all details of a game from a given game Id.
    async getGame(gameId: number): Promise<false | any[]> {
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
                    text: `SELECT BgColour, GmId, BgImage FROM mainschema.games WHERE GameId = ${gameId}`,
                    rowMode: 'array',
                });
                const firstRes = objectTableToPayloads(first.rows);
                tokenTableToPayloads(fourth.rows, firstRes);
                return [
                    firstRes,
                    layerTableToPayloads(second.rows),
                    rollTableToPayloads(third.rows),
                    fifth.rows[0][0],
                    fifth.rows[0][1],
                    fifth.rows[0][2],
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

    // Updates the background colour of a game.
    async updateGameCol(gameId: number, newCol: string): Promise<boolean> {
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

    // Updates whether a game has an image or not.
    async updateGameImage(gameId: number, image: boolean): Promise<boolean> {
        try {
            await this.client.query({
                text: `UPDATE mainschema.games SET BgImage = '${image}' WHERE GameId = ${gameId}`,
            });
            return true;
        } catch (err) {
            console.log(`Database error: Could not update game ${gameId}`, err);
            return false;
        }
    }

    // Given a player's id, gets all games where they are gm.
    async getUserGames(gmId: string): Promise<false | any[][]> {
        try {
            const res = await this.client.query({
                text: `SELECT GameNum FROM mainschema.games WHERE GmId = '${gmId}'`,
                rowMode: 'array',
            });
            return res.rows;
        } catch (err) {
            console.log(
                `Database error: Could not select games for ${gmId}`,
                err,
            );
            return false;
        }
    }

    // Adds a token to a game.
    async addToken(gameId: number, token: string): Promise<boolean> {
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

    // Removes a token from a game.
    async destroyToken(gameId: number, objectId: number): Promise<boolean> {
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

    // Updates a token on a game.
    async updateToken(
        gameId: number,
        objectId: number,
        token: string[],
    ): Promise<boolean> {
        try {
            await this.client.query({
                text: `UPDATE mainschema.tokens${gameId} SET Name = '${token[0]}', Colour = '${token[1]}', Move = '${token[2]}', Active = '${token[3]}' WHERE Id = ${objectId}`,
            });
            return true;
        } catch (err) {
            console.log(
                `Database error: Could not update token ${objectId} on game ${gameId}`,
                err,
            );
            return false;
        }
    }

    // Guess
    async addObject(gameId: number, object: string): Promise<boolean> {
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

    // Updates an object on a game.
    async updateObject(
        gameId: number,
        objectId: number,
        object: (string | number)[],
    ): Promise<boolean> {
        try {
            await this.client.query({
                text: `UPDATE mainschema.objects${gameId} SET Params = ${object[0]}, Colour = '${object[1]}', StructureData = '${object[2]}', LayerId = ${object[3]} WHERE ObjectId = ${objectId}`,
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

    // Destroys an object on a game.
    async destroyObject(gameId: number, objectId: number): Promise<boolean> {
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

    // Add layer game to.
    async addLayer(gameId: number, layer: string): Promise<boolean> {
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

    // Update layer of game of gameId id
    async updateLayer(
        gameId: number,
        layerId: number,
        layer: any[],
    ): Promise<boolean> {
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

    // Destroy the layer
    async destroyLayer(gameId: number, layerId: number): Promise<boolean> {
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

    // Add rolling stones music to game.
    async addRoll(gameId: number, roll: string): Promise<boolean> {
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

    // Constructs a game, takes a id and sets it as gm for the game.
    async constructGame(gmId: string): Promise<false | any> {
        try {
            await this.delayGameLock();
            this.gameLock = true;
            const query = {
                text: 'SELECT FreeGame FROM mainschema.meta',
                rowMode: 'array',
            };
            const result = await this.client.query(query);
            const newNum = await this.obfuscateId(result.rows[0]);

            await this.client.query({
                text: `INSERT INTO mainschema.games VALUES ('${result.rows[0]}', '${gmId}', '#444444', null, null, ${newNum})`,
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

    // Function to somewhat obfuscate game Id so it's more difficult to find random games by checking random urls.
    // Not in any way meant to be cryptographically secure.
    async obfuscateId(gameId: number): Promise<number> {
        for (let i = 0; i < 5; i++) {
            const newVal = Math.round(Math.random() * 1000000000) + 1000000000;
            const res = await this.checkGameObf(newVal);
            if (!res) {
                return newVal;
            }
        }
        return -1;
    }

    // Checks if the supplied password matches the goal password.
    testEncrypt(startVal: string, goalVal: string): boolean {
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

    // Encrypts a password with sha256 encryption. Also salts it.
    encrypt(val: string): string {
        val += Math.round(Math.random() * 200).toString();
        const hash = crypto.createHash('sha256');
        hash.update(val);
        return hash.digest('hex');
    }

    // What?
    async delayGameLock() {
        while (this.gameLock) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
}
