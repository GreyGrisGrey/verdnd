import type { Vec2 } from './coords.ts';

// Just a bunch of enums and interfaces used by other files.

export interface DicePayload {
    diceSize: number;
    diceCount: number;
    advantage: boolean;
    disadvantage: boolean;
    modifier: number;
    result: number;
}

export interface NewDicePayload {
    toRoll: DiceIndividual[];
    modifier: number;
    result: number;
}

export interface DiceIndividual {
    diceSize: number;
    diceCount: number;
    dropLow: number;
    dropHigh: number;
}

export interface Token {
    name: string;
    colour: string;
    movable: boolean;
    active: boolean;
}

export interface ObjectParams {
    ellipse: boolean;
    fill: boolean;
    close: boolean;
    rect?: boolean;
}

export enum Handler {
    Game = 'GAME',
    Meta = 'META',
}

export enum Entity {
    Layer = 'LAYER',
    Object = 'OBJECT',
    Roll = 'ROLL',
    Name = 'NAME',
    Laser = 'LASER',
    Token = 'TOKEN',
    Meta = 'META',
    User = 'USER',
}

export enum Action {
    Create = 'CREATE',
    Destroy = 'DESTROY',
    Move = 'MOVE',
    Add = 'ADD',
    Remove = 'REMOVE',
    Recolour = 'RECOLOUR',
    ZOrder = 'ZORDER',
    Update = 'UPDATE',
    Rename = 'RENAME',
    Finish = 'FINISH',
    Enumerate = 'ENUMERATE',
    Relayer = 'RELAYER',
    Image = 'IMAGE',
}

export interface ObjectImageEvent {
    entity: Entity.Object;
    action: Action.Image;
    image: boolean;
    id: number;
}

export interface BoardImageEvent {
    entity: Entity.Meta;
    action: Action.Image;
    image: boolean;
}

export interface LayerState {
    gmVisible: boolean;
    playerVisible: boolean;
    zOrder: number;
    id: number;
    name: string;
    x: number;
    y: number;
    element?: HTMLElement;
}

export interface ObjectCreatePayload {
    params: ObjectParams;
    points: Vec2[];
    colour: string;
    layerId: number;
    objectId: number;
    token: Token;
    image: boolean;
}

export interface LayerCreateEvent {
    entity: Entity.Layer;
    action: Action.Create;
    layerId: number;
}

export interface LayerDestroyEvent {
    entity: Entity.Layer;
    action: Action.Destroy;
    layerId: number;
}

export interface LayerUpdateEvent {
    entity: Entity.Layer;
    action: Action.Update;
    layer: LayerState;
}

export interface ObjectCreateEvent {
    entity: Entity.Object;
    action: Action.Create;
    object: ObjectCreatePayload;
    token: Token;
    userId: string;
}

export interface ObjectMoveEvent {
    entity: Entity.Object;
    action: Action.Move;
    objectId: number;
    x: number;
    y: number;
}

export interface ObjectDestroyEvent {
    entity: Entity.Object;
    action: Action.Destroy;
    objectId: number;
}

export interface ObjectRecolourEvent {
    entity: Entity.Object;
    action: Action.Recolour;
    objectId: number;
    colour: string;
    oldCol?: string;
}

export interface ObjectRelayerEvent {
    entity: Entity.Object;
    action: Action.Relayer;
    objectId: number;
    layerId: number;
}

export interface RollEvent {
    entity: Entity.Roll;
    action: Action.Create;
    id: number;
    diceOld: DicePayload;
    userId: string;
    userName: string;
}

export interface RollEventNew {
    entity: Entity.Roll;
    action: Action.Create;
    id: number;
    dice: NewDicePayload;
    userId: string;
    userName: string;
}

export interface SingleRoll {
    result: number;
    size: number;
    exclude: boolean;
}

export interface RollComplete {
    entity: Entity.Roll;
    action: Action.Update;
    id: number;
    result: RollResult;
    userId: string;
    userName: string;
}

export interface RollResult {
    result: number;
    rolls: SingleRoll[];
}

export interface ServerPacket {
    userId: string;
    event: ServerEvent;
    gameId: number;
    handler: Handler;
}

export interface LaserEvent {
    entity: Entity.Laser;
    id: string;
    colour: string;
    time: number;
    coords: Vec2;
}

export interface NameEvent {
    entity: Entity.Name;
    pass: string;
    name: string;
    id: string;
}

export interface GameConnectEvent {
    entity: Entity.Name;
    action: Action.Update;
    name: string;
    id: string;
}

export interface NameCheckedEvent {
    entity: Entity.Name;
    id: string;
    accepted: boolean;
    gm: boolean;
}

export interface UpdateTokenEvent {
    entity: Entity.Token;
    id: number;
    token: Token;
}

export interface GameNameEvent {
    entity: Entity.Meta;
    action: Action.Rename;
    newName: string;
}

export interface FinishTransmissionEvent {
    entity: Entity.Meta;
    action: Action.Finish;
}

export interface BackgroundColourEvent {
    entity: Entity.Meta;
    action: Action.Recolour;
    newColour: string;
}

export interface ConstructGameEvent {
    entity: Entity.Meta;
    action: Action.Create;
}

export interface GameListEvent {
    entity: Entity.Meta;
    action: Action.Enumerate;
}

export interface GameListResultEvent {
    entity: Entity.Meta;
    action: Action.Enumerate;
    list: Number[];
}

export interface UserStatusUpdateEvent {
    entity: Entity.User;
    action: Action.Update;
    name: string;
    id: string;
    gm: boolean;
}

export interface UserRemoveEvent {
    entity: Entity.User;
    action: Action.Remove;
    id: string;
}

export type ServerEvent =
    | LayerCreateEvent
    | LayerDestroyEvent
    | LayerUpdateEvent
    | ObjectCreateEvent
    | ObjectDestroyEvent
    | ObjectMoveEvent
    | ObjectRecolourEvent
    | RollEvent
    | LaserEvent
    | NameEvent
    | UpdateTokenEvent
    | ObjectRelayerEvent
    | BackgroundColourEvent
    | BoardImageEvent
    | ObjectImageEvent
    | RollEventNew;
