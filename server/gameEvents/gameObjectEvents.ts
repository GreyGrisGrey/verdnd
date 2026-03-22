import type { ObjectCreateEvent, Token } from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import {
    objectPayloadToRow,
    updateObjectToRow,
    updateTokenToRow,
    tokenPayloadToRow,
} from '../converter.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';
import WebSocket from 'ws';

// Function for creating a new object in a game.
export async function createObj(
    newObject: ObjectCreateEvent,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('obj');
    if (!newObject.token) {
        return;
    }
    currGame.objectLock = true;
    currGame.objectMap.set(currGame.currObj, newObject);
    newObject.object.objectId = currGame.currObj;
    const sendObj = JSON.stringify(newObject);
    await currGame.waitLock('db');
    currGame.dbLock = true;
    cli.addObject(currGame.gameId, objectPayloadToRow(newObject));
    if (
        !(await cli.addToken(
            currGame.gameId,
            tokenPayloadToRow(newObject.token, currGame.currObj),
        ))
    ) {
        cli.destroyObject(currGame.gameId, currGame.currObj);
        currGame.dbLock = false;
        currGame.objectLock = false;
    } else {
        currGame.currObj++;
        currGame.dbLock = false;
        currGame.objectLock = false;
        currGame.broadcast(sendObj);
    }
    console.log('object creation complete', Date.now());
}

// Function for destroying a specified object from a specified game.
export async function destroyObj(
    objId: number,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    currGame.objectMap.delete(objId);
    const sendObj = JSON.stringify({
        entity: Entity.Object,
        action: Action.Destroy,
        objectId: objId,
    });
    await currGame.waitLock('db');
    currGame.dbLock = true;
    cli.destroyObject(currGame.gameId, objId);
    cli.destroyToken(currGame.gameId, objId);
    currGame.dbLock = false;
    currGame.objectLock = false;
    currGame.broadcast(sendObj);
}

// Function for moving a specified object in a specified game.
export async function moveObj(
    objId: number,
    xChange: number,
    yChange: number,
    currGame: GameObject,
    cli: PostGresData,
    userGm: boolean,
) {
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    const currObj = currGame.objectMap.get(objId);
    if (currObj && (userGm || currObj.token.active)) {
        currObj.object.x += xChange;
        currObj.object.y += yChange;
        const sendObj = JSON.stringify(currObj);
        await currGame.waitLock('db');
        currGame.dbLock = true;
        cli.updateObject(currGame.gameId, objId, updateObjectToRow(currObj));
        currGame.dbLock = false;
        currGame.objectLock = false;
        currGame.broadcast(sendObj);
    } else {
        currGame.objectLock = false;
        return 'NONE';
    }
}

// Function for recolouring a specified object in a specified game.
export async function colourObj(
    objId: number,
    colour: string,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    const currObj = currGame.objectMap.get(objId);
    if (currObj) {
        currObj.object.colour = colour;
        const sendObj = JSON.stringify(currObj);
        await currGame.waitLock('db');
        currGame.dbLock = true;
        cli.updateObject(currGame.gameId, objId, updateObjectToRow(currObj));
        currGame.dbLock = false;
        currGame.objectLock = false;
        currGame.broadcast(sendObj);
    } else {
        currGame.objectLock = false;
        return 'NONE';
    }
}

// Function for updating the token corresponding to a specific token in a specific game.
export async function updateToken(
    newToken: Token,
    id: number,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    await currGame.waitLock('db');
    currGame.dbLock = true;
    cli.updateToken(currGame.gameId, id, updateTokenToRow(newToken));
    currGame.objectMap.get(id)!.token = newToken;
    currGame.objectMap.get(id)!.object.token = newToken;
    currGame.broadcast(
        JSON.stringify({ entity: Entity.Token, id: id, token: newToken }),
    );
    currGame.dbLock = false;
    currGame.objectLock = false;
}
