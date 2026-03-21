import { Action, Entity } from '../../shared/objectEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';
import { addDice } from './diceEvents.ts';
import {
    destroyObj,
    createObj,
    moveObj,
    colourObj,
    updateToken,
} from './gameObjectEvents.ts';
import { createLayer, destroyLayer, updateLayer } from './layerEvents.ts';
import {
    updateLaser,
    updateBackground,
    establishLocalUser,
} from './miscEvents.ts';
import WebSocket from 'ws';

export async function handleGameEvent(
    event: any,
    currGame: GameObject,
    ws: WebSocket,
    cli: PostGresData,
    gmMap: Map<WebSocket, boolean>,
    userMap: Map<string, boolean>,
) {
    const message = JSON.parse(event);
    const payload = message.event;
    if (payload.entity === Entity.Object) {
        if (payload.action === Action.Create && gmMap.get(ws)) {
            createObj(payload, currGame, cli);
        } else if (payload.action === Action.Destroy && gmMap.get(ws)) {
            destroyObj(payload.objectId, currGame, cli);
        } else if (payload.action === Action.Move) {
            moveObj(
                payload.objectId,
                payload.x,
                payload.y,
                ws,
                currGame,
                cli,
                gmMap,
            );
        } else if (payload.action === Action.Recolour && gmMap.get(ws)) {
            colourObj(payload.objectId, payload.colour, currGame, cli);
        }
    } else if (payload.entity === Entity.Layer) {
        if (payload.action === Action.Create && gmMap.get(ws)) {
            createLayer(currGame, cli);
        } else if (payload.action === Action.Destroy && gmMap.get(ws)) {
            destroyLayer(payload.layerId, currGame, cli);
        } else if (payload.action === Action.Update && gmMap.get(ws)) {
            updateLayer(payload.layer.id, payload.layer, currGame, cli);
        }
    } else if (payload.entity === Entity.Roll) {
        addDice(payload.dice, message.userId, payload.userName, currGame, cli);
    } else if (payload.entity === Entity.Laser) {
        updateLaser(payload, currGame);
    } else if (payload.entity === Entity.Token && gmMap.get(ws)) {
        updateToken(payload.token, payload.id, currGame, cli);
    } else if (payload.entity === Entity.Name) {
        if (payload.pass && payload.name && payload.id) {
            establishLocalUser(payload, ws, currGame, cli, gmMap, userMap);
        }
    } else if (payload.entity === Entity.Meta && gmMap.get(ws)) {
        updateBackground(payload.newColour, currGame, cli);
    }
}
