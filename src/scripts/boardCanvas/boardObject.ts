import type { ColorInstance } from 'color';

import type { Vec2 } from './coords.ts';
import { BLACK, GOLD, GRAY, GRAY_LIGHT } from '../colors.ts';

export enum ObjType {
  Token = 'Token',
  Rect = 'Rect',
  Circle = 'Circle',
  Polyline = 'Polyline',
  Line = 'Line',
  Any = 'Any',
}

// General purpose superclass for any shape that appears on the board.
// Includes tokens, rectangles, polylines.
// Future plans to include more specific subclasses
export class BoardObject {
  ID: number;
  zOrder: number;
  location: Vec2;
  colour: ColorInstance;
  hasImage: boolean;
  imagePath: string;
  centerPoint: Vec2;
  selected: boolean;

  constructor(id: number, x: number, y: number, colour: ColorInstance) {
    this.ID = id;
    this.zOrder = 0;
    this.location = { x, y };
    this.colour = colour;
    this.hasImage = false;
    this.imagePath = '';
    this.centerPoint = { x: 0, y: 0 };
    this.selected = false;
  }

  // Moves the object a set amount
  move(xChange: number, yChange: number) {
    this.location.x += xChange;
    this.location.y += yChange;
    this.setCenter();
    return this.location;
  }

  setColour(newColour: ColorInstance) {
    this.colour = newColour;
  }

  setZOrder(newOrder: number) {
    this.zOrder = newOrder;
  }

  // Checks if the center of the object is contained within a given rectangle.
  // Used for selection of board objects.
  isCenterInsideRect(point1: Vec2, point2: Vec2) {
    if (
      this.centerPoint.x >= point1.x &&
      this.centerPoint.x <= point2.x &&
      this.centerPoint.y >= point1.y &&
      this.centerPoint.y <= point2.y
    ) {
      return true;
    }
    return false;
  }

  // Function to set the center point of the object.
  setCenter() {
    this.centerPoint = { x: 0, y: 0 };
  }

  setSelected(newSelection: boolean) {
    this.selected = newSelection;
  }
}

// Subclass for token objects.
export class Token extends BoardObject {
  owner: string;
  diameter: number;
  name: string;
  objType: ObjType;

  constructor(
    id: number,
    x: number,
    y: number,
    diam: number,
    colour: ColorInstance,
    name: string = '',
    owner: string = '',
  ) {
    super(id, x, y, colour);
    this.owner = owner;
    this.diameter = diam;
    this.name = name;
    this.objType = ObjType.Token;
    this.setCenter();
  }

  draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    const coords: Vec2 = {
      x:
        this.location.x * squareSize +
        offset.x +
        (squareSize * this.diameter) / 2,
      y:
        this.location.y * squareSize +
        offset.y +
        (squareSize * this.diameter) / 2,
    };
    ctx.beginPath();
    ctx.arc(
      coords.x,
      coords.y,
      (this.diameter * squareSize) / 2,
      0,
      2 * Math.PI,
      false,
    );
    ctx.fillStyle = this.selected ? GOLD.toString() : GRAY.toString();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      coords.x,
      coords.y,
      (this.diameter * squareSize) / 2 - 2,
      0,
      2 * Math.PI,
      false,
    );
    ctx.fillStyle = this.colour.toString();
    ctx.fill();
    ctx.closePath();
  }

  drawLabel(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    ctx.font = '20px serif';
    ctx.fillStyle = GRAY_LIGHT.toString();
    ctx.textAlign = 'center';
    const textSize = ctx.measureText(this.name).width;
    ctx.fillRect(
      this.location.x * squareSize +
        offset.x +
        (squareSize * this.diameter) / 2 -
        textSize / 2 -
        5,
      this.location.y * squareSize + offset.y - 35,
      textSize + 10,
      25,
    );
    ctx.fillStyle = BLACK.toString();
    ctx.fillText(
      this.name,
      this.location.x * squareSize +
        offset.x +
        (squareSize * this.diameter) / 2,
      this.location.y * squareSize + offset.y - 20,
    );
  }

  isPointInside(point: Vec2) {
    const adj = Math.abs(this.location.x + this.diameter / 2 - point.x - 0.5);
    const opp = Math.abs(this.location.y + this.diameter / 2 - point.y - 0.5);
    const distance = Math.sqrt(adj * adj + opp * opp);
    if (distance <= this.diameter / 2) {
      return true;
    }
    return false;
  }

  setCenter() {
    this.centerPoint = {
      x: this.location.x + this.diameter / 2,
      y: this.location.y + this.diameter / 2,
    };
  }
}

