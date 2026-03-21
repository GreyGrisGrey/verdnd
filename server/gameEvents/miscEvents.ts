import type { LaserEvent, NameEvent } from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';
import WebSocket from 'ws';

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

export async function updateLaser(payload: LaserEvent, currGame: GameObject) {
    currGame.laserMap.set(payload.id, payload);
    currGame.sendAllLasers();
}

export async function establishLocalUser(
    payload: NameEvent,
    ws: WebSocket,
    currGame: GameObject,
    cli: PostGresData,
    gmMap: Map<WebSocket, boolean>,
    userMap: Map<string, boolean>,
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
            gmMap.set(ws, true);
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
            if (currGame) {
                currGame.addUser(payload.name, payload.id, true, ws);
            }
        } else {
            gmMap.set(ws, currGame.allGm);
            userMap.set(payload.id, true);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: currGame.allGm,
                    id: payload.id,
                }),
            );
            console.log('user add success');
            if (currGame) {
                currGame.addUser(payload.name, payload.id, currGame.allGm, ws);
            }
        }
    } else if (await cli.addUser(payload.name, payload.pass, payload.id)) {
        gmMap.set(ws, currGame.allGm);
        userMap.set(payload.id, true);
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: true,
                gm: currGame.allGm,
                id: payload.id,
            }),
        );
        console.log('user add success');
        if (currGame) {
            currGame.addUser(payload.name, payload.id, currGame.allGm, ws);
        }
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
    currGame.dbLock = false;
    currGame.userLock = false;
    if (currGame) {
        currGame.sendAll(ws);
    }
}
