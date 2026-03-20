import { PostGresData } from './dataMain.ts';
const a = 'a';

const { createServer } = require('node:http');
const fs = require('fs'); // Import the file system module
const path = require('path');

const hostname = '192.168.2.142';
const port = 8080;

const server = createServer((req: any, res: any) => {
    // this is already off to a rough start.
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
                    req.url = 'pages/second.html';
                }
            } else {
                req.url = req.url.split('/').slice(2).join('/');
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
