import type {
    ObjectCreateEvent,
    LayerUpdateEvent,
    LaserEvent,
    RollComplete,
} from '../shared/objectEvents.ts';
import { PostGresData } from './dataMain.ts';

export class GameObject {
    objectMap: Map<number, ObjectCreateEvent>;
    layerMap: Map<number, LayerUpdateEvent>;
    diceMap: Map<number, RollComplete>;
    userMap: Map<string, boolean>;
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

    constructor(gameId: number, cli: PostGresData) {
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
        this.setUp(cli);
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
            console.log('aaa');
            return true;
        } else {
            await cli.constructGame('0');
            this.finishedSetup = true;
            return false;
        }
    }
}
