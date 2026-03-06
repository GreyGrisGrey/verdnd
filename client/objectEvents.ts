import type { ColInst } from './colours.ts';
import type { Vec2 } from './boardCanvas/coords.ts';

export enum Shape {
    Rect = 'RECT',
    Circle = 'CIRCLE',
    Polyline = 'POLYLINE',
    Line = 'LINE',
    Token = 'TOKEN',
}

export enum Entity {
    Layer = 'LAYER',
    Object = 'OBJECT',
}

export enum Action {
    Create = 'CREATE',
    Destroy = 'DESTROY',
    Move = 'MOVE',
    Add = 'ADD',
    Remove = 'REMOVE',
    Recolour = 'RECOLOUR',
    ZOrder = 'ZORDER',
}

export interface LayerState {
    gmVisible: boolean;
    playerVisible: boolean;
    zOrder: number;
    id: number;
    element?: HTMLElement;
}

export interface RectCreatePayload {
    kind: Shape.Rect;
    x: number;
    y: number;
    width: number;
    height: number;
    colour: ColInst | string;
    layerId: number;
    objectId: number;
}

export interface CircleCreatePayload {
    kind: Shape.Circle;
    x: number;
    y: number;
    diameter: number;
    colour: ColInst | string;
    layerId: number;
    objectId: number;
}

export interface TokenCreatePayload {
    kind: Shape.Token;
    x: number;
    y: number;
    diameter: number;
    colour: ColInst | string;
    name: string;
    layerId: number;
    objectId: number;
}

export interface PolyCreatePayload {
    kind: Shape.Polyline | Shape.Line;
    x: number;
    y: number;
    points: Vec2[];
    colour: ColInst | string;
    layerId: number;
    objectId: number;
}

export type ObjectCreatePayload =
    | CircleCreatePayload
    | PolyCreatePayload
    | RectCreatePayload
    | TokenCreatePayload;

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

export interface LayerMoveEvent {
    entity: Entity.Layer;
    action: Action.Move;
    layerId: number;
    x: number;
    y: number;
}

export interface LayerAddObjectEvent {
    entity: Entity.Layer;
    action: Action.Add;
    layerId: number;
    objectId: number;
}

export interface LayerRemoveObjectEvent {
    entity: Entity.Layer;
    action: Action.Remove;
    layerId: number;
    objectId: number;
}

export interface ObjectCreateEvent {
    entity: Entity.Object;
    action: Action.Create;
    object: ObjectCreatePayload;
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
    colour: ColInst;
}

export interface LayerZOrderEvent {
    entity: Entity.Layer;
    action: Action.ZOrder;
    layerId: number;
    newZOrder: number;
}

export type ServerEvent =
    | LayerAddObjectEvent
    | LayerCreateEvent
    | LayerDestroyEvent
    | LayerMoveEvent
    | LayerRemoveObjectEvent
    | ObjectCreateEvent
    | ObjectDestroyEvent
    | ObjectMoveEvent
    | ObjectRecolourEvent
    | LayerZOrderEvent;

export type ObjectChangeEvent = ObjectCreateEvent | ObjectDestroyEvent;
