import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
});

export const ddb = DynamoDBDocumentClient.from(client);

export const OBJECTS_TABLE = process.env.OBJECTS_TABLE ?? 'board-objects';
export const LAYERS_TABLE = process.env.LAYERS_TABLE ?? 'board-layers';
export const META_TABLE = process.env.META_TABLE ?? 'board-meta';
export const DICE_TABLE = process.env.DICE_TABLE ?? 'board-dice';
