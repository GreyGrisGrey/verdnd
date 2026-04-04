import type {
    ObjectCreateEvent,
    ObjectRelayerEvent,
    Token,
} from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import {
    objectPayloadToRow,
    updateObjectToRow,
    updateTokenToRow,
    tokenPayloadToRow,
} from '../converter.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';

// Function for creating a new object in a game.
export async function createObj(
    newObject: ObjectCreateEvent,
    currGame: GameObject,
    cli: PostGresData,
) {
    if (!newObject.token) {
        return;
    }
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    if (currGame.objectMap.has(newObject.object.objectId)) {
        updateObj(newObject, currGame, cli);
        return;
    }
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
}

export async function updateObjLayer(
    layerEvent: ObjectRelayerEvent,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    const curr = currGame.objectMap.get(layerEvent.objectId);
    await currGame.waitLock('layer');
    currGame.layerLock = true;
    if (
        curr &&
        currGame.layerMap.has(layerEvent.layerId) &&
        currGame.layerMap.has(curr.object.layerId)
    ) {
        curr.object.layerId = layerEvent.layerId;
    } else {
        return;
    }
    currGame.layerLock = false;
    currGame.objectLock = false;
    await currGame.waitLock('db');
    currGame.dbLock = true;
    cli.updateObject(
        currGame.gameId,
        curr.object.objectId,
        updateObjectToRow(curr),
    );
    currGame.dbLock = false;
    currGame.broadcast(JSON.stringify(layerEvent));
}

async function updateObj(
    newObject: ObjectCreateEvent,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('db');
    currGame.dbLock = true;
    currGame.objectMap.set(newObject.object.objectId, newObject);
    cli.updateObject(
        currGame.gameId,
        newObject.object.objectId,
        updateObjectToRow(newObject),
    );
    currGame.dbLock = false;
    currGame.objectLock = false;
    currGame.broadcast(JSON.stringify(newObject));
}

export async function updateImage(
    objId: number,
    isImage: boolean,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock('obj');
    currGame.objectLock = true;
    await currGame.waitLock('db');
    currGame.dbLock = true;
    const currObj = currGame.objectMap.get(objId);
    if (currObj) {
        if (currObj.object.image || isImage) {
            currObj.object.image = isImage;
            currGame.broadcast(
                JSON.stringify({
                    entity: Entity.Object,
                    action: Action.Image,
                    id: objId,
                    image: isImage,
                }),
            );
            cli.updateObject(
                currGame.gameId,
                objId,
                updateObjectToRow(currObj),
            );
        }
    }
    currGame.dbLock = false;
    currGame.objectLock = false;
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
        currGame.moveObject(objId, xChange, yChange);
        const sendObj = JSON.stringify(currObj);
        await currGame.waitLock('db');
        currGame.dbLock = true;
        cli.updateObject(currGame.gameId, objId, updateObjectToRow(currObj));
        currGame.dbLock = false;
        currGame.objectLock = false;
        currGame.broadcast(sendObj);
    } else {
        currGame.objectLock = false;
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
