import type { LaserEvent, NameEvent } from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';
import WebSocket from 'ws';
import { WebSocketData } from '../wsData.ts';

// Function updating the background colour of a specific game.
export async function updateBackground(
    newCol: string,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock(currGame.dbLock);
    currGame.dbLock = true;
    cli.updateGame(currGame.gameId, newCol);
    currGame.currCol = newCol;
    currGame.dbLock = false;
    currGame.broadcast(
        JSON.stringify({
            entity: Entity.Meta,
            action: Action.Recolour,
            newColour: currGame.currCol,
        }),
    );
}

// Function for updating a laser corresponding to a given game.
export async function updateLaser(payload: LaserEvent, currGame: GameObject) {
    currGame.laserMap.set(payload.id, payload);
    currGame.sendAllLasers();
}

// Function signing a new user into a preexisting game.
export async function establishLocalUser(
    payload: NameEvent,
    ws: WebSocket,
    currGame: GameObject,
    cli: PostGresData,
    wsMap: Map<WebSocket, WebSocketData>,
) {
    await currGame.waitLock(currGame.userLock);
    currGame.userLock = true;
    await currGame.waitLock(currGame.dbLock);
    currGame.dbLock = true;
    if (await cli.verifyUser(payload.id, payload.pass)) {
        if (
            payload.id === 'Verdi' ||
            payload.id === 'Grey' ||
            payload.id === 'Verd' ||
            payload.id === 'Verdigris'
        ) {
            currGame.sendAll(ws);
            currGame.addUser(payload.name, payload.id, true, ws);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: true,
                    id: payload.id,
                }),
            );
            wsMap.get(ws)!.addGame(currGame.gameId);
            console.log('user add success (Local)');
        } else {
            currGame.sendAll(ws);
            const res = currGame.addUser(
                payload.name,
                payload.id,
                currGame.allGm,
                ws,
            );
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: res,
                    id: payload.id,
                }),
            );
            wsMap.get(ws)!.addGame(currGame.gameId);
            console.log('user add success (Local)');
        }
    } else if (await cli.addUser(payload.name, payload.pass, payload.id)) {
        currGame.sendAll(ws);
        const res = currGame.addUser(
            payload.name,
            payload.id,
            currGame.allGm,
            ws,
        );
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: true,
                gm: res,
                id: payload.id,
            }),
        );
        wsMap.get(ws)!.addGame(currGame.gameId);
        console.log('user add success (Local)');
    } else {
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: false,
                gm: false,
                id: payload.id,
            }),
        );
        console.log('user add fail (Local)');
    }
    currGame.dbLock = false;
    currGame.userLock = false;
}