// Subclass for rectangle objects.
export class Rect extends BoardObject {
  size: Vec2;
  objType: ObjType;

  constructor(
    id: number,
    x: number,
    y: number,
    xSize: number,
    ySize: number,
    colour: ColorInstance,
  ) {
    super(id, x, y, colour);
    this.size = { x: xSize, y: ySize };
    this.objType = ObjType.Rect;
    this.setCenter();
  }

  draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    if (this.selected) {
      this.drawOutline(ctx, squareSize, offset);
    }
    ctx.fillStyle = this.colour.toString();
    ctx.fillRect(
      this.location.x * squareSize + offset.x,
      this.location.y * squareSize + offset.y,
      this.size.x * squareSize,
      this.size.y * squareSize,
    );
  }

  drawOutline(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    ctx.fillStyle = GOLD.toString();
    ctx.fillRect(
      this.location.x * squareSize + offset.x - 2,
      this.location.y * squareSize + offset.y - 2,
      this.size.x * squareSize + 4,
      this.size.y * squareSize + 4,
    );
  }

  isPointInside(point: Vec2) {
    if (
      point.x + 0.5 >= this.location.x &&
      point.y + 0.5 >= this.location.y &&
      point.x + 0.5 <= this.location.x + this.size.x &&
      point.y + 0.5 <= this.location.y + this.size.y
    ) {
      return true;
    }
    return false;
  }

  setCenter() {
    this.centerPoint = {
      x: this.location.x + this.size.x / 2,
      y: this.location.y + this.size.y / 2,
    };
  }
}

// Subclass for circle objects.
export class Circle extends BoardObject {
  diameter: number;
  objType: ObjType;

  constructor(
    id: number,
    x: number,
    y: number,
    diam: number,
    colour: ColorInstance,
  ) {
    super(id, x, y, colour);
    this.diameter = diam;
    this.objType = ObjType.Circle;
    this.setCenter();
  }

  draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    if (this.selected) {
      this.drawOutline(ctx, squareSize, offset);
    }
    const coords: Vec2 = {
      x:
        this.location.x * squareSize +
        offset.x +
        (squareSize * this.diameter) / 2,
      y:
        this.location.y * squareSize +
        offset.y +
        (squareSize * this.diameter) / 2,
    };
    ctx.beginPath();
    ctx.arc(
      coords.x,
      coords.y,
      (this.diameter * squareSize) / 2,
      0,
      2 * Math.PI,
      false,
    );
    ctx.fillStyle = this.colour.toString();
    ctx.fill();
    ctx.closePath();
  }

  drawOutline(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    const coords: Vec2 = {
      x:
        this.location.x * squareSize +
        offset.x +
        (squareSize * this.diameter) / 2,
      y:
        this.location.y * squareSize +
        offset.y +
        (squareSize * this.diameter) / 2,
    };
    ctx.beginPath();
    ctx.arc(
      coords.x,
      coords.y,
      (this.diameter * squareSize) / 2 + 2,
      0,
      2 * Math.PI,
      false,
    );
    ctx.fillStyle = GOLD.toString();
    ctx.fill();
    ctx.closePath();
  }

  isPointInside(point: Vec2) {
    const adj = Math.abs(this.location.x + this.diameter / 2 - point.x - 0.5);
    const opp = Math.abs(this.location.y + this.diameter / 2 - point.y - 0.5);
    const distance = Math.sqrt(adj * adj + opp * opp);
    if (distance <= this.diameter / 2) {
      return true;
    }
    return false;
  }

  setCenter() {
    this.centerPoint = {
      x: this.location.x + this.diameter / 2,
      y: this.location.y + this.diameter / 2,
    };
  }
}

