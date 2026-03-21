import { Handler } from '../shared/objectEvents.ts';
import { PostGresData } from './dataMain.ts';
import { GameObject } from './gameObject.ts';
import { handleGameEvent } from './gameEvents/gameHandler.ts';
import { handleMetaEvent } from './metaEvents/metaHandler.ts';
import { createLayer } from './gameEvents/layerEvents.ts';
import { constructGame } from './metaEvents/metaEvents.ts';

import WebSocket, { WebSocketServer } from 'ws';
const cli = new PostGresData();

const gameMap: Map<number, GameObject> = new Map();
let userMap: Map<string, boolean> = new Map();
let metaDbLock = false;
let metaUserLock = false;

const wss = new WebSocketServer({ port: 8765 });

wss.on('connection', async function connection(ws) {
    const newConnect = ws;
    ws.on('error', console.error);

    ws.on('message', async function message(data, ws) {
        handleEvent(data, newConnect);
    });

    console.log('connection established');
});

async function handleEvent(event: any, ws: WebSocket) {
    const message = JSON.parse(event);
    if (message.event) {
        if (message.handler === Handler.Game) {
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
            handleGameEvent(event, currGame, ws, cli, userMap);
        } else if (message.handler === Handler.Meta) {
            handleMetaEvent(event, ws, cli, userMap, metaUserLock, metaDbLock);
        }
    }
}
