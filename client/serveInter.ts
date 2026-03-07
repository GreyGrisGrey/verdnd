import type {
    ObjectCreatePayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectRecolourEvent,
    LayerState,
    ServerEvent,
} from './objectEvents.ts';
import type { DicePayload } from './rightBar/rollBarMenu.ts';
import { Board } from './boardCanvas/localBoard.ts';
import { ColInst } from './colours.ts';
import { Action, Entity, Shape } from './objectEvents.ts';

// Main interface with the server.
// Will it stick around in the long run? I do not know.
export class tempStore {
    localNum: number;
    undoMap: Map<number, any>;
    undoCreateTracker: Map<number, number>;
    storedObjects: Map<number, ObjectCreatePayload>;
    storedLayers: Map<number, LayerState>;
    currIndex: number;
    secondIndex: number;
    prevMapping: Map<number, number>;
    socket: WebSocket;
    board: Board | null;

    constructor() {
        this.localNum = Math.round(Math.random() * 1000000);
        this.undoMap = new Map();
        this.undoCreateTracker = new Map();
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.currIndex = 0;
        this.secondIndex = 0;
        this.prevMapping = new Map();
        //this.socket = new WebSocket('ws://47.55.46.138:4322/');
        this.socket = new WebSocket('ws://192.168.2.142:8765/');
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
                    if (
                        message.clientId === this.localNum &&
                        !this.storedObjects.has(message.object.objectId)
                    ) {
                        this.secondIndex--;
                        this.undoMap.set(
                            this.undoCreateTracker.get(this.secondIndex)!,
                            [message.object.objectId],
                        );
                        this.undoCreateTracker.delete(this.secondIndex);
                    }
                    this.storedObjects.set(
                        message.object.objectId,
                        message.object,
                    );
                }
            } else if (message.entity === 'ROLL') {
                this.prevMapping.set(message.index, message.result);
            }
        });
    }

    undoLast() {
        if (this.currIndex === 0) {
            return;
        }
        this.currIndex--;
        const last = this.undoMap.get(this.currIndex)!;
        if (!last[0].action) {
            this.destroyObjects(last, true);
        } else if (last[0].action === Action.Create) {
            for (const obj of last) {
                this.createObject(obj);
            }
        } else if (last[0].action === Action.Recolour) {
            this.recolourObjects(last, new ColInst(0, 0, 0, 0), true);
        } else if (last[0].action === Action.Move) {
            this.moveObjects(last, true);
        }
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
    async createObject(newObj: ObjectCreateEvent, undo: boolean = false) {
        newObj.object.objectId = -1;
        if (!undo) {
            newObj.object.objectId = -1;
            newObj.clientId = this.localNum;
            this.undoMap.set(this.currIndex, [-1]);
            this.undoCreateTracker.set(this.secondIndex, this.currIndex);
            this.currIndex += 1;
            this.secondIndex += 1;
        }
        this.socket.send(
            JSON.stringify({
                entity: 'BADPACKAGE',
                client: this.localNum,
                data: newObj,
            }),
        );
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
    async destroyObjects(targetIds: number[], undo: boolean = false) {
        const undoPackets: ObjectCreateEvent[] = [];
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
        for (const id of targetIds) {
            if (this.storedObjects.has(id)) {
                if (!undo) {
                    undoPackets.push({
                        entity: Entity.Object,
                        action: Action.Create,
                        object: this.storedObjects.get(id)!,
                    });
                }
                this.socket.send(
                    JSON.stringify({
                        entity: 'OBJECT',
                        action: 'DESTROY',
                        objectId: id,
                    }),
                );
                this.storedObjects.delete(id);
                if (this.board) {
                    this.board.removeObject(id);
                }
            }
        }
    }

    // Receives a list of objects to move, checks each object's existence, if it exists moves it and tells the backend to move it too.
    // Questionable that it sends a packet for each object.
    async moveObjects(events: ObjectMoveEvent[], undo: boolean = false) {
        const undoPackets: ObjectMoveEvent[] = [];
        for (const event of events) {
            if (!undo) {
                undoPackets.push({
                    entity: event.entity,
                    action: event.action,
                    objectId: event.objectId,
                    x: -event.x,
                    y: -event.y,
                });
            }
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                this.board!.objectMap.get(event.objectId)!.move(
                    event.x,
                    event.y,
                );
                this.socket.send(JSON.stringify(event));
            }
        }
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
    }

    // Receives a list of objects to recolour, checks each object's existence, if it exists recolours it and tells the backend to recolour it too.
    // Questionable that it sends a packet for each object.
    recolourObjects(
        events: ObjectRecolourEvent[],
        oldCol: ColInst,
        undo: boolean = false,
    ) {
        const undoPackets: ObjectRecolourEvent[] = [];
        for (const event of events) {
            if (!undo) {
                undoPackets.push({
                    entity: event.entity,
                    action: event.action,
                    objectId: event.objectId,
                    colour: oldCol.toString(),
                });
            }
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                this.board!.objectMap.get(event.objectId)!.setColour(
                    event.colour.toString(),
                );
                this.socket.send(
                    JSON.stringify({
                        entity: event.entity,
                        action: event.action,
                        objectId: event.objectId,
                        colour: event.colour.toString(),
                    }),
                );
            }
        }
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
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
