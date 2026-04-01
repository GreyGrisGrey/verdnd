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

const { createServer } = require('node:https');
const fs = require('fs');
const path = require('path');

const hostname = '192.168.2.142';
const port = 443;
const options = {
    key: fs.readFileSync('./f2.key'),
    cert: fs.readFileSync('./f1.crt'),
};

const server = createServer(options, async (req: any, res: any) => {
    console.log(req.url);
    if (req.method === 'GET') {
        if (req.url === '/') {
            req.url = 'pages/index.html';
        } else {
            const split = req.url.split('.');
            if (split.length === 1) {
                const split2 = req.url.split('/');
                if (split2.length === 2) {
                    req.url = 'pages/' + req.url + '.html';
                } else {
                    req.url = 'pages/game.html';
                }
            } else {
                const slashSplit = req.url.split('/');
                if (slashSplit.length !== 2) {
                    req.url = req.url.split('/').slice(2).join('/');
                }
            }
        }
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err: any, data: any) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST') {
        const location = req.url.split('/');
        if (
            location.length === 6 &&
            location[1] === 'upload' &&
            location[2] === 'game' &&
            location[3] === 'remove'
        ) {
            const filePath = path.join(
                __dirname,
                'client/assets/games',
                location[4],
                'obj' + location[5] + '.png',
            );
            fs.rm(filePath, function (e: any) {
                if (!e || (e && e.code === 'EEXIST')) {
                } else {
                    console.log(e);
                }
            });
            res.writeHead(200);
            res.end();
            return;
        }
        if (
            location.length !== 5 ||
            location[1] !== 'upload' ||
            location[2] !== 'game'
        ) {
            res.writeHead(500);
            res.end('Error during file upload.');
            return;
        }
        await fs.mkdir(
            path.join(__dirname, 'client/assets/games', location[3]),
            function (e: any) {
                if (!e || (e && e.code === 'EEXIST')) {
                } else {
                    console.log(e);
                }
            },
        );
        const filePath = path.join(
            __dirname,
            'client/assets/games',
            location[3],
            'obj' + location[4] + '.png',
        );
        const fileStream = fs.createWriteStream(filePath);
        req.pipe(fileStream);
        req.on('end', () => {
            res.writeHead(200);
            res.end();
        });
        req.on('error', (err: any) => {
            res.writeHead(500);
            res.end('Error uploading file');
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const gameMap: Map<number, GameObject> = new Map();
const userMap: Map<string, Set<WebSocket>> = new Map();
const wsMap: Map<WebSocket, WebSocketData> = new Map();
let metaDbLock = false;
let metaUserLock = false;

const wss = new WebSocketServer({ server });

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
            handleGameEvent(message, currGame, ws, cli, wsMap);
        } else {
            console.log('message rejected');
        }
    }
}
