import WebSocket from 'ws';

export class PlayerPacket {
    isGm: boolean;
    name: string;
    id: string;
    ws: WebSocket;

    constructor(name: string, id: string, isGm: boolean, ws: WebSocket) {
        this.isGm = isGm;
        this.name = name;
        this.id = id;
        this.ws = ws;
    }
}
