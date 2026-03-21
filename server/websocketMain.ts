import { Handler } from '../shared/objectEvents.ts';
import { PostGresData } from './dataMain.ts';
import { GameObject } from './gameObject.ts';
import { handleGameEvent } from './gameEvents/gameHandler.ts';
import { handleMetaEvent } from './metaEvents/metaHandler.ts';
import { constructGame } from './metaEvents/metaEvents.ts';
import { Entity } from '../shared/objectEvents.ts';
import { establishGlobalUser } from './metaEvents/metaEvents.ts';
import { WebSocketData } from './wsData.ts';

import WebSocket, { WebSocketServer } from 'ws';
const cli = new PostGresData();

const gameMap: Map<number, GameObject> = new Map();
const userMap: Map<string, WebSocket> = new Map();
const wsMap: Map<WebSocket, WebSocketData> = new Map();
let metaDbLock = false;
let metaUserLock = false;

const wss = new WebSocketServer({ port: 8765 });

wss.on('connection', async function connection(ws) {
    const newConnect = ws;
    wsMap.set(ws, new WebSocketData());
    ws.on('error', console.error);

    ws.on('message', async function message(data, ws) {
        handleEvent(data, newConnect);
    });

    ws.on('close', async function onClose(ws) {
        console.log('connection closed');
        const closingWs = wsMap.get(newConnect);
        if (closingWs) {
            const gameObj = gameMap.get(closingWs.game);
            if (gameObj) {
                gameObj.removeUser(closingWs.id);
            }
            if (userMap.has(closingWs.id)) {
                userMap.delete(closingWs.id);
            }
        }
    });

    console.log('connection established');
});

async function handleEvent(event: any, ws: WebSocket) {
    const message = JSON.parse(event);
    if (message.event) {
        if (
            message.handler === Handler.Meta &&
            ws === userMap.get(message.userId)
        ) {
            handleMetaEvent(
                event,
                ws,
                cli,
                userMap,
                metaUserLock,
                metaDbLock,
                wsMap,
            );
        } else if (
            message.handler === Handler.Meta &&
            ws !== userMap.get(message.userId)
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
        } else if (
            message.handler === Handler.Game &&
            ws === userMap.get(message.userId)
        ) {
            let currGame = gameMap.get(Number(message.gameId));
            if (!currGame) {
                const res = await cli.checkGame(Number(message.gameId));
                if (res) {
                    await constructGame(Number(message.gameId), gameMap, cli);
                    currGame = gameMap.get(Number(message.gameId));
                    if (!currGame) {
                        return;
                    }
                } else {
                    return;
                }
            }
            handleGameEvent(event, currGame, ws, cli, wsMap);
        } else {
            console.log('message rejected');
        }
    }
}
