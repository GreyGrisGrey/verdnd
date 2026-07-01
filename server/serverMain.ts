import { PostGresData } from './dataMain.ts';
const { createServer } = require('node:https');
const fs = require('fs');
const path = require('path');

import type { Server } from 'https';

// Constructs a server object.
// Really should split some of this into other files.
export function constructServer(): Server {
    const options = {
        key: fs.readFileSync('./f2.key'),
        cert: fs.readFileSync('./f1.crt'),
    };

    return createServer(options, async (req: any, res: any) => {
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
                    if (path.extname(filePath) === '.js') {
                        res.writeHead(200, {
                            'Content-Type': 'text/javascript',
                        });
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                    }
                    res.end(data);
                }
            });
        } else if (req.method === 'POST') {
            const location = req.url.split('/');
            try {
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
            } catch (err) {
                console.log('upload failed');
                res.writeHead(500);
                res.end('Error uploading file');
            }
        }
    });
}
