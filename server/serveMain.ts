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
import { GameObject } from './gameObject.ts';

import WebSocket, { WebSocketServer } from 'ws';
const cli = new PostGresData();

const { createServer } = require('node:http');
const fs = require('fs'); // Import the file system module
const path = require('path');

const hostname = '192.168.2.142';
const port = 8080;

const server = createServer((req: any, res: any) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            req.url = 'pages/index.html';
        } else {
            const split = req.url.split('.');
            if (split.length === 1) {
                req.url = 'pages/' + req.url + '.html';
            }
        }
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err: any, data: any) => {
            if (err) {
                // Handle potential file reading errors
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                // Set the content type and send the file content
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data); // Send the file data as the response
            }
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const gameMap: Map<number, GameObject> = new Map();
constructGame(0);
constructGame(1);

const gmMap: Map<WebSocket, boolean> = new Map();
const allGm = false;
let userMap: Map<string, boolean> = new Map();
let objectLock = false;
let layerLock = false;
let diceLock = false;
let userLock = false;
let dbLock = false;

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

async function constructGame(gameId: number) {
    if (gameMap.has(gameId)) {
        return true;
    }
    const newGame = new GameObject(gameId);
    gameMap.set(gameId, newGame);
    const res = await newGame.setUp(cli);
    if (!res) {
        createLayer(newGame);
    }
}

async function handleEvent(event: any, ws: WebSocket) {
    const message = JSON.parse(event);
    if (message.event) {
        const payload = message.event;
        const currGame = gameMap.get(Number(message.gameId));
        if (
            message.gameId === -1 &&
            payload.entity === Entity.Name &&
            payload.pass &&
            payload.name &&
            payload.id
        ) {
            establishUser(payload, ws, null);
        }
        if (!currGame) {
            return;
        }
        if (payload.entity === Entity.Object) {
            if (payload.action === Action.Create && gmMap.get(ws)) {
                createObj(payload, currGame);
            } else if (payload.action === Action.Destroy && gmMap.get(ws)) {
                destroyObj(payload.objectId, currGame);
            } else if (payload.action === Action.Move) {
                moveObj(payload.objectId, payload.x, payload.y, ws, currGame);
            } else if (payload.action === Action.Recolour && gmMap.get(ws)) {
                colourObj(payload.objectId, payload.colour, currGame);
            }
        } else if (payload.entity === Entity.Layer) {
            if (payload.action === Action.Create && gmMap.get(ws)) {
                createLayer(currGame);
            } else if (payload.action === Action.Destroy && gmMap.get(ws)) {
                destroyLayer(payload.layerId, currGame);
            } else if (payload.action === Action.Update && gmMap.get(ws)) {
                updateLayer(payload.layer.id, payload.layer, currGame);
            }
        } else if (payload.entity === Entity.Roll) {
            addDice(payload.dice, message.userId, payload.userName, currGame);
        } else if (payload.entity === Entity.Laser) {
            updateLaser(payload, currGame);
        } else if (payload.entity === Entity.Token && gmMap.get(ws)) {
            updateToken(payload.token, payload.id, currGame);
        } else if (payload.entity === Entity.Name) {
            if (payload.pass && payload.name && payload.id) {
                establishUser(payload, ws, currGame);
            }
        } else if (payload.entity === Entity.Meta && gmMap.get(ws)) {
            updateBackground(payload.newColour, currGame);
        }
    }
}

async function updateBackground(newCol: string, currGame: GameObject) {
    await waitLock(dbLock);
    dbLock = true;
    cli.updateGame(currGame.gameId, newCol);
    currGame.currCol = newCol;
    dbLock = false;
    broadcast(
        JSON.stringify({
            entity: Entity.Meta,
            action: Action.Recolour,
            newColour: currGame.currCol,
        }),
        currGame,
    );
}

async function updateLaser(payload: LaserEvent, currGame: GameObject) {
    currGame.laserMap.set(payload.id, payload);
    sendAllLasers(currGame);
}

