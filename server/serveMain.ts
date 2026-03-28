import { PostGresData } from './dataMain.ts';
const a = 'a';

const { createServer } = require('node:http');
const fs = require('fs'); // Import the file system module
const path = require('path');

const hostname = '192.168.2.142';
const port = 8080;

const server = createServer(async (req: any, res: any) => {
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
                req.url = req.url.split('/').slice(2).join('/');
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
            location.length !== 5 ||
            location[1] !== 'upload' ||
            location[2] !== 'game'
        ) {
            res.writeHead(500);
            res.end('Error during file upload.');
            console.log(location);
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
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ win: 'win' }));
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
