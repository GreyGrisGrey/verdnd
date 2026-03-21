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
import { WebSocketData } from '../wsData.ts';

// Function handling all events the websocket server decides are related to a specific game.
export async function handleGameEvent(
    event: any,
    currGame: GameObject,
    ws: WebSocket,
    cli: PostGresData,
    wsMap: Map<WebSocket, WebSocketData>,
) {
    const message = JSON.parse(event);
    const payload = message.event;
    const userGm = currGame.checkUserGm(message.userId);
    if (payload.entity === Entity.Object) {
        if (payload.action === Action.Create && userGm) {
            createObj(payload, currGame, cli);
        } else if (payload.action === Action.Destroy && userGm) {
            destroyObj(payload.objectId, currGame, cli);
        } else if (payload.action === Action.Move) {
            moveObj(
                payload.objectId,
                payload.x,
                payload.y,
                currGame,
                cli,
                userGm,
            );
        } else if (payload.action === Action.Recolour && userGm) {
            colourObj(payload.objectId, payload.colour, currGame, cli);
        }
    } else if (payload.entity === Entity.Layer) {
        if (payload.action === Action.Create && userGm) {
            createLayer(currGame, cli);
        } else if (payload.action === Action.Destroy && userGm) {
            destroyLayer(payload.layerId, currGame, cli);
        } else if (payload.action === Action.Update && userGm) {
            updateLayer(payload.layer.id, payload.layer, currGame, cli);
        }
    } else if (payload.entity === Entity.Roll) {
        addDice(payload.dice, message.userId, payload.userName, currGame, cli);
    } else if (payload.entity === Entity.Laser) {
        updateLaser(payload, currGame);
    } else if (payload.entity === Entity.Token && userGm) {
        updateToken(payload.token, payload.id, currGame, cli);
    } else if (payload.entity === Entity.Name) {
        if (payload.pass && payload.name && payload.id) {
            establishLocalUser(payload, ws, currGame, cli, wsMap);
        }
    } else if (payload.entity === Entity.Meta && userGm) {
        updateBackground(payload.newColour, currGame, cli);
    }
}
