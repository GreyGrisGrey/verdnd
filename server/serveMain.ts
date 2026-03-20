import type {
    ObjectCreateEvent,
    LayerUpdateEvent,
    LayerState,
    DicePayload,
    LaserEvent,
    RollComplete,
    NameEvent,
    Token,
} from '../shared/objectEvents.ts';
import { SingleRoll } from '../shared/objectEvents.ts';
import { Action, Entity } from '../shared/objectEvents.ts';
import {
    objectPayloadToRow,
    updateObjectToRow,
    layerPayloadToRow,
    rollPayloadToRow,
    updateLayerToRow,
    updateTokenToRow,
    tokenPayloadToRow,
} from './converter.ts';
import { PostGresData } from './dataMain.ts';

import WebSocket, { WebSocketServer } from 'ws';
const cli = new PostGresData();

// SELECT datname FROM pg_catalog.pg_database
let objectMap: Map<number, ObjectCreateEvent> = new Map();
let layerMap: Map<number, LayerUpdateEvent> = new Map();
let diceMap: Map<number, RollComplete> = new Map();
let userMap: Map<string, boolean> = new Map();
const laserMap: Map<string, LaserEvent> = new Map();
const gmMap: Map<WebSocket, boolean> = new Map();

let objectLock = false;
let layerLock = false;
let diceLock = false;
let userLock = false;
let dbLock = false;

let currCol = '#444444';
let currObj = 0;
let currLayer = 0;
let currDice = 0;
let laserTimer = 0;
let finishedSetup = false;

const currGame = 0;
const play = true;
const allGm = false;

const wss = new WebSocketServer({ port: 8765 });

wss.on('connection', async function connection(ws) {
    const newConnect = ws;
    ws.on('error', console.error);

    ws.on('message', async function message(data, ws) {
        handleEvent(data, newConnect);
    });
    gmMap.set(newConnect, allGm);

    console.log('connection established');
});

setUp();

async function setUp() {
    if (!play) {
        return;
    }
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
            if (val.id >= currDice) {
                currDice = val.id + 1;
            }
        }
        currCol = res[3];
        finishedSetup = true;
    } else {
        await cli.constructGame('0');
        await createLayer();
        finishedSetup = true;
    }
}

async function handleEvent(event: any, ws: WebSocket) {
    const message = JSON.parse(event);
    if (message.event) {
        const payload = message.event;
        if (payload.entity === Entity.Object) {
            if (payload.action === Action.Create && gmMap.get(ws)) {
                createObj(payload);
            } else if (payload.action === Action.Destroy && gmMap.get(ws)) {
                destroyObj(payload.objectId);
            } else if (payload.action === Action.Move) {
                moveObj(payload.objectId, payload.x, payload.y, ws);
            } else if (payload.action === Action.Recolour && gmMap.get(ws)) {
                colourObj(payload.objectId, payload.colour);
            }
        } else if (payload.entity === Entity.Layer) {
            if (payload.action === Action.Create && gmMap.get(ws)) {
                createLayer();
            } else if (payload.action === Action.Destroy && gmMap.get(ws)) {
                destroyLayer(payload.layerId);
            } else if (payload.action === Action.Update && gmMap.get(ws)) {
                updateLayer(payload.layer.id, payload.layer);
            }
        } else if (payload.entity === Entity.Roll) {
            addDice(payload.dice, message.userId, payload.userName);
        } else if (payload.entity === Entity.Laser) {
            updateLaser(payload);
        } else if (payload.entity === Entity.Token && gmMap.get(ws)) {
            updateToken(payload.token, payload.id);
        } else if (payload.entity === Entity.Name) {
            if (payload.pass && payload.name && payload.id) {
                establishUser(payload, ws);
            }
        } else if (payload.entity === Entity.Meta && gmMap.get(ws)) {
            console.log(payload.newColour);
            console.log(currCol);
            updateBackground(payload.newColour);
        }
    }
}

async function updateBackground(newCol: string) {
    await waitLock(dbLock);
    dbLock = true;
    cli.updateGame(currGame, newCol);
    currCol = newCol;
    dbLock = false;
    broadcast(
        JSON.stringify({
            entity: Entity.Meta,
            action: Action.Recolour,
            newColour: currCol,
        }),
    );
}

async function updateLaser(payload: LaserEvent) {
    laserMap.set(payload.id, payload);
    sendAllLasers();
}

async function createObj(newObject: ObjectCreateEvent) {
    await waitLock(objectLock);
    if (!newObject.token) {
        return;
    }
    objectLock = true;
    objectMap.set(currObj, newObject);
    newObject.object.objectId = currObj;
    const sendObj = JSON.stringify(newObject);
    await waitLock(dbLock);
    dbLock = true;
    cli.addObject(currGame, objectPayloadToRow(newObject));
    if (
        !(await cli.addToken(
            currGame,
            tokenPayloadToRow(newObject.token, currObj),
        ))
    ) {
        cli.destroyObject(currGame, currObj);
        dbLock = false;
        objectLock = false;
    } else {
        currObj++;
        dbLock = false;
        objectLock = false;
        broadcast(sendObj);
    }
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
    await waitLock(dbLock);
    dbLock = true;
    cli.destroyObject(currGame, objId);
    cli.destroyToken(currGame, objId);
    dbLock = false;
    objectLock = false;
    broadcast(sendObj);
}

