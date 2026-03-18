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
    Token,
} from '../shared/objectEvents.ts';
import { Board } from './boardCanvas/localBoard.ts';
import { ColInst } from '../shared/colours.ts';
import { Action, Entity, Shape } from '../shared/objectEvents.ts';
import { BoardObject } from './boardCanvas/boardObject.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { Box, Polyline } from './boardCanvas/boardObject.ts';
import { LayerMenu } from './rightBar/layerBarMenu.ts';
import { RollMenu } from './rightBar/rollBarMenu.ts';

function payloadToBoardObject(p: ObjectCreatePayload): BoardObject {
    switch (p.kind) {
        case Shape.Ellipse:
        case Shape.Rect:
            return new Box(
                p.objectId,
                p.x,
                p.y,
                p.width,
                p.height,
                p.colour,
                p.kind,
            );
        case Shape.Line:
        case Shape.Polyline:
            return new Polyline(
                p.objectId,
                p.x,
                p.y,
                p.points,
                p.colour,
                p.kind,
            );
        default: {
            throw new Error('Unknown shape');
        }
    }
}

// Main interface with the server.
// Will it stick around in the long run? I do not know.
export class tempStore {
    localNum: number;
    undoMap: Map<number, any>;
    undoCreateTracker: Map<number, number>;
    storedObjects: Map<number, BoardObject>;
    storedObjectPayloads: Map<number, ObjectCreatePayload>;
    storedLayerStates: Map<number, LayerState>;
    storedLayers: Map<number, BoardLayer>;
    currIndex: number;
    secondIndex: number;
    rollMapping: Map<number, RollComplete>;
    socket: WebSocket | null;
    board: Board | null;
    lasers: Map<number, LaserEvent>;
    designal: boolean;
    online: boolean;
    layMenu: LayerMenu | null;
    rollMenu: RollMenu | null;
    isGm: boolean;
    id: string;
    pass: string;
    name: string;