async function createObj(newObject: ObjectCreateEvent, currGame: GameObject) {
    await waitLock(objectLock);
    if (!newObject.token) {
        return;
    }
    objectLock = true;
    currGame.objectMap.set(currGame.currObj, newObject);
    newObject.object.objectId = currGame.currObj;
    const sendObj = JSON.stringify(newObject);
    await waitLock(dbLock);
    dbLock = true;
    cli.addObject(currGame.gameId, objectPayloadToRow(newObject));
    if (
        !(await cli.addToken(
            currGame.gameId,
            tokenPayloadToRow(newObject.token, currGame.currObj),
        ))
    ) {
        cli.destroyObject(currGame.gameId, currGame.currObj);
        dbLock = false;
        objectLock = false;
    } else {
        currGame.currObj++;
        dbLock = false;
        objectLock = false;
        broadcast(sendObj, currGame);
    }
}

async function destroyObj(objId: number, currGame: GameObject) {
    await waitLock(objectLock);
    objectLock = true;
    currGame.objectMap.delete(objId);
    const sendObj = JSON.stringify({
        entity: Entity.Object,
        action: Action.Destroy,
        objectId: objId,
    });
    await waitLock(dbLock);
    dbLock = true;
    cli.destroyObject(currGame.gameId, objId);
    cli.destroyToken(currGame.gameId, objId);
    dbLock = false;
    objectLock = false;
    broadcast(sendObj, currGame);
}

async function moveObj(
    objId: number,
    xChange: number,
    yChange: number,
    ws: WebSocket,
    currGame: GameObject,
) {
    await waitLock(objectLock);
    objectLock = true;
    const currObj = currGame.objectMap.get(objId);
    if (currObj && (gmMap.get(ws) || currObj.token.active)) {
        currObj.object.x += xChange;
        currObj.object.y += yChange;
        const sendObj = JSON.stringify(currObj);
        await waitLock(dbLock);
        dbLock = true;
        cli.updateObject(currGame.gameId, objId, updateObjectToRow(currObj));
        dbLock = false;
        objectLock = false;
        broadcast(sendObj, currGame);
    } else {
        objectLock = false;
        return 'NONE';
    }
}

async function colourObj(objId: number, colour: string, currGame: GameObject) {
    await waitLock(objectLock);
    objectLock = true;
    const currObj = currGame.objectMap.get(objId);
    if (currObj) {
        currObj.object.colour = colour;
        const sendObj = JSON.stringify(currObj);
        await waitLock(dbLock);
        dbLock = true;
        cli.updateObject(currGame.gameId, objId, updateObjectToRow(currObj));
        dbLock = false;
        objectLock = false;
        broadcast(sendObj, currGame);
    } else {
        objectLock = false;
        return 'NONE';
    }
}

async function createLayer(currGame: GameObject) {
    await waitLock(layerLock);
    layerLock = true;
    currGame.layerMap.set(currGame.currLayer, {
        entity: Entity.Layer,
        action: Action.Update,
        layer: {
            gmVisible: true,
            playerVisible: true,
            zOrder: currGame.layerMap.size,
            id: currGame.currLayer,
            name: 'none',
            x: 0,
            y: 0,
        },
    });
    const sendObj = JSON.stringify(currGame.layerMap.get(currGame.currLayer));
    await waitLock(dbLock);
    dbLock = true;
    cli.addLayer(
        currGame.gameId,
        layerPayloadToRow(currGame.layerMap.get(currGame.currLayer)!),
    );
    dbLock = false;
    currGame.currLayer++;
    layerLock = false;
    broadcast(sendObj, currGame);
}