async function moveObj(
    objId: number,
    xChange: number,
    yChange: number,
    ws: WebSocket,
) {
    await waitLock(objectLock);
    objectLock = true;
    const currObj = objectMap.get(objId);
    if (currObj && (gmMap.get(ws) || currObj.token.active)) {
        currObj.object.x += xChange;
        currObj.object.y += yChange;
        const sendObj = JSON.stringify(currObj);
        await waitLock(dbLock);
        dbLock = true;
        cli.updateObject(currGame, objId, updateObjectToRow(currObj));
        dbLock = false;
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
        await waitLock(dbLock);
        dbLock = true;
        cli.updateObject(currGame, objId, updateObjectToRow(currObj));
        dbLock = false;
        objectLock = false;
        broadcast(sendObj);
    } else {
        objectLock = false;
        return 'NONE';
    }
}

async function createLayer() {
    await waitLock(layerLock);
    layerLock = true;
    layerMap.set(currLayer, {
        entity: Entity.Layer,
        action: Action.Update,
        layer: {
            gmVisible: true,
            playerVisible: true,
            zOrder: layerMap.size,
            id: currLayer,
            name: 'none',
            x: 0,
            y: 0,
        },
    });
    const sendObj = JSON.stringify(layerMap.get(currLayer));
    await waitLock(dbLock);
    dbLock = true;
    cli.addLayer(currGame, layerPayloadToRow(layerMap.get(currLayer)!));
    dbLock = false;
    currLayer++;
    layerLock = false;
    broadcast(sendObj);
}

async function updateLayer(layerId: number, newLayer: LayerState) {
    await waitLock(layerLock);
    layerLock = true;
    const oldVis = layerMap.get(layerId)!.layer.playerVisible;
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
    await waitLock(dbLock);
    dbLock = true;
    cli.updateLayer(
        currGame,
        layerId,
        updateLayerToRow({
            entity: Entity.Layer,
            action: Action.Update,
            layer: newLayer,
        }),
    );
    dbLock = false;
    if (oldVis !== newLayer.playerVisible) {
        sendMasses(newLayer.id);
    }
    layerLock = false;
    broadcast(sendObj);
}

async function destroyLayer(layerId: number) {
    await waitLock(layerLock);
    layerLock = true;
    if (layerMap.size > 1) {
        layerMap.delete(layerId);
        await waitLock(dbLock);
        dbLock = true;
        cli.destroyLayer(currGame, layerId);
        dbLock = false;
        layerLock = false;
        const sendObj = JSON.stringify({
            entity: Entity.Layer,
            action: Action.Destroy,
            layerId: layerId,
        });
        broadcast(sendObj);
    }
    layerLock = false;
}

async function addDice(newDice: DicePayload, userId: string, userName: string) {
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
        userName: userName,
    });
    const sendObj = JSON.stringify({
        entity: Entity.Roll,
        action: Action.Update,
        id: currDice,
        result: rollResult,
        userId: userId,
        userName: userName,
    });
    await waitLock(dbLock);
    dbLock = true;
    cli.addRoll(
        currGame,
        rollPayloadToRow({
            entity: Entity.Roll,
            action: Action.Update,
            id: currDice,
            result: rollResult,
            userId: userId,
            userName: userName,
        }),
    );
    dbLock = false;
    currDice++;
    broadcast(sendObj);
    diceLock = false;
    return sendObj;
}

async function updateToken(newToken: Token, id: number) {
    await waitLock(objectLock);
    objectLock = true;
    await waitLock(dbLock);
    dbLock = true;
    cli.updateToken(currGame, id, updateTokenToRow(newToken));
    objectMap.get(id)!.token = newToken;
    objectMap.get(id)!.object.token = newToken;
    broadcast(
        JSON.stringify({ entity: Entity.Token, id: id, token: newToken }),
    );
    dbLock = false;
    objectLock = false;
}

async function establishUser(payload: NameEvent, ws: WebSocket) {
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
        } else {
            gmMap.set(ws, allGm);
            userMap.set(payload.id, true);
            ws.send(
                JSON.stringify({
                    entity: Entity.Name,
                    accepted: true,
                    gm: allGm,
                    id: payload.id,
                }),
            );
            console.log('user add success');
        }
    } else if (await cli.addUser(payload.name, payload.pass, payload.id)) {
        gmMap.set(ws, allGm);
        userMap.set(payload.id, true);
        ws.send(
            JSON.stringify({
                entity: Entity.Name,
                accepted: true,
                gm: allGm,
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
    sendAll(ws);
}

async function waitLock(lock: boolean) {
    while (lock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}

async function sendMasses(targetLayer: number) {
    for (const [key, val] of objectMap) {
        if (val.object.layerId === targetLayer) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            broadcast(JSON.stringify(val), val.object.layerId);
        }
    }
}

async function sendAll(ws: WebSocket) {
    while (!finishedSetup) {
        await new Promise((resolve) => setTimeout(resolve, 2));
    }
    for (const [key, val] of layerMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        ws.send(JSON.stringify(val));
    }
    for (const [key, val] of objectMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        ws.send(JSON.stringify(val));
    }
    for (const [key, val] of diceMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        ws.send(JSON.stringify(val));
    }
    ws.send(
        JSON.stringify({
            entity: Entity.Meta,
            action: Action.Recolour,
            newColour: currCol,
        }),
    );
    ws.send(JSON.stringify({ entity: Entity.Meta, action: Action.Finish }));
}

async function sendAllLasers() {
    const currTime = Date.now();
    if (currTime - laserTimer < 30) {
        return;
    } else {
        laserTimer = currTime;
    }
    for (const [key, val] of laserMap) {
        if (laserTimer - val.time > 1000) {
            laserMap.delete(key);
        } else {
            broadcast(JSON.stringify(val));
        }
    }
}

async function broadcast(newMessage: string, layerId: number = -1) {
    if (newMessage) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                if (
                    layerId === -1 ||
                    layerMap.get(layerId)!.layer.playerVisible ||
                    gmMap.get(client)
                ) {
                    client.send(newMessage!, { binary: false });
                }
            }
        });
    }
}
