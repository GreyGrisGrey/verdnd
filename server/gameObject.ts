import type {
    ObjectCreateEvent,
    LayerUpdateEvent,
    LaserEvent,
    RollComplete,
} from '../shared/objectEvents.ts';
import { PostGresData } from './dataMain.ts';
import { PlayerPacket } from './gamePlayerPacket.ts';
import { Action, Entity } from '../shared/objectEvents.ts';
import WebSocket from 'ws';

export class GameObject {
    objectMap: Map<number, ObjectCreateEvent>;
    layerMap: Map<number, LayerUpdateEvent>;
    diceMap: Map<number, RollComplete>;
    userMap: Map<string, PlayerPacket>;
    laserMap: Map<string, LaserEvent>;
    currCol: string;
    currObj: number;
    currLayer: number;
    currDice: number;
    laserTimer: number;
    finishedSetup: boolean;
    allGm: boolean;
    play: boolean;
    gameId: number;
    objectLock: boolean;
    layerLock: boolean;
    diceLock: boolean;
    userLock: boolean;
    dbLock: boolean;

    constructor(gameId: number) {
        this.objectMap = new Map();
        this.layerMap = new Map();
        this.diceMap = new Map();
        this.userMap = new Map();
        this.laserMap = new Map();

        this.currCol = '#444444';
        this.currObj = 0;
        this.currLayer = 0;
        this.currDice = 0;
        this.laserTimer = 0;
        this.finishedSetup = false;

        this.allGm = false;
        this.play = true;
        this.gameId = gameId;

        this.objectLock = false;
        this.layerLock = false;
        this.diceLock = false;
        this.userLock = false;
        this.dbLock = false;
    }

    addUser(newUser: string, id: string, gm: boolean, ws: WebSocket) {
        this.userMap.set(id, new PlayerPacket(newUser, id, gm, ws));
    }

    async setUp(cli: PostGresData) {
        if (!this.play) {
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        const res = await cli.getGame(this.gameId);
        if (res) {
            this.objectMap = res[0] as any;
            this.layerMap = res[1] as any;
            this.diceMap = res[2] as any;
            for (const [key, val] of this.objectMap) {
                if (val.object.objectId >= this.currObj) {
                    this.currObj = val.object.objectId + 1;
                }
            }
            for (const [key, val] of this.layerMap) {
                if (val.layer.id >= this.currLayer) {
                    this.currLayer = val.layer.id + 1;
                }
            }
            for (const [key, val] of this.diceMap) {
                if (val.id >= this.currDice) {
                    this.currDice = val.id + 1;
                }
            }
            this.currCol = res[3];
            this.finishedSetup = true;
            if (this.currLayer === 0) {
                return false;
            }
            return true;
        } else {
            await cli.constructGame('0');
            this.finishedSetup = true;
            return false;
        }
    }

    async broadcast(newMessage: string, layerId: number = -1) {
        if (newMessage) {
            this.userMap.forEach((player) => {
                if (player.ws.readyState === WebSocket.OPEN) {
                    if (
                        layerId === -1 ||
                        this.layerMap.get(layerId)!.layer.playerVisible ||
                        player.isGm
                    ) {
                        player.ws.send(newMessage!, { binary: false });
                    }
                }
            });
        }
    }

    async waitLock(lock: boolean) {
        while (lock) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    async sendMasses(targetLayer: number) {
        for (const [key, val] of this.objectMap) {
            if (val.object.layerId === targetLayer) {
                await new Promise((resolve) => setTimeout(resolve, 2));
                this.broadcast(JSON.stringify(val), val.object.layerId);
            }
        }
    }

    async sendAll(ws: WebSocket) {
        while (!this.finishedSetup) {
            await new Promise((resolve) => setTimeout(resolve, 2));
        }
        for (const [key, val] of this.layerMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(JSON.stringify(val));
        }
        for (const [key, val] of this.objectMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(JSON.stringify(val));
        }
        for (const [key, val] of this.diceMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(JSON.stringify(val));
        }
        ws.send(
            JSON.stringify({
                entity: Entity.Meta,
                action: Action.Recolour,
                newColour: this.currCol,
            }),
        );
        ws.send(JSON.stringify({ entity: Entity.Meta, action: Action.Finish }));
    }

    async sendAllLasers() {
        const currTime = Date.now();
        if (currTime - this.laserTimer < 30) {
            return;
        } else {
            this.laserTimer = currTime;
        }
        for (const [key, val] of this.laserMap) {
            if (this.laserTimer - val.time > 1000) {
                this.laserMap.delete(key);
            } else {
                this.broadcast(JSON.stringify(val));
            }
        }
    }
}
