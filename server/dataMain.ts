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
        this.printGames();
    }

    async constructTables() {
        await this.client.query({
            text: `CREATE TABLE users (UserId text, Username text, Password text)`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `CREATE TABLE meta (freeGame int)`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `CREATE TABLE games (gameId int, gmId text)`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `INSERT INTO meta VALUES (0)`,
            rowMode: 'array',
        });
    }

    // who needs a database anyway
    async blowUpEverything() {
        await this.client.query({
            text: `DROP TABLE users`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `DROP TABLE meta`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `DROP TABLE games`,
            rowMode: 'array',
        });
    }

    async printUsers() {
        const res = await this.client.query({
            text: `SELECT * FROM users`,
            rowMode: 'array',
        });
        console.log(res.rows);
    }

    async printGames() {
        const res = await this.client.query({
            text: `SELECT * FROM games`,
            rowMode: 'array',
        });
        console.log(res.rows);
    }

    async constructGameTables(newId: number) {
        await this.client.query({
            text: `CREATE TABLE ${newId}objects ()`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `CREATE TABLE ${newId}layer()`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `CREATE TABLE ${newId}roll()`,
            rowMode: 'array',
        });
    }

    async addUser(newName: string, suppliedPass: string, newId: string) {
        const newPass = this.encrypt(suppliedPass);
        const res = await this.client.query({
            text: `SELECT userId FROM users WHERE UserId = '${newId}'`,
            rowMode: 'array',
        });
        if (res.rows.length > 0) {
            return false;
        }
        await this.client.query({
            text: `INSERT INTO users VALUES ('${newId}', '${newName}', '${newPass}')`,
            rowMode: 'array',
        });
        const testRes = await this.client.query({
            text: `SELECT userId FROM users`,
            rowMode: 'array',
        });
        console.log(testRes);
        return true;
    }

    async checkGame(gameId: number) {
        const res = await this.client.query({
            text: `SELECT game FROM games WHERE gameId = ${gameId}'`,
            rowMode: 'array',
        });
        if (res.rows.length > 0) {
            return true;
        }
        return false;
    }

    async getGame(gameId: number) {
        if (await this.checkGame(gameId)) {
            const first = await this.client.query({
                text: `SELECT * FROM ${gameId}objects`,
                rowMode: 'array',
            });
            const second = await this.client.query({
                text: `SELECT * FROM ${gameId}layers`,
                rowMode: 'array',
            });
            const third = await this.client.query({
                text: `SELECT * FROM ${gameId}rolls`,
                rowMode: 'array',
            });
            return [first, second, third];
        }
    }

    async constructGame(gmId: number) {
        await this.delayGameLock();
        this.gameLock = true;
        const query = {
            text: 'SELECT freeGame FROM meta',
            rowMode: 'array',
        };
        const result = await this.client.query(query);

        await this.client.query({
            text: `INSERT INTO games VALUES ('${result.rows[0]}', '${gmId}')`,
            rowMode: 'array',
        });
        await this.client.query({
            text: `UPDATE meta SET freeGame = ${Number(result.rows[0]) + 1}`,
            rowMode: 'array',
        });
        this.gameLock = false;
        this.constructGameTables(result.rows[0]);
        console.log("cc")
        return result.rows[0];
    }

    async verifyUser(id: string, suppliedPass: string) {
        const query = {
            text: `SELECT Password FROM users WHERE Id = '${id}'`,
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
