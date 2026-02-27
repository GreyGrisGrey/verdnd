import {
    BatchGetCommand,
    BatchWriteCommand,
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
    CreateObjectPayload,
    ObjectChangeEvent,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectRecolourEvent,
} from '../scripts/objectEvents.ts';
import { Action, Entity, Shape } from '../scripts/objectEvents.ts';
import type { LayerState } from '../scripts/rightBar/layerBarMenu.ts';
import { ddb, LAYERS_TABLE, META_TABLE, OBJECTS_TABLE } from './dynamo.ts';

const META_KEY = 'counters';

function comparePayloads(
    serveObj: CreateObjectPayload,
    cliObj: CreateObjectPayload,
): boolean {
    if (serveObj.kind !== cliObj.kind) return false;
    if (
        serveObj.x !== cliObj.x ||
        serveObj.y !== cliObj.y ||
        serveObj.colour !== cliObj.colour ||
        serveObj.layerId !== cliObj.layerId
    ) {
        return false;
    }
    return true;
}

function itemToPayload(item: Record<string, unknown>): CreateObjectPayload {
    const base = {
        objectId: item.objectId as number,
        x: item.x as number,
        y: item.y as number,
        colour: item.colour as string,
        layerId: item.layerId as number,
    };
    switch (item.kind as Shape) {
        case Shape.Rect:
            return {
                ...base,
                kind: Shape.Rect,
                width: item.width as number,
                height: item.height as number,
            };
        case Shape.Circle:
            return { ...base, kind: Shape.Circle, diameter: item.diameter as number };
        case Shape.Token:
            return {
                ...base,
                kind: Shape.Token,
                diameter: item.diameter as number,
                name: (item.name as string) ?? '',
            };
        case Shape.Poly:
            return {
                ...base,
                kind: Shape.Poly,
                points: (item.points as { x: number; y: number }[]) ?? [],
            };
        case Shape.Line:
            return {
                ...base,
                kind: Shape.Line,
                points: (item.points as { x: number; y: number }[]) ?? [],
            };
        default:
            throw new Error(`Unknown shape kind: ${item.kind}`);
    }
}

