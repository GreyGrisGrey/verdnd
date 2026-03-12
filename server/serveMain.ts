import type {
    ObjectCreateEvent,
    LayerUpdateEvent,
    LayerState,
    DicePayload,
    LaserEvent,
    RollComplete,
    NameEvent,
    NameCheckedEvent,
} from './serveObjectEvents.ts';
import { SingleRoll } from './serveObjectEvents.ts';
import { Action, Entity } from './serveObjectEvents.ts';
import {
    objectPayloadToRow,
    updateObjectToRow,
    layerPayloadToRow,
    rollPayloadToRow,
    updateLayerToRow,
} from './converter.ts';

import WebSocket, { WebSocketServer } from 'ws';
import { Client } from 'pg';
import { PostGresData } from './dataMain.ts';
const cli = new PostGresData();

// SELECT datname FROM pg_catalog.pg_database
let objectMap: Map<number, ObjectCreateEvent> = new Map();
let layerMap: Map<number, LayerUpdateEvent> = new Map();
let diceMap: Map<number, RollComplete> = new Map();
let userMap: Map<string, boolean> = new Map();
const laserMap: Map<number, LaserEvent> = new Map();

let objectLock = false;
let layerLock = false;
let diceLock = false;
let userLock = false;

let currObj = 0;
let currLayer = 0;
let currDice = 0;
const currGame = 0;

const wss = new WebSocketServer({ port: 8765 });

wss.on('connection', async function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', async function message(data, ws) {
        const returnVal = await handleEvent(data);
        if (returnVal) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(returnVal!, { binary: ws });
                }
            });
        }
        wss.emit(returnVal!);
    });

    console.log('connection established');
});

async function setUp() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const res = await cli.getGame(currGame);
    if (res) {
        objectMap = res[0] as any;
        layerMap = res[1] as any;
        diceMap = res[2] as any;
        for (const [key, val] of objectMap) {
            if (val.object.objectId >= currObj) {
                currObj = val.object.objectId + 1;
            }
        }
        for (const [key, val] of layerMap) {
            if (val.layer.id >= currLayer) {
                currLayer = val.layer.id + 1;
            }
        }
        for (const [key, val] of diceMap) {
            if (val.id >= currObj) {
                currDice = val.id + 1;
            }
        }
        console.log(currObj, currLayer, currDice);
    } else {
        cli.constructGame('0');
    }
}

async function handleEvent(event: any) {
    const message = JSON.parse(event);
    if (userMap.has(message.userId)) {
        const payload = message.event;
        if (payload.entity === Entity.Object) {
            if (payload.action === Action.Create) {
                return createObj(payload);
            } else if (payload.action === Action.Destroy) {
                return destroyObj(payload.objectId);
            } else if (payload.action === Action.Move) {
                return moveObj(payload.objectId, payload.x, payload.y);
            } else if (payload.action === Action.Recolour) {
                return colourObj(payload.objectId, payload.colour);
            }
        } else if (payload.entity === Entity.Layer) {
            if (payload.action === Action.Create) {
                return createLayer();
            } else if (payload.action === Action.Destroy) {
                return destroyLayer(payload.layerId);
            } else if (payload.action === Action.Update) {
                return updateLayer(payload.layer.objectId, payload.layer);
            }
        } else if (payload.entity === Entity.Roll) {
            return addDice(payload.dice, message.userId);
        } else if (payload.entity === Entity.Laser) {
            return 'nah';
            return updateLaser(payload);
        }
    } else if (message.event) {
        const payload = message.event;
        if (payload.pass && payload.name && payload.id) {
            return establishUser(payload);
        }
    }
}

setUp();

async function updateLaser(payload: LaserEvent) {
    laserMap.set(payload.id, payload);
    sendAllLasers();
}

async function createObj(newObject: ObjectCreateEvent) {
    await waitLock(objectLock);
    objectLock = true;
    objectMap.set(currObj, newObject);
    newObject.object.objectId = currObj;
    const sendObj = JSON.stringify(newObject);
    cli.addObject(currGame, objectPayloadToRow(newObject));
    currObj++;
    objectLock = false;
    broadcast(sendObj);
}

async function destroyObj(objId: number) {
    await waitLock(objectLock);
    objectLock = true;
    objectMap.delete(objId);
    const sendObj = JSON.stringify({
        entity: Entity.Object,
        action: Action.Destroy,
        objectId: objId,
    });
    objectLock = false;
    broadcast(sendObj);
}

async function moveObj(objId: number, xChange: number, yChange: number) {
    await waitLock(objectLock);
    objectLock = true;
    const currObj = objectMap.get(objId);
    if (currObj) {
        currObj.object.x += xChange;
        currObj.object.y += yChange;
        const sendObj = JSON.stringify(currObj);
        cli.updateObject(currGame, objId, updateObjectToRow(currObj));
        objectLock = false;
        broadcast(sendObj);
    } else {
        objectLock = false;
        return 'NONE';
    }
}

