import { Handler } from '../shared/objectEvents.ts';
import { PostGresData } from './dataMain.ts';
import { GameObject } from './gameObject.ts';
import { handleGameEvent } from './gameEvents/gameHandler.ts';
import { handleMetaEvent } from './metaEvents/metaHandler.ts';
import { constructGame } from './metaEvents/metaEvents.ts';
import { Entity } from '../shared/objectEvents.ts';
import { establishGlobalUser } from './metaEvents/metaEvents.ts';
import { WebSocketData } from './wsData.ts';
import { constructServer } from './serverMain.ts';

import WebSocket, { WebSocketServer } from 'ws';
const cli = new PostGresData();

const hostname = process.env.HOST ?? '0.0.0.0';
const basePort = Number(process.env.PORT ?? 3000);
const maxPortRetries = 20;

const server = constructServer();

let selectedPort = Number.isNaN(basePort) ? 3000 : basePort;
let retryCount = 0;

server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE' && retryCount < maxPortRetries) {
        selectedPort += 1;
        retryCount += 1;
        console.warn(
            `Port ${selectedPort - 1} in use, retrying on ${selectedPort}...`,
        );
        server.listen(selectedPort, hostname);
        return;
    }
    throw err;
});

async function startServer() {
    await cli.ready;
    server.listen(selectedPort, hostname, () => {
        console.log(`Server running at http://${hostname}:${selectedPort}/`);
    });
}

startServer();

const gameMap: Map<number, GameObject> = new Map();
const userMap: Map<string, Set<WebSocket>> = new Map();
const wsMap: Map<WebSocket, WebSocketData> = new Map();
let metaDbLock = false;
let metaUserLock = false;

const wss = new WebSocketServer({ server });

wss.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
        return;
    }
    throw err;
});

wss.on('connection', async function connection(ws) {
    const newConnect = ws;
    wsMap.set(ws, new WebSocketData());
    ws.on('error', console.error);

    ws.on('message', async function message(data, ws) {
        handleEvent(data, newConnect);
    });

    ws.on('close', async function onClose(ws) {
        console.log('connection closed', Date.now());
        const closingWs = wsMap.get(newConnect);
        if (closingWs) {
            const gameObj = gameMap.get(closingWs.game);
            if (gameObj) {
                gameObj.removeUser(closingWs.id);
                if (gameObj.userMap.size === 0) {
                    gameMap.delete(closingWs.game);
                    console.log('game object closed.');
                }
            }
            const user = userMap.get(closingWs.id);
            if (user) {
                user.delete(newConnect);
                if (user.size === 0) {
                    userMap.delete(closingWs.id);
                }
            }
        }
        wsMap.delete(newConnect);
    });

    console.log('connection established', Date.now());
});

// Main code for handling websocket events.
async function handleEvent(event: any, ws: WebSocket) {
    const message = JSON.parse(event);
    if (message.event) {
        const user = userMap.get(message.userId);
        if (message.handler === Handler.Meta && user && user.has(ws)) {
            handleMetaEvent(
                message,
                ws,
                cli,
                userMap,
                metaUserLock,
                metaDbLock,
                wsMap,
            );
        } else if (
            message.handler === Handler.Meta &&
            (!user || !user.has(ws))
        ) {
            const payload = message.event;
            if (
                payload.pass &&
                payload.name &&
                payload.id &&
                payload.entity === Entity.Name
            ) {
                establishGlobalUser(
                    payload,
                    ws,
                    metaUserLock,
                    metaDbLock,
                    cli,
                    userMap,
                    wsMap,
                );
            }
        } else if (message.handler === Handler.Game && user && user.has(ws)) {
            let currGame = gameMap.get(Number(message.gameId));
            if (!currGame) {
                const id = await cli.getIdFromObf(Number(message.gameId));
                if (id === -1) {
                    return;
                }
                const res = await cli.checkGame(id);
                if (res) {
                    await constructGame(
                        id,
                        Number(message.gameId),
                        gameMap,
                        cli,
                    );
                    currGame = gameMap.get(Number(message.gameId));
                    if (!currGame) {
                        return;
                    }
                } else {
                    return;
                }
            }
            handleGameEvent(message, currGame, ws, cli, wsMap);
        } else {
            console.log('message rejected');
        }
    }
}
