import type {
    ObjectCreatePayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectRecolourEvent,
    LayerState,
    ServerEvent,
    DicePayload,
    LaserEvent,
    RollComplete,
} from './objectEvents.ts';
import { Board } from './boardCanvas/localBoard.ts';
import { ColInst } from './colours.ts';
import { Action, Entity } from './objectEvents.ts';

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
    rollMapping: Map<number, RollComplete>;
    socket: WebSocket;
    board: Board | null;
    lasers: Map<number, LaserEvent>;
    designal: boolean;

    constructor() {
        this.localNum = Math.round(Math.random() * 1000000) + 500;
        this.undoMap = new Map();
        this.undoCreateTracker = new Map();
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.currIndex = 0;
        this.secondIndex = 0;
        this.rollMapping = new Map();
        this.lasers = new Map();
        this.socket = new WebSocket('ws://47.55.46.138:4322/');
        this.board = null;
        this.designal = false;
        this.ping();

        this.socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            if (
                message.entity === Entity.Name &&
                message.id === this.localNum.toString()
            ) {
                console.log('yay');
            }
            if (message.entity === Entity.Layer) {
                this.storedLayers.set(message.layer.id, message.layer);
            } else if (message.entity === Entity.Object) {
                if (
                    message.action === Action.Destroy &&
                    this.storedObjects.has(message.objectId)
                ) {
                    this.storedObjects.delete(message.objectId);
                    if (this.board) {
                        this.board.removeObject(message.objectId);
                    }
                } else {
                    if (
                        message.userId === this.localNum &&
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
            } else if (message.entity === Entity.Roll) {
                this.rollMapping.set(message.id, message);
            } else if (message.entity === Entity.Laser) {
                if (message.id !== this.localNum) {
                    this.lasers.set(message.id, message);
                }
            }
        });
    }

    getLasers() {
        return this.lasers;
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

    async ping() {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        this.socket.send(
            JSON.stringify({
                userId: this.localNum,
                event: {
                    entity: Entity.Name,
                    pass: '1',
                    name: 'wuog',
                    id: this.localNum.toString(),
                },
            }),
        );
    }

    rollDice(newDice: DicePayload) {
        this.socket.send(
            this.parcelServeEvent({
                dice: newDice,
                id: 0,
                action: Action.Create,
                entity: Entity.Roll,
            }),
        );
    }

    getDice() {
        return this.rollMapping;
    }

    // Sends a packet telling the backend to create an object with those parameters.
    async createObject(newObj: ObjectCreateEvent, undo: boolean = false) {
        newObj.object.objectId = -1;
        newObj.userId = this.localNum;
        if (!undo) {
            newObj.object.objectId = -1;
            this.undoMap.set(this.currIndex, [-1]);
            this.undoCreateTracker.set(this.secondIndex, this.currIndex);
            this.currIndex += 1;
            this.secondIndex += 1;
        }
        this.socket.send(this.parcelServeEvent(newObj));
        return -1;
    }

    getObjects(): Map<number, ObjectCreatePayload> {
        return this.storedObjects;
    }

    // Tells the backend to create a layer.
    async createLayer() {
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Layer,
                action: Action.Create,
                layerId: -1,
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
                        userId: this.localNum,
                    });
                }
                this.socket.send(
                    this.parcelServeEvent({
                        entity: Entity.Object,
                        action: Action.Destroy,
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
                this.socket.send(this.parcelServeEvent(event));
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
        console.log(events);
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
                    this.parcelServeEvent({
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
        console.log(input);
        const targetObj = this.storedLayers.get(input.id);
        if (targetObj) {
            this.storedLayers.set(input.id, input);
        }
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Layer,
                action: Action.Update,
                layer: input,
            }),
        );
    }

    parcelServeEvent(payload: ServerEvent) {
        return JSON.stringify({
            userId: this.localNum.toString(),
            event: payload,
        });
    }

    sendLaser(x: number, y: number, send: boolean) {
        if (send) {
            this.socket.send(
                this.parcelServeEvent({
                    entity: Entity.Laser,
                    id: this.localNum,
                    colour: this.board!.laserCol,
                    coords: { x: x, y: y },
                    time: Date.now(),
                }),
            );
            this.designal = false;
        } else if (!this.designal) {
            this.socket.send(
                this.parcelServeEvent({
                    entity: Entity.Laser,
                    id: this.localNum,
                    colour: '#cc00cc',
                    coords: { x: 0, y: 0 },
                    time: 0,
                }),
            );
            this.designal = true;
        }
    }
}