async function colourObj(objId: number, colour: string) {
    await waitLock(objectLock);
    objectLock = true;
    const currObj = objectMap.get(objId);
    if (currObj) {
        currObj.object.colour = colour;
        const sendObj = JSON.stringify(currObj);
        cli.updateObject(currGame, objId, updateObjectToRow(currObj));
        objectLock = false;
        broadcast(sendObj);
    } else {
        objectLock = false;
        return 'NONE';
    }
}

async function createLayer() {
    await waitLock(layerLock);
    if (currLayer > 11) {
        return 'NONE';
    }
    layerLock = true;
    layerMap.set(currLayer, {
        entity: Entity.Layer,
        action: Action.Update,
        layer: {
            gmVisible: true,
            playerVisible: true,
            zOrder: currLayer,
            id: currLayer,
        },
    });
    const sendObj = JSON.stringify(layerMap.get(currLayer));
    cli.addLayer(currGame, layerPayloadToRow(layerMap.get(currLayer)!));
    currLayer++;
    layerLock = false;
    broadcast(sendObj);
}

async function updateLayer(layerId: number, newLayer: LayerState) {
    await waitLock(layerLock);
    layerLock = true;
    layerMap.set(layerId, {
        entity: Entity.Layer,
        action: Action.Update,
        layer: newLayer,
    });
    const sendObj = JSON.stringify({
        entity: Entity.Layer,
        action: Action.Update,
        layer: newLayer,
    });
    cli.updateLayer(
        currGame,
        layerId,
        updateLayerToRow({
            entity: Entity.Layer,
            action: Action.Update,
            layer: newLayer,
        }),
    );
    layerLock = false;
    broadcast(sendObj);
}

async function destroyLayer(layerId: number) {
    await waitLock(layerLock);
    layerLock = true;
    layerMap.delete(layerId);
    layerLock = false;
    const sendObj = JSON.stringify({
        entity: Entity.Layer,
        action: Action.Destroy,
        layerId: layerId,
    });
    broadcast(sendObj);
}

async function addDice(newDice: DicePayload, userId: number) {
    const rollList: SingleRoll[] = [];
    const rollResult = { result: newDice.modifier, rolls: rollList };
    if (newDice.advantage || newDice.disadvantage) {
        const rolls = [
            Math.ceil(Math.random() * 20),
            Math.ceil(Math.random() * 20),
        ];
        rollResult.result += newDice.advantage
            ? Math.max(rolls[0], rolls[1])
            : Math.min(rolls[0], rolls[1]);
        if (newDice.advantage) {
            rollResult.rolls.push({
                result: Math.max(rolls[0], rolls[1]),
                size: 20,
                exclude: false,
            });
            rollResult.rolls.push({
                result: Math.min(rolls[0], rolls[1]),
                size: 20,
                exclude: true,
            });
        } else {
            rollResult.rolls.push({
                result: Math.min(rolls[0], rolls[1]),
                size: 20,
                exclude: false,
            });
            rollResult.rolls.push({
                result: Math.max(rolls[0], rolls[1]),
                size: 20,
                exclude: true,
            });
        }
    } else {
        while (newDice.diceCount > 0) {
            const newResult = Math.ceil(Math.random() * newDice.diceSize);
            rollResult.result += newResult;
            rollList.push({
                result: newResult,
                size: newDice.diceSize,
                exclude: false,
            });
            newDice.diceCount -= 1;
        }
    }
    await waitLock(diceLock);
    diceLock = true;
    diceMap.set(currDice, {
        entity: Entity.Roll,
        action: Action.Update,
        id: currDice,
        result: rollResult,
        userId: userId,
    });
    const sendObj = JSON.stringify({
        entity: Entity.Roll,
        action: Action.Update,
        id: currDice,
        result: rollResult,
        userId: userId,
    });
    currDice++;
    diceLock = false;
    return sendObj;
}

async function establishUser(payload: NameEvent) {
    if (userMap.has(payload.id)) {
        sendAll();
    }
    await waitLock(userLock);
    userLock = true;
    // THIS CURRENTLY USES THE WRONG ID FOR DEV PURPOSES
    // FIX THIS AT SOME POINT
    if (await cli.addUser(payload.name, payload.pass, payload.id)) {
        userMap.set(payload.id, true);
        broadcast(
            JSON.stringify({
                entity: Entity.Name,
                accepted: true,
                id: payload.id,
            }),
        );
        console.log('succeed');
    } else {
        broadcast(
            JSON.stringify({
                entity: Entity.Name,
                accepted: false,
                id: payload.id,
            }),
        );
        console.log('failed');
    }
    console.log('donethat');
    userLock = false;
    sendAll();
}

async function waitLock(lock: boolean) {
    while (lock) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

async function sendAll() {
    for (const [key, val] of layerMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        broadcast(JSON.stringify(val));
    }
    for (const [key, val] of objectMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        broadcast(JSON.stringify(val));
    }
    for (const [key, val] of diceMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        broadcast(JSON.stringify(val));
    }
}

async function sendAllLasers() {
    for (const [key, val] of laserMap) {
        broadcast(JSON.stringify(val));
    }
}

async function broadcast(newMessage: string) {
    if (newMessage) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newMessage!, { binary: false });
            }
        });
    }
}
