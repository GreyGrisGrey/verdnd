import type {
    ObjectCreatePayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectRecolourEvent,
    LayerState,
} from './objectEvents.ts';
import type { DicePayload } from './rightBar/rollBarMenu.ts';
import { Board } from './boardCanvas/localBoard.ts';

// Main interface with the server.
// Will it stick around in the long run? I do not know.
export class tempStore {
    storedObjects: Map<number, ObjectCreatePayload>;
    storedLayers: Map<number, LayerState>;
    currIndex: number;
    prevMapping: Map<number, number>;
    socket: WebSocket;
    board: Board | null;

    constructor() {
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.currIndex = 0;
        this.prevMapping = new Map();
        this.socket = new WebSocket('ws://47.55.46.138:4322/');
        this.board = null;

        this.socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.entity === 'LAYER') {
                this.storedLayers.set(message.data.id, message.data);
            } else if (message.entity === 'OBJECT') {
                if (
                    message.action === 'DESTROY' &&
                    this.storedObjects.has(message.objectId)
                ) {
                    this.storedObjects.delete(message.objectId);
                    if (this.board) {
                        this.board.removeObject(message.objectId);
                    }
                } else {
                    this.storedObjects.set(
                        message.object.objectId,
                        message.object,
                    );
                }
            } else if (message.entity === 'ROLL') {
                console.log(message);
                this.prevMapping.set(message.index, message.result);
            }
        });
    }

    setBoard(newBoard: Board) {
        this.board = newBoard;
    }

    ping() {
        this.socket.send('PING');
    }

    rollDice(newDice: DicePayload) {
        this.socket.send(JSON.stringify({ entity: 'ROLL', data: newDice }));
    }

    getDice() {
        return this.prevMapping;
    }

    // Sends a packet telling the backend to create an object with those parameters.
    async createObject(newObj: ObjectCreateEvent) {
        newObj.object.objectId = -1;
        this.socket.send(JSON.stringify(newObj));
        return -1;
    }

    getObjects(): Map<number, ObjectCreatePayload> {
        return this.storedObjects;
    }

    // Tells the backend to create a layer.
    async createLayer() {
        this.socket.send(
            JSON.stringify({
                entity: 'LAYER',
                action: 'Create',
                data: {
                    id: -1,
                    gmVisible: true,
                    playerVisible: true,
                    zOrder: 0,
                },
            }),
        );
        return;
    }

    getLayers() {
        return this.storedLayers;
    }

    // Tells the backend to destroy a bunch of objects.
    // Does not, in fact, destroy the object locally. TODO - make it do that.
    async destroyObjects(targetIds: number[]) {
        for (const id of targetIds) {
            if (this.storedObjects.has(id)) {
                this.socket.send(
                    JSON.stringify({
                        entity: 'OBJECT',
                        action: 'DESTROY',
                        objectId: id,
                    }),
                );
            }
        }
    }

    // Receives a list of objects to move, checks each object's existence, if it exists moves it and tells the backend to move it too.
    // Questionable that it sends a packet for each object.
    async moveObjects(events: ObjectMoveEvent[]) {
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.x += event.x;
                targetObj.y += event.y;
                this.socket.send(
                    JSON.stringify({
                        entity: 'OBJECT',
                        action: 'MOVE',
                        objectId: event.objectId,
                        x: event.x,
                        y: event.y,
                    }),
                );
            }
        }
    }

    // Receives a list of objects to recolour, checks each object's existence, if it exists recolours it and tells the backend to recolour it too.
    // Questionable that it sends a packet for each object.
    async recolourObjects(events: ObjectRecolourEvent[]) {
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.colour = event.colour;
                this.socket.send(
                    JSON.stringify({
                        entity: 'OBJECT',
                        action: 'RECOLOUR',
                        objectId: event.objectId,
                        colour: event.colour,
                    }),
                );
            }
        }
    }

    // Updates a layer.
    async updateLayer(input: LayerState) {
        const targetObj = this.storedLayers.get(input.id);
        if (targetObj) {
            this.storedLayers.set(input.id, input);
        }
        this.socket.send(
            JSON.stringify({ entity: 'LAYER', action: 'Update', data: input }),
        );
    }
}