function payloadToItem(payload: CreateObjectPayload): Record<string, unknown> {
    const base: Record<string, unknown> = {
        objectId: payload.objectId,
        kind: payload.kind,
        x: payload.x,
        y: payload.y,
        colour: payload.colour,
        layerId: payload.layerId,
    };
    switch (payload.kind) {
        case Shape.Rect:
            base.width = payload.width;
            base.height = payload.height;
            break;
        case Shape.Circle:
            base.diameter = payload.diameter;
            break;
        case Shape.Token:
            base.diameter = payload.diameter;
            base.name = payload.name;
            break;
        case Shape.Poly:
        case Shape.Line:
            base.points = payload.points;
            break;
    }
    return base;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

export class StoredBoard {
    async createObject(newObj: ObjectCreateEvent): Promise<number> {
        const metaRes = await ddb.send(
            new UpdateCommand({
                TableName: META_TABLE,
                Key: { key: META_KEY },
                UpdateExpression: 'ADD nextObjectId :one',
                ExpressionAttributeValues: { ':one': 1 },
                ReturnValues: 'UPDATED_NEW',
            }),
        );
        const objectId = (metaRes.Attributes!.nextObjectId as number) - 1;
        newObj.object.objectId = objectId;

        await ddb.send(
            new PutCommand({
                TableName: OBJECTS_TABLE,
                Item: payloadToItem(newObj.object),
            }),
        );

        // Best-effort recent buffer — race conditions here are acceptable since
        // checkIds provides the authoritative sync on every cycle.
        this.addToRecent(newObj.object).catch(() => {});

        return objectId;
    }

    private async addToRecent(payload: CreateObjectPayload): Promise<void> {
        const metaRes = await ddb.send(
            new GetCommand({ TableName: META_TABLE, Key: { key: META_KEY } }),
        );
        const recent: CreateObjectPayload[] =
            (metaRes.Item?.recentCreation as CreateObjectPayload[]) ?? [];
        recent.push(payload);
        if (recent.length > 3) recent.splice(0, recent.length - 3);
        await ddb.send(
            new UpdateCommand({
                TableName: META_TABLE,
                Key: { key: META_KEY },
                UpdateExpression: 'SET recentCreation = :r',
                ExpressionAttributeValues: { ':r': recent },
            }),
        );
    }

    async getObjects(): Promise<Map<number, ObjectCreateEvent>> {
        const res = await ddb.send(new ScanCommand({ TableName: OBJECTS_TABLE }));
        const map = new Map<number, ObjectCreateEvent>();
        for (const item of res.Items ?? []) {
            const payload = itemToPayload(item as Record<string, unknown>);
            map.set(payload.objectId!, {
                entity: Entity.Object,
                action: Action.Create,
                object: payload,
            });
        }
        return map;
    }

    async getNewObjects(): Promise<CreateObjectPayload[]> {
        const res = await ddb.send(
            new GetCommand({ TableName: META_TABLE, Key: { key: META_KEY } }),
        );
        return (res.Item?.recentCreation as CreateObjectPayload[]) ?? [];
    }

    async createLayer(): Promise<number> {
        const metaRes = await ddb.send(
            new UpdateCommand({
                TableName: META_TABLE,
                Key: { key: META_KEY },
                UpdateExpression: 'ADD nextLayerId :one',
                ExpressionAttributeValues: { ':one': 1 },
                ReturnValues: 'UPDATED_NEW',
            }),
        );
        const layerId = (metaRes.Attributes!.nextLayerId as number) - 1;
        await ddb.send(
            new PutCommand({
                TableName: LAYERS_TABLE,
                Item: {
                    layerId,
                    gmVisible: true,
                    playerVisible: true,
                    zOrder: layerId,
                },
            }),
        );
        return layerId;
    }

    async getLayers(): Promise<Map<number, LayerState>> {
        const res = await ddb.send(new ScanCommand({ TableName: LAYERS_TABLE }));
        const map = new Map<number, LayerState>();
        for (const item of res.Items ?? []) {
            const layer: LayerState = {
                id: item.layerId as number,
                gmVisible: item.gmVisible as boolean,
                playerVisible: item.playerVisible as boolean,
                zOrder: item.zOrder as number,
            };
            map.set(layer.id, layer);
        }
        return map;
    }

    async destroyObjects(targetIds: number[]): Promise<void> {
        if (targetIds.length === 0) return;
        for (const chunk of chunkArray(targetIds, 25)) {
            await ddb.send(
                new BatchWriteCommand({
                    RequestItems: {
                        [OBJECTS_TABLE]: chunk.map((id) => ({
                            DeleteRequest: { Key: { objectId: id } },
                        })),
                    },
                }),
            );
        }
    }

    async moveObjects(events: ObjectMoveEvent[]): Promise<void> {
        await Promise.all(
            events.map((event) =>
                ddb.send(
                    new UpdateCommand({
                        TableName: OBJECTS_TABLE,
                        Key: { objectId: event.objectId },
                        UpdateExpression: 'ADD x :dx, y :dy',
                        ExpressionAttributeValues: { ':dx': event.x, ':dy': event.y },
                    }),
                ),
            ),
        );
    }

    async recolourObjects(events: ObjectRecolourEvent[]): Promise<void> {
        await Promise.all(
            events.map((event) =>
                ddb.send(
                    new UpdateCommand({
                        TableName: OBJECTS_TABLE,
                        Key: { objectId: event.objectId },
                        UpdateExpression: 'SET colour = :c',
                        ExpressionAttributeValues: { ':c': event.colour },
                    }),
                ),
            ),
        );
    }

    async compareObjects(clientObjs: CreateObjectPayload[]): Promise<ObjectChangeEvent[]> {
        if (clientObjs.length === 0) return [];

        const serverItems = new Map<number, Record<string, unknown>>();
        for (const chunk of chunkArray(clientObjs, 100)) {
            const res = await ddb.send(
                new BatchGetCommand({
                    RequestItems: {
                        [OBJECTS_TABLE]: {
                            Keys: chunk.map((obj) => ({ objectId: obj.objectId! })),
                        },
                    },
                }),
            );
            for (const item of res.Responses?.[OBJECTS_TABLE] ?? []) {
                serverItems.set(item.objectId as number, item as Record<string, unknown>);
            }
        }

        const result: ObjectChangeEvent[] = [];
        for (const clientObj of clientObjs) {
            const serverItem = serverItems.get(clientObj.objectId!);
            if (!serverItem) {
                result.push({
                    entity: Entity.Object,
                    action: Action.Destroy,
                    objectId: clientObj.objectId!,
                });
            } else {
                const serverPayload = itemToPayload(serverItem);
                if (!comparePayloads(serverPayload, clientObj)) {
                    result.push({
                        entity: Entity.Object,
                        action: Action.Create,
                        object: serverPayload,
                    });
                }
            }
        }
        return result;
    }

    async updateLayer(input: LayerState): Promise<void> {
        await ddb.send(
            new PutCommand({
                TableName: LAYERS_TABLE,
                Item: {
                    layerId: input.id,
                    gmVisible: input.gmVisible,
                    playerVisible: input.playerVisible,
                    zOrder: input.zOrder,
                },
                ConditionExpression: 'attribute_exists(layerId)',
            }),
        );
    }
}
