import type { ColorInstance } from 'color';

import * as BoardLayer from './boardCanvas/boardLayer.ts';
import * as BoardObject from './boardCanvas/boardObject.ts';
import type * as BoardParams from './boardCanvas/localBoard.ts';
import type { CreateObjectPayload, ServerEvent } from './objectEvents.ts';
import { Action, Entity, Shape } from './objectEvents.ts';

function payloadToBoardObject(
  p: CreateObjectPayload,
  id: number,
): BoardLayer.LayerObject {
  switch (p.kind) {
    case Shape.Circle:
      return new BoardObject.Circle(id, p.x, p.y, p.diameter, p.colour);
    case Shape.Rect:
      return new BoardObject.Rect(id, p.x, p.y, p.width, p.height, p.colour);
    case Shape.Token:
      return new BoardObject.Token(
        id,
        p.x,
        p.y,
        p.diameter,
        p.colour,
        p.name ?? '',
      );
    case Shape.Poly:
      return new BoardObject.Polyline(id, p.x, p.y, p.points, p.colour);
    case Shape.Line:
      return new BoardObject.Line(id, p.x, p.y, p.points, p.colour);
    default: {
      throw new Error('Unknown shape');
    }
  }
}

// Class that will handle interfacing with the server.
// Currently does not do much of anything besides serving as a standin.
export class ServerInterface {
  user: string;
  pass: string;
  heldItems: ServerEvent[];
  layerIDMap: Map<number, boolean>;
  objectIDMap: Map<number, boolean>;
  storedObjects: Map<number, BoardLayer.LayerObject>;
  storedLayers: Map<number, BoardLayer.BoardLayer>;
  board: BoardParams.Board;

  constructor(newBoard: BoardParams.Board) {
    this.user = 'bwagh';
    this.pass = 'password1';
    this.heldItems = [];
    this.layerIDMap = new Map();
    this.objectIDMap = new Map();
    this.board = newBoard;
    this.storedObjects = new Map();
    this.storedLayers = new Map();
  }

  private getNextLayerID(): number {
    let curr = 0;
    while (this.layerIDMap.has(curr)) curr++;
    this.layerIDMap.set(curr, true);
    return curr;
  }

  private getNextObjectID(): number {
    let curr = 0;
    while (this.objectIDMap.has(curr)) curr++;
    this.objectIDMap.set(curr, true);
    return curr;
  }

  clearQueue() {
    this.heldItems = [];
  }

  getItems(): ServerEvent[] {
    return this.heldItems;
  }

  private sendItem(newItem: ServerEvent) {
    this.heldItems.push(newItem);
  }

  handleObjEvent(event: ServerEvent) {
    if (event.entity === Entity.Layer) {
      switch (event.action) {
        case Action.Create: {
          this.board.addLayer(new BoardLayer.BoardLayer(), event.layerId);
          break;
        }
        case Action.Destroy: {
          this.board.removeLayer(event.layerId);
          break;
        }
        case Action.Remove: {
          this.board.removeObject(event.objectId, event.layerId);
          break;
        }
        case Action.Add: {
          const obj = this.storedObjects.get(event.objectId);
          if (obj) {
            this.board.addObject(event.objectId, event.layerId, obj);
          }
          break;
        }
        case Action.Move: {
          this.board.moveLayer(event.layerId, event.x, event.y);
          break;
        }
        case Action.ZOrder: {
          this.board.changeLayerZ(event.layerId, event.newZOrder);
          break;
        }
        default:
          break;
      }
    } else if (event.entity === Entity.Object) {
      switch (event.action) {
        case Action.Move: {
          const obj = this.storedObjects.get(event.objectId);
          if (obj) {
            obj.move(event.x, event.y);
          }
          break;
        }
        case Action.Create: {
          const newObj = payloadToBoardObject(event.object, event.objectId);
          this.storedObjects.set(event.objectId, newObj);
          break;
        }
        case Action.Destroy: {
          this.board.removeObject(event.objectId);
          this.storedObjects.delete(event.objectId);
          break;
        }
        case Action.Recolour: {
          const obj = this.storedObjects.get(event.objectId);
          if (obj) {
            obj.setColour(event.colour);
          }
          break;
        }
        default:
          break;
      }
    }
  }

  createLayer() {
    const layerId = this.getNextLayerID();
    this.sendItem({
      entity: Entity.Layer,
      action: Action.Create,
      layerId,
    });
  }

  destroyLayer(id: number) {
    this.sendItem({
      entity: Entity.Layer,
      action: Action.Destroy,
      layerId: id,
    });
  }

  moveLayer(id: number, x: number, y: number) {
    this.sendItem({
      entity: Entity.Layer,
      action: Action.Move,
      layerId: id,
      x,
      y,
    });
  }

  swapObjLayer(id: number, lay1: number, lay2: number) {
    this.sendItem({
      entity: Entity.Layer,
      action: Action.Remove,
      layerId: lay1,
      objectId: id,
    });
    this.sendItem({
      entity: Entity.Layer,
      action: Action.Add,
      layerId: lay2,
      objectId: id,
    });
  }

  moveObj(id: number, x: number, y: number) {
    this.sendItem({
      entity: Entity.Object,
      action: Action.Move,
      objectId: id,
      x,
      y,
    });
  }

  createObj(payload: CreateObjectPayload, targetLayer: number) {
    const objectId = this.getNextObjectID();
    this.sendItem({
      entity: Entity.Object,
      action: Action.Create,
      objectId,
      object: payload,
    });
    this.sendItem({
      entity: Entity.Layer,
      action: Action.Add,
      layerId: targetLayer,
      objectId,
    });
  }

  destroyObj(id: number) {
    this.sendItem({
      entity: Entity.Object,
      action: Action.Destroy,
      objectId: id,
    });
  }

  changeObjColour(id: number, newColour: ColorInstance) {
    this.sendItem({
      entity: Entity.Object,
      action: Action.Recolour,
      objectId: id,
      colour: newColour,
    });
  }

  flipZOrder(
    layer1Id: number,
    layer1Z: number,
    layer2Id: number,
    layer2Z: number,
  ) {
    this.sendItem({
      entity: Entity.Layer,
      action: Action.ZOrder,
      layerId: layer1Id,
      newZOrder: layer2Z,
    });
    this.sendItem({
      entity: Entity.Layer,
      action: Action.ZOrder,
      layerId: layer2Id,
      newZOrder: layer1Z,
    });
  }
}