    constructor(
        newObjects: Map<number, BoardObject>,
        newLayers: Map<number, BoardLayer>,
        newStates: Map<number, LayerState>,
    ) {
        this.localNum = Math.round(Math.random() * 1000000) + 500;
        this.undoMap = new Map();
        this.undoCreateTracker = new Map();
        this.storedObjects = newObjects;
        this.storedObjectPayloads = new Map();
        this.storedLayerStates = newStates;
        this.storedLayers = newLayers;
        this.currIndex = 0;
        this.secondIndex = 0;
        this.rollMapping = new Map();
        this.lasers = new Map();
        this.board = null;
        this.designal = false;
        this.online = true;
        this.layMenu = null;
        this.rollMenu = null;
        this.isGm = false;

        this.id = '';
        this.pass = '';
        this.name = '';

        if (this.online) {
            this.socket = new WebSocket('ws://47.55.46.138:4322/');
            this.socket.addEventListener('message', (event) => {
                const message = JSON.parse(event.data);
                if (message.entity === Entity.Name && message.accepted) {
                    this.id = message.id;
                    this.isGm = message.gm;
                    console.log('yay');
                } else if (message.entity === Entity.Name) {
                    console.log('boo');
                    alert('failed to log in');
                }
                if (message.entity === Entity.Layer) {
                    if (message.action === Action.Destroy) {
                        if (this.storedLayers.has(message.layerId)) {
                            this.layMenu!.destroyLayerElement(message.layerId);
                            this.storedLayers.delete(message.layerId);
                        }
                    } else if (this.storedLayerStates.has(message.layer.id)) {
                        this.layMenu!.updateLayer(
                            message.layer.id,
                            message.layer,
                        );
                        this.storedLayers
                            .get(message.layer.id)!
                            .updateFromLayerState(message.layer);
                    } else {
                        this.createLayerLocal(message.layer);
                    }
                } else if (message.entity === Entity.Object) {
                    if (
                        message.action === Action.Destroy &&
                        this.storedObjectPayloads.has(message.objectId)
                    ) {
                        this.storedObjectPayloads.delete(message.objectId);
                        if (this.board) {
                            this.board.removeObject(message.objectId);
                        }
                    } else if (message.action !== Action.Destroy) {
                        if (
                            message.userId === this.id &&
                            !this.storedObjectPayloads.has(
                                message.object.objectId,
                            )
                        ) {
                            this.secondIndex--;
                            this.undoMap.set(
                                this.undoCreateTracker.get(this.secondIndex)!,
                                [message.object.objectId],
                            );
                            this.undoCreateTracker.delete(this.secondIndex);
                        }
                        this.storedObjectPayloads.set(
                            message.object.objectId,
                            message.object,
                        );
                        this.createObjectLocal(message);
                    }
                } else if (message.entity === Entity.Roll) {
                    console.log('arrival');
                    this.rollMapping.set(message.id, message);
                } else if (message.entity === Entity.Laser) {
                    if (message.id !== this.localNum) {
                        this.lasers.set(message.id, message);
                    }
                } else if (message.entity === Entity.Token) {
                    const currObj = this.storedObjectPayloads.get(message.id);
                    if (currObj) {
                        currObj.token = message.token;
                        this.storedObjects
                            .get(message.id)!
                            .updateToken(message.token);
                    }
                }
            });
            this.ping();
        } else {
            this.socket = null;
        }
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

    setMan(newMan: LayerMenu) {
        this.layMenu = newMan;
    }

    setup() {
        if (!this.online) {
            this.createLayer();
        } else {
            this.ping();
        }
    }

    async ping() {
        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log(this.socket);
        this.socket!.send(
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

    async signIn(name: string, pass: string, id: string) {
        this.socket!.send(
            JSON.stringify({
                userId: this.localNum,
                event: {
                    entity: Entity.Name,
                    pass: pass,
                    name: name,
                    id: id,
                },
            }),
        );
    }

    rollDice(newDice: DicePayload) {
        if (this.online) {
            this.socket!.send(
                this.parcelServeEvent({
                    dice: newDice,
                    id: 0,
                    action: Action.Create,
                    entity: Entity.Roll,
                    userId: this.id,
                }),
            );
        }
    }

    getDice() {
        return this.rollMapping;
    }

    // Sends a packet telling the backend to create an object with those parameters.
    async createObject(newObj: ObjectCreateEvent, undo: boolean = false) {
        if (!this.isGm) {
            return;
        }
        newObj.object.objectId = -1;
        newObj.userId = this.id;
        if (!undo) {
            newObj.object.objectId = -1;
            this.undoMap.set(this.currIndex, [-1]);
            this.undoCreateTracker.set(this.secondIndex, this.currIndex);
            this.currIndex += 1;
            this.secondIndex += 1;
        }
        if (this.online) {
            this.socket!.send(this.parcelServeEvent(newObj));
        } else {
            this.createObjectLocal(newObj);
        }
        return -1;
    }

    createObjectLocal(newObj: ObjectCreateEvent) {
        if (!this.online) {
            newObj.object.objectId = this.storedObjects.size;
        }
        if (this.storedObjects.has(newObj.object.objectId)) {
            this.storedObjects
                .get(newObj.object.objectId)!
                .updateFromPayload(newObj.object);
            return;
        }
        const finalObj = payloadToBoardObject(newObj.object);
        finalObj.updateToken(newObj.token);
        this.storedObjects.set(newObj.object.objectId, finalObj);
        const layer = this.storedLayers.get(newObj.object.layerId);
        if (layer) {
            layer.addObject(finalObj, finalObj.objectId);
        }
    }

    updateToken(newToken: Token, newId: number) {
        if (!this.isGm) {
            return;
        }
        if (this.online) {
            this.socket!.send(
                this.parcelServeEvent({
                    entity: Entity.Token,
                    token: newToken,
                    id: newId,
                }),
            );
        }
    }

    // Tells the backend to create a layer.
    async createLayer() {
        if (!this.isGm) {
            return;
        }
        if (this.online) {
            this.socket!.send(
                this.parcelServeEvent({
                    entity: Entity.Layer,
                    action: Action.Create,
                    layerId: -1,
                }),
            );
        }
    }

    createLayerLocal(layerPacket: LayerState) {
        const newLayer = new BoardLayer(layerPacket.id, true, true);
        newLayer.updateFromLayerState(layerPacket);
        this.storedLayers.set(layerPacket.id, newLayer);
        this.layMenu!.constructLayer(layerPacket);
        this.board!.boardLayers.push(newLayer);
        this.board!.sortLayers();
    }

    // Tells the backend to destroy a bunch of objects.
    async destroyObjects(targetIds: number[], undo: boolean = false) {
        if (!this.isGm) {
            return;
        }
        const undoPackets: ObjectCreateEvent[] = [];
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
        for (const id of targetIds) {
            if (this.storedObjectPayloads.has(id)) {
                if (!undo) {
                    undoPackets.push({
                        entity: Entity.Object,
                        action: Action.Create,
                        object: this.storedObjectPayloads.get(id)!,
                        userId: this.id,
                        token: this.storedObjectPayloads.get(id)!.token,
                    });
                }
                if (this.online) {
                    this.socket!.send(
                        this.parcelServeEvent({
                            entity: Entity.Object,
                            action: Action.Destroy,
                            objectId: id,
                        }),
                    );
                }
                this.storedObjectPayloads.delete(id);
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
            const targetObj = this.storedObjectPayloads.get(event.objectId);
            if (targetObj && (this.isGm || targetObj.token.active)) {
                this.storedObjects.get(event.objectId)!.move(event.x, event.y);
                if (this.online) {
                    this.socket!.send(this.parcelServeEvent(event));
                }
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
        if (!this.isGm) {
            return;
        }
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
            const targetObj = this.storedObjectPayloads.get(event.objectId);
            if (targetObj) {
                this.storedObjects
                    .get(event.objectId)!
                    .setColour(event.colour.toString());
                if (this.online) {
                    this.socket!.send(
                        this.parcelServeEvent({
                            entity: event.entity,
                            action: event.action,
                            objectId: event.objectId,
                            colour: event.colour.toString(),
                        }),
                    );
                }
            }
        }
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
    }

    async updateLayer(input: LayerState) {
        if (!this.isGm) {
            return;
        }
        const targetObj = this.storedLayerStates.get(input.id);
        if (targetObj) {
            this.storedLayers.get(input.id)!.updateFromLayerState(input);
        }
        if (this.online) {
            this.socket!.send(
                this.parcelServeEvent({
                    entity: Entity.Layer,
                    action: Action.Update,
                    layer: input,
                }),
            );
        }
    }

    async destroyLayer(input: LayerState) {
        if (!this.isGm) {
            return;
        }
        if (this.online) {
            this.board!.clearLayer(input.id);
            this.socket!.send(
                this.parcelServeEvent({
                    entity: Entity.Layer,
                    action: Action.Destroy,
                    layerId: input.id,
                }),
            );
        }
    }

    parcelServeEvent(payload: ServerEvent) {
        return JSON.stringify({
            userId: this.id,
            event: payload,
        });
    }

    sendLaser(x: number, y: number, send: boolean) {
        if (send && this.online) {
            this.socket!.send(
                this.parcelServeEvent({
                    entity: Entity.Laser,
                    id: this.localNum,
                    colour: this.board!.laserCol,
                    coords: { x: x, y: y },
                    time: Date.now(),
                }),
            );
            this.designal = false;
        } else if (!this.designal && this.online) {
            this.socket!.send(
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
