import {
    objectTableToPayloads,
    layerTableToPayloads,
    rollTableToPayloads,
} from './converter.ts';

import { Client } from 'pg';

export class PostGresData {
    client: Client;
    secClient: Client;
    gameLock: boolean;

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
        this.client.connect();
    }

    async resetData() {
        await this.blowUpEverything();
        await this.constructTables();
    }

    async constructTables() {
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
            text: `CREATE TABLE mainschema.games (GameId int NOT NULL, GmId text)`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `INSERT INTO mainschema.meta VALUES (0)`,
            rowMode: 'array',
        });
    }

    // who needs a database anyway
    async blowUpEverything() {
        await this.client.query({
            text: `DROP SCHEMA mainschema CASCADE`,
        });
    }

    async printUsers() {
        const res = await this.client.query({
            text: `SELECT * FROM mainschema.users`,
            rowMode: 'array',
        });
        console.log(res.rows);
    }

    async printGames() {
        const res = await this.client.query({
            text: `SELECT * FROM mainschema.games`,
            rowMode: 'array',
        });
        console.log(res.rows);
    }

    async printAll() {
        const res = await this.client.query({
            text: `SELECT table_schema, table_name
FROM information_schema.tables WHERE table_schema = 'mainschema'`,
            rowMode: 'array',
        });
        for (const val of res.rows) {
            console.log(val);
        }
    }

    async constructGameTables(newId: number) {
        console.log(newId);
        await this.client.query({
            text: `CREATE TABLE mainschema.objects${newId} (Shape text NOT NULL, Colour text, LayerId int, ObjectId int PRIMARY KEY, StructureData text NOT NULL)`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `CREATE TABLE mainschema.layers${newId} (GmVisible boolean, PlayerVisible boolean, zOrder int, Id int PRIMARY KEY)`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `CREATE TABLE mainschema.rolls${newId} (Id int PRIMARY KEY, Result int NOT NULL, UserId int, ResultData text)`,
            rowMode: 'array',
        });
    }

    async addUser(newName: string, suppliedPass: string, newId: string) {
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
    }

    async checkGame(gameId: number) {
        const res = await this.client.query({
            text: `SELECT gameId FROM mainschema.games WHERE gameId = ${gameId}`,
            rowMode: 'array',
        });
        console.log(res);
        if (res.rows.length > 0) {
            return true;
        }
        return false;
    }

    async getGame(gameId: number) {
        if (await this.checkGame(gameId)) {
            console.log('bwa');
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
            return [
                objectTableToPayloads(first.rows),
                layerTableToPayloads(second.rows),
                rollTableToPayloads(third.rows),
            ];
        }
        return false;
    }

    async addObject(gameId: number, object: string) {
        await this.client.query({
            text: `INSERT INTO mainschema.objects${gameId} VALUES ${object}`,
        });
    }

    async updateObject(gameId: number, objectId: number, object: string[]) {
        await this.client.query({
            text: `UPDATE mainschema.objects${gameId} SET Colour = '${object[0]}', StructureData = '${object[1]}' WHERE ObjectId = ${objectId}`,
        });
    }

    async destroyObject(gameId: number, objectId: number) {
        await this.client.query({
            text: `DELETE FROM mainschema.objects${gameId} WHERE ObjectId = ${objectId}`,
        });
    }

    async addLayer(gameId: number, layer: string) {
        await this.client.query({
            text: `INSERT INTO mainschema.layers${gameId} VALUES ${layer}`,
        });
    }

    async updateLayer(gameId: number, layerId: number, layer: any[]) {
        await this.client.query({
            text: `UPDATE mainschema.layers${gameId} SET GmVisible = '${layer[0]}', PlayerVisible = '${layer[1]}', zOrder = ${layer[2]} WHERE Id = ${layerId}`,
        });
    }

    async addRoll(gameId: number, roll: string) {
        await this.client.query({
            text: `INSERT INTO mainschema.rolls${gameId} VALUES ${roll}`,
        });
    }

    async constructGame(gmId: string) {
        await this.delayGameLock();
        this.gameLock = true;
        const query = {
            text: 'SELECT freeGame FROM mainschema.meta',
            rowMode: 'array',
        };
        const result = await this.client.query(query);

        await this.client.query({
            text: `INSERT INTO mainschema.games VALUES ('${result.rows[0]}', '${gmId}')`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `UPDATE mainschema.meta SET freeGame = ${Number(result.rows[0]) + 1}`,
            rowMode: 'array',
        });
        this.gameLock = false;
        await this.constructGameTables(result.rows[0]);
        return result.rows[0];
    }

    async verifyUser(id: string, suppliedPass: string) {
        const query = {
            text: `SELECT Password FROM mainschema.users WHERE Id = '${id}'`,
            rowMode: 'array',
        };
        const result = await this.client.query(query);
        if (result.rows.length == 1 && this.testEncrypt(suppliedPass, 'a')) {
            return true;
        }
        return false;
    }

    // currently does nothing, will continue to do nothing until encryption is set up.
    testEncrypt(startVal: string, goalVal: string) {
        return true;
    }

    // also does nothing
    encrypt(val: string) {
        return 'a';
    }

    async delayGameLock() {
        while (this.gameLock) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}
