import WebSocket from 'ws';
import { GameObject } from '../gameObject.ts';
import { createLayer } from '../gameEvents/layerEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { NameEvent } from '../../shared/objectEvents.ts';
import { Entity } from '../../shared/objectEvents.ts';
import { WebSocketData } from '../wsData.ts';

// Function for constructing a new game object in the server's cache of game objects.
export async function constructGame(
    gameId: number,
    gameMap: Map<number, GameObject>,
    cli: PostGresData,
) {
    if (gameMap.has(gameId)) {
        return true;
    }
    const newGame = new GameObject(gameId);
    gameMap.set(gameId, newGame);
    const res = await newGame.setUp(cli);
    if (!res) {
        createLayer(newGame, cli);
    }
}

// Function for connecting a new user to the websocket server.
export async function establishGlobalUser(
    payload: NameEvent,
    ws: WebSocket,
    userLock: boolean,
    dbLock: boolean,
    cli: PostGresData,
    userMap: Map<string, WebSocket>,
    wsMap: Map<WebSocket, WebSocketData>,
) {
    await waitLock(userLock);
    userLock = true;
    await waitLock(dbLock);
    dbLock = true;
    if (await cli.verifyUser(payload.id, payload.pass)) {
        if (
            payload.id === 'Verdi' ||
            payload.id === 'Grey' ||
            payload.id === 'Verd' ||
            payload.id === 'Verdigris'
        ) {
            userMap.set(payload.id, ws);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: true,
                    id: payload.id,
                }),
            );
            wsMap.get(ws)!.updateId(payload.id, payload.name);
            console.log('user add success (Global)');
        } else {
            userMap.set(payload.id, ws);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: true,
                    id: payload.id,
                }),
            );
            wsMap.get(ws)!.updateId(payload.id, payload.name);
            console.log('user add success (Global)');
        }
    } else if (await cli.addUser(payload.name, payload.pass, payload.id)) {
        userMap.set(payload.id, ws);
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: true,
                gm: true,
                id: payload.id,
            }),
        );
        wsMap.get(ws)!.updateId(payload.id, payload.name);
        console.log('user add success (Global)');
    } else {
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: false,
                gm: false,
                id: payload.id,
            }),
        );
        console.log('user add fail (Global)');
    }
    dbLock = false;
    userLock = false;
}

// Function for getting all games corresponding to a particular user.
export async function getUserGames(id: string, cli: PostGresData) {
    return await cli.getUserGames(id);
}

async function waitLock(lock: boolean) {
    while (lock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}
