import WebSocket from 'ws';
import { GameObject } from '../gameObject.ts';
import { createLayer } from '../gameEvents/layerEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { NameEvent } from '../../shared/objectEvents.ts';
import { Entity, Action } from '../../shared/objectEvents.ts';
import { WebSocketData } from '../wsData.ts';

// Function for constructing a new game object in the server's cache of game objects.
export async function constructGame(
    gameId: number,
    gameNum: number,
    gameMap: Map<number, GameObject>,
    cli: PostGresData,
): Promise<boolean> {
    if (gameMap.has(gameId)) {
        return true;
    }
    const newGame = new GameObject(gameId, gameNum);
    gameMap.set(gameNum, newGame);
    const res = await newGame.setUp(cli);
    if (!res) {
        createLayer(newGame, cli);
    }
    return false;
}

// Function for connecting a new user to the websocket server.
export async function establishGlobalUser(
    payload: NameEvent,
    ws: WebSocket,
    userLock: boolean,
    dbLock: boolean,
    cli: PostGresData,
    userMap: Map<string, Set<WebSocket>>,
    wsMap: Map<WebSocket, WebSocketData>,
) {
    while (!wsMap.get(ws)) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
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
            const user = userMap.get(payload.id);
            if (user) {
                user.add(ws);
            } else {
                userMap.set(payload.id, new Set([ws]));
            }
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
            const user = userMap.get(payload.id);
            if (user) {
                user.add(ws);
            } else {
                userMap.set(payload.id, new Set([ws]));
            }
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
        const user = userMap.get(payload.id);
        if (user) {
            user.add(ws);
        } else {
            userMap.set(payload.id, new Set([ws]));
        }
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
export async function getUserGames(
    id: string,
    cli: PostGresData,
): Promise<false | any[][]> {
    return await cli.getUserGames(id);
}

// Function for awaiting mutex lock.
async function waitLock(lock: boolean) {
    while (lock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}