// Subclass for polyline objects.
export class Polyline extends BoardObject {
  points: Vec2[];
  objType: ObjType;
  currPath: Path2D;
  currPathSpecs: Array<number>;
  ctx?: CanvasRenderingContext2D;

  constructor(
    id: number,
    x: number,
    y: number,
    structure: Vec2[],
    colour: ColorInstance,
  ) {
    super(id, x, y, colour);
    this.points = structure;
    this.objType = ObjType.Polyline;
    this.currPath = new Path2D();
    this.currPathSpecs = [0, 0, 0];
    this.ctx = undefined;
    this.setCenter();
  }

  draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    if (
      squareSize !== this.currPathSpecs[0] ||
      offset.x !== this.currPathSpecs[1] ||
      offset.y !== this.currPathSpecs[2]
    ) {
      this.currPath = new Path2D();
      this.currPath.moveTo(
        this.location.x * squareSize + offset.x,
        this.location.y * squareSize + offset.y,
      );
      for (const pt of this.points) {
        this.currPath.lineTo(
          (this.location.x + pt.x) * squareSize + offset.x,
          (this.location.y + pt.y) * squareSize + offset.y,
        );
      }
      this.currPathSpecs = [squareSize, offset.x, offset.y];
      this.currPath.closePath();
    }
    if (this.selected) {
      this.drawOutline(ctx);
    }
    ctx.fillStyle = this.colour.toString();
    ctx.fill(this.currPath);
    this.ctx = ctx;
  }

  drawOutline(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = GOLD.toString();
    ctx.lineWidth = 4;
    ctx.stroke(this.currPath);
    this.ctx = ctx;
  }

  isPointInside(point: Vec2) {
    if (
      this.ctx?.isPointInPath(
        this.currPath,
        (point.x + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[1],
        (point.y + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[2],
      )
    ) {
      return true;
    }
    return false;
  }

  setCenter() {
    const topLeft: Vec2 = { x: 0, y: 0 };
    const bottomRight: Vec2 = { x: 0, y: 0 };
    for (const pt of this.points) {
      if (pt.x < topLeft.x) {
        topLeft.x = pt.x;
      } else if (pt.x > bottomRight.x) {
        bottomRight.x = pt.x;
      }
      if (pt.y < topLeft.y) {
        topLeft.y = pt.y;
      } else if (pt.y > bottomRight.y) {
        bottomRight.y = pt.y;
      }
    }
    this.centerPoint = {
      x: (bottomRight.x + topLeft.x) / 2 + this.location.x,
      y: (bottomRight.y + topLeft.y) / 2 + this.location.y,
    };
  }
}

// Subclass for handling line objects.
export class Line extends BoardObject {
  points: Vec2[];
  objType: ObjType;

  constructor(
    id: number,
    x: number,
    y: number,
    structure: Vec2[],
    colour: ColorInstance,
  ) {
    super(id, x, y, colour);
    this.points = structure;
    this.objType = ObjType.Line;
    this.setCenter();
  }

  draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
    ctx.beginPath();
    ctx.moveTo(
      this.location.x * squareSize + offset.x,
      this.location.y * squareSize + offset.y,
    );
    for (const pt of this.points) {
      ctx.lineTo(
        (this.location.x + pt.x) * squareSize + offset.x,
        (this.location.y + pt.y) * squareSize + offset.y,
      );
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.colour.toString();
    ctx.stroke();
  }

  setCenter() {
    const topLeft: Vec2 = { x: 0, y: 0 };
    const bottomRight: Vec2 = { x: 0, y: 0 };
    for (const pt of this.points) {
      if (pt.x < topLeft.x) {
        topLeft.x = pt.x;
      } else if (pt.x > bottomRight.x) {
        bottomRight.x = pt.x;
      }
      if (pt.y < topLeft.y) {
        topLeft.y = pt.y;
      } else if (pt.y > bottomRight.y) {
        bottomRight.y = pt.y;
      }
    }
    this.centerPoint = {
      x: (bottomRight.x + topLeft.x) / 2 + this.location.x,
      y: (bottomRight.y + topLeft.y) / 2 + this.location.y,
    };
  }
}
