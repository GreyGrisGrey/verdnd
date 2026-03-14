import {
    ObjectCreateEvent,
    LayerUpdateEvent,
    RollComplete,
    Token,
    SingleRoll,
} from '../shared/objectEvents.ts';
import { Vec2 } from '../shared/coords.ts';
import { Action, Entity, Shape } from '../shared/objectEvents.ts';

export function objectTableToPayloads(rows: any[]) {
    const mapping: Map<number, ObjectCreateEvent> = new Map();
    for (const row of rows) {
        const structData: Vec2[] = row[4].split(':').map((item: string) => {
            let newItem = item.split(',');
            return { x: Number(newItem[0]), y: Number(newItem[1]) };
        });
        if (row[0] === Shape.Polyline || row[0] === Shape.Line) {
            mapping.set(row[3], {
                entity: Entity.Object,
                action: Action.Create,
                userId: 0,
                object: {
                    x: structData[0].x,
                    y: structData[0].y,
                    points: structData.splice(1),
                    colour: row[1],
                    layerId: row[2],
                    objectId: row[3],
                    kind: row[0],
                    token: {
                        name: 'na',
                        colour: '#cccccc',
                        active: false,
                        movable: false,
                    },
                },
                token: {
                    name: 'na',
                    colour: '#cccccc',
                    active: false,
                    movable: false,
                },
            });
        } else {
            mapping.set(row[3], {
                entity: Entity.Object,
                action: Action.Create,
                userId: 0,
                token: {
                    name: 'na',
                    colour: '#cccccc',
                    active: false,
                    movable: false,
                },
                object: {
                    x: structData[0].x,
                    y: structData[0].y,
                    width: structData[1].x,
                    height: structData[1].y,
                    colour: row[1],
                    layerId: row[2],
                    objectId: row[3],
                    kind: row[0],
                    token: {
                        name: 'na',
                        colour: '#cccccc',
                        active: false,
                        movable: false,
                    },
                },
            });
        }
    }
    return mapping;
}

export function layerTableToPayloads(rows: any[]) {
    const mapping: Map<number, LayerUpdateEvent> = new Map();
    for (const row of rows) {
        mapping.set(row[3], {
            entity: Entity.Layer,
            action: Action.Update,
            layer: {
                gmVisible: row[0],
                playerVisible: row[1],
                zOrder: row[2],
                id: row[3],
                name: row[6],
                x: row[4],
                y: row[5],
            },
        });
    }
    return mapping;
}

export function rollTableToPayloads(rows: any[]) {
    const mapping: Map<number, RollComplete> = new Map();
    for (const row of rows) {
        const structData: SingleRoll[] = row[3]
            .split(':')
            .map((item: string) => {
                let newItem = item.split(',');
                return {
                    result: Number(newItem[0]),
                    size: Number(newItem[1]),
                    exclude: newItem[2] === 'true',
                };
            });
        mapping.set(row[0], {
            entity: Entity.Roll,
            action: Action.Update,
            id: row[0],
            userId: row[2],
            result: { result: row[1], rolls: structData },
        });
    }
    return mapping;
}

export function tokenTableToPayloads(
    rows: any[],
    objMapping: Map<number, ObjectCreateEvent>,
) {
    for (const row of rows) {
        const currObj = objMapping.get(row[0]);
        if (currObj) {
            currObj.token = {
                name: row[1],
                colour: row[2],
                movable: row[3],
                active: row[4],
            };
            currObj.object.token = {
                name: row[1],
                colour: row[2],
                movable: row[3],
                active: row[4],
            };
        }
    }
}

export function objectPayloadToRow(payload: ObjectCreateEvent) {
    let returnString = `('${payload.object.kind}', '${payload.object.colour.toString()}', ${payload.object.layerId}, ${payload.object.objectId}, '`;
    if (
        payload.object.kind === Shape.Ellipse ||
        payload.object.kind === Shape.Rect
    ) {
        returnString += `${payload.object.x},${payload.object.y}:`;
        returnString += `${payload.object.width},${payload.object.height}')`;
    } else {
        returnString +=
            `${payload.object.x},${payload.object.y}:` +
            `${(payload.object as any).points
                .map((item: Vec2) => {
                    return `${item.x},${item.y}`;
                })
                .join(':')}')`;
    }
    return returnString;
}

export function updateObjectToRow(payload: ObjectCreateEvent) {
    return [
        payload.object.colour.toString(),
        payload.object.kind === Shape.Ellipse ||
        payload.object.kind === Shape.Rect
            ? `${payload.object.x},${payload.object.y}:${payload.object.width},${payload.object.height}`
            : `${payload.object.x},${payload.object.y}:` +
              (payload.object as any).points
                  .map((item: Vec2) => {
                      return `${item.x},${item.y}`;
                  })
                  .join(':'),
    ];
}

export function layerPayloadToRow(payload: LayerUpdateEvent) {
    let returnVal = `(${payload.layer.gmVisible}, ${payload.layer.playerVisible}, ${payload.layer.zOrder}, `;
    returnVal += `${payload.layer.id}, ${payload.layer.x}, `;
    returnVal += `${payload.layer.y}, '${payload.layer.name}')`;
    return returnVal;
}

export function updateLayerToRow(payload: LayerUpdateEvent) {
    return [
        payload.layer.gmVisible,
        payload.layer.playerVisible,
        payload.layer.zOrder,
    ];
}

export function rollPayloadToRow(payload: RollComplete) {
    let convertString = '';
    for (const roll of payload.result.rolls) {
        convertString += `${roll.result},${roll.size},${roll.exclude}`;
    }
    return `(${payload.id}, ${payload.result.result}, '${payload.userId}', '${convertString}')`;
}

export function tokenPayloadToRow(payload: Token, id: number) {
    return `(${id}, '${payload.name}', '${payload.colour}', '${payload.movable}', '${payload.active}')`;
}

export function updateTokenToRow(payload: Token) {
    return [
        payload.name,
        payload.colour,
        payload.movable.toString(),
        payload.active.toString(),
    ];
}