async function updateLayer(
    layerId: number,
    newLayer: LayerState,
    currGame: GameObject,
) {
    await waitLock(layerLock);
    layerLock = true;
    const oldVis = currGame.layerMap.get(layerId)!.layer.playerVisible;
    currGame.layerMap.set(layerId, {
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
        currGame.gameId,
        layerId,
        updateLayerToRow({
            entity: Entity.Layer,
            action: Action.Update,
            layer: newLayer,
        }),
    );
    dbLock = false;
    if (oldVis !== newLayer.playerVisible) {
        sendMasses(newLayer.id, currGame);
    }
    layerLock = false;
    broadcast(sendObj, currGame);
}

async function destroyLayer(layerId: number, currGame: GameObject) {
    await waitLock(layerLock);
    layerLock = true;
    if (currGame.layerMap.size > 1) {
        currGame.layerMap.delete(layerId);
        await waitLock(dbLock);
        dbLock = true;
        cli.destroyLayer(currGame.gameId, layerId);
        dbLock = false;
        layerLock = false;
        const sendObj = JSON.stringify({
            entity: Entity.Layer,
            action: Action.Destroy,
            layerId: layerId,
        });
        broadcast(sendObj, currGame);
    }
    layerLock = false;
}

async function addDice(
    newDice: DicePayload,
    userId: string,
    userName: string,
    currGame: GameObject,
) {
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
    currGame.diceMap.set(currGame.currDice, {
        entity: Entity.Roll,
        action: Action.Update,
        id: currGame.currDice,
        result: rollResult,
        userId: userId,
        userName: userName,
    });
    const sendObj = JSON.stringify({
        entity: Entity.Roll,
        action: Action.Update,
        id: currGame.currDice,
        result: rollResult,
        userId: userId,
        userName: userName,
    });
    await waitLock(dbLock);
    dbLock = true;
    cli.addRoll(
        currGame.gameId,
        rollPayloadToRow({
            entity: Entity.Roll,
            action: Action.Update,
            id: currGame.currDice,
            result: rollResult,
            userId: userId,
            userName: userName,
        }),
    );
    dbLock = false;
    currGame.currDice++;
    broadcast(sendObj, currGame);
    diceLock = false;
    return sendObj;
}

async function updateToken(newToken: Token, id: number, currGame: GameObject) {
    await waitLock(objectLock);
    objectLock = true;
    await waitLock(dbLock);
    dbLock = true;
    cli.updateToken(currGame.gameId, id, updateTokenToRow(newToken));
    currGame.objectMap.get(id)!.token = newToken;
    currGame.objectMap.get(id)!.object.token = newToken;
    broadcast(
        JSON.stringify({ entity: Entity.Token, id: id, token: newToken }),
        currGame,
    );
    dbLock = false;
    objectLock = false;
}

async function establishUser(
    payload: NameEvent,
    ws: WebSocket,
    currGame: GameObject | null,
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
            if (currGame) {
                currGame.addUser(payload.name, payload.id, allGm, ws);
            }
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
        if (currGame) {
            currGame.addUser(payload.name, payload.id, allGm, ws);
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
    dbLock = false;
    userLock = false;
    if (currGame) {
        sendAll(ws, currGame);
    }
}

async function waitLock(lock: boolean) {
    while (lock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}

async function sendMasses(targetLayer: number, currGame: GameObject) {
    for (const [key, val] of currGame.objectMap) {
        if (val.object.layerId === targetLayer) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            broadcast(JSON.stringify(val), currGame, val.object.layerId);
        }
    }
}

async function sendAll(ws: WebSocket, currGame: GameObject) {
    while (!currGame.finishedSetup) {
        await new Promise((resolve) => setTimeout(resolve, 2));
    }
    for (const [key, val] of currGame.layerMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        ws.send(JSON.stringify(val));
    }
    for (const [key, val] of currGame.objectMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        ws.send(JSON.stringify(val));
    }
    for (const [key, val] of currGame.diceMap) {
        await new Promise((resolve) => setTimeout(resolve, 2));
        ws.send(JSON.stringify(val));
    }
    ws.send(
        JSON.stringify({
            entity: Entity.Meta,
            action: Action.Recolour,
            newColour: currGame.currCol,
        }),
    );
    ws.send(JSON.stringify({ entity: Entity.Meta, action: Action.Finish }));
}

async function sendAllLasers(currGame: GameObject) {
    const currTime = Date.now();
    if (currTime - currGame.laserTimer < 30) {
        return;
    } else {
        currGame.laserTimer = currTime;
    }
    for (const [key, val] of currGame.laserMap) {
        if (currGame.laserTimer - val.time > 1000) {
            currGame.laserMap.delete(key);
        } else {
            broadcast(JSON.stringify(val), currGame);
        }
    }
}

async function broadcast(
    newMessage: string,
    currGame: GameObject,
    layerId: number = -1,
) {
    if (newMessage) {
        currGame.userMap.forEach(function each(player) {
            if (player.ws.readyState === WebSocket.OPEN) {
                if (
                    layerId === -1 ||
                    currGame.layerMap.get(layerId)!.layer.playerVisible ||
                    player.isGm
                ) {
                    player.ws.send(newMessage!, { binary: false });
                }
            }
        });
    }
}
