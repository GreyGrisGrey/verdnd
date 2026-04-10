import { createServer as createHttpServer, type Server as HttpServer } from 'node:http';
import {
    createServer as createHttpsServer,
    type Server as HttpsServer,
} from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

function resolveRequestPath(url: string): string {
    const [pathOnly] = url.split('?');
    if (!pathOnly || pathOnly === '/') {
        return 'pages/index.html';
    }

    const hasExtension = path.extname(pathOnly) !== '';
    if (!hasExtension) {
        const segments = pathOnly.split('/').filter(Boolean);
        if (segments.length === 1) {
            return `pages/${segments[0]}.html`;
        }
        if (segments[0] === 'game') {
            return 'pages/game.html';
        }
    }

    return pathOnly.replace(/^\/+/, '');
}

function getContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.html') return 'text/html; charset=utf-8';
    if (extension === '.js') return 'application/javascript; charset=utf-8';
    if (extension === '.css') return 'text/css; charset=utf-8';
    if (extension === '.json') return 'application/json; charset=utf-8';
    if (extension === '.png') return 'image/png';
    if (extension === '.svg') return 'image/svg+xml';
    if (extension === '.ico') return 'image/x-icon';
    return 'application/octet-stream';
}

// Constructs a server object.
// Really should split some of this into other files.
export function constructServer(): HttpServer | HttpsServer {
    const projectRoot = process.cwd();
    const staticRoot = path.join(projectRoot, 'dist/client');
    const keyPath = process.env.TLS_KEY_PATH || path.join(projectRoot, 'f2.key');
    const certPath =
        process.env.TLS_CERT_PATH || path.join(projectRoot, 'f1.crt');

    const requestHandler = async (req: any, res: any) => {
        console.log(req.url);
        const reqUrl = req.url || '/';
        if (req.method === 'GET') {
            const relativePath = resolveRequestPath(reqUrl);
            const filePath = path.join(staticRoot, relativePath);
            fs.readFile(filePath, (err: any, data: any) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(200, {
                        'Content-Type': getContentType(filePath),
                    });
                    res.end(data);
                }
            });
        } else if (req.method === 'POST') {
            const location = reqUrl.split('/');
            try {
                if (
                    location.length === 6 &&
                    location[1] === 'upload' &&
                    location[2] === 'game' &&
                    location[3] === 'remove'
                ) {
                    const filePath = path.join(
                        staticRoot,
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
                    path.join(staticRoot, 'client/assets/games', location[3]),
                    function (e: any) {
                        if (!e || (e && e.code === 'EEXIST')) {
                        } else {
                            console.log(e);
                        }
                    },
                );
                const filePath = path.join(
                    staticRoot,
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
    };

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return createHttpsServer(
            {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            },
            requestHandler,
        );
    }

    console.warn(
        `TLS certs not found at ${keyPath} and ${certPath}; starting HTTP server.`,
    );
    return createHttpServer(requestHandler);
}
