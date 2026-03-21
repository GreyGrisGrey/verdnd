import WebSocket from 'ws';
import {GameObject} from '../gameObject.ts'
import { createLayer } from '../gameEvents/layerEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { NameEvent } from '../../shared/objectEvents.ts'
import { Entity } from '../../shared/objectEvents.ts';


export async function constructGame(gameId: number, gameMap: Map<number, GameObject>, cli: PostGresData) {
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

export async function establishGlobalUser(
    payload: NameEvent,
    ws: WebSocket,
    userLock: boolean,
    dbLock: boolean, cli: PostGresData,
    userMap: Map<string, boolean>,
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
            userMap.set(payload.id, true);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: true,
                    id: payload.id,
                }),
            );
            console.log('user add success');
        } else {
            userMap.set(payload.id, true);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: true,
                    id: payload.id,
                }),
            );
            console.log('user add success');
        }
    } else if (await cli.addUser(payload.name, payload.pass, payload.id)) {
        userMap.set(payload.id, true);
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: true,
                gm: true,
                id: payload.id,
            }),
        );
        console.log('user add success');
    } else {
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: false,
                gm: false,
                id: payload.id,
            }),
        );
        console.log('user add fail');
    }
    dbLock = false;
    userLock = false;
}

async function waitLock(lock: boolean) {
    while (lock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}