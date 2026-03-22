import type { ColInst } from '../../shared/colours.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { GOLD } from '../../shared/colours.ts';
import { Shape } from '../../shared/objectEvents.ts';
import type {
    ObjectCreatePayload,
    PolyCreatePayload,
    RectCreatePayload,
} from '../../shared/objectEvents.ts';
import { Token } from '../../shared/objectEvents.ts';

export type BoardObject = Polyline | Box;

// General purpose superclass for any shape that appears on the board.
// Includes tokens, rectangles, polylines.
// Future plans to include more specific subclasses
export class BoardObjectBase {
    objectId: number;
    zOrder: number;
    offset: Vec2;
    scale: Vec2;
    colour: ColInst | string;
    hasImage: boolean;
    imagePath: string;
    centerPoint: Vec2;
    selected: boolean;
    layerId: number;
    currPathSpecs: Array<number>;
    currPath: Path2D;
    ctx?: CanvasRenderingContext2D;
    shape: Shape;
    token: Token;
    owner: string;

    constructor(
        objectId: number,
        x: number,
        y: number,
        width: number,
        height: number,
        colour: ColInst | string,
        kind: Shape,
    ) {
        this.objectId = objectId;
        this.zOrder = 0;
        this.offset = { x, y };
        this.scale = { x: width, y: height };
        this.colour = colour;
        this.hasImage = false;
        this.imagePath = '';
        this.selected = false;
        this.centerPoint = { x: 0, y: 0 };
        this.layerId = 0;
        this.currPathSpecs = [0, 0, 0, 0, 0];
        this.currPath = new Path2D();
        this.ctx = undefined;
        this.shape = kind;
        this.token = {
            name: 'na',
            movable: true,
            active: false,
            colour: '#cccccc',
        };
        this.owner = 'None';
    }

    // Checks if the object's token is active.
    hasToken() {
        return this.token.active;
    }

    // Updates the object's token to match the provided.
    updateToken(newToken: Token) {
        this.token.name = newToken.name;
        this.token.movable = newToken.movable;
        this.token.active = newToken.active;
        this.token.colour = newToken.colour;
    }

    // Draws the object.
    draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        if (
            squareSize !== this.currPathSpecs[0] ||
            offset.x !== this.currPathSpecs[1] ||
            offset.y !== this.currPathSpecs[2] ||
            this.offset.x !== this.currPathSpecs[3] ||
            this.offset.y !== this.currPathSpecs[4]
        ) {
            this.buildPath(squareSize, offset);
            this.ctx = ctx;
        }
        if (this.token.active) {
            this.drawToken(this.ctx as any, squareSize, offset);
        }
        if (this.selected) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 3;
            ctx.stroke(this.currPath);
        }
        if (this.shape === Shape.Line) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.colour.toString();
            ctx.stroke(this.currPath);
        } else {
            ctx.fillStyle = this.colour.toString();
            ctx.fill(this.currPath);
        }
        if (this.token.active) {
            this.drawToken(this.ctx as any, squareSize, offset);
        }
    }

    // Draws the object's token, if the token is active.
    drawToken(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        this.drawOutline(ctx);
        this.drawLabel(ctx, squareSize, offset);
    }

    // Draws the outline of the object's token.
    drawOutline(ctx: CanvasRenderingContext2D) {
        if (!this.selected) {
            ctx.strokeStyle = this.token.colour;
            ctx.lineWidth = 3;
            ctx.stroke(this.currPath);
        }
    }

    // Draws the token's label.
    drawLabel(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        ctx.font = '20px serif';
        ctx.fillStyle = '#eeeeee';
        ctx.textAlign = 'center';
        const textSize = ctx.measureText(this.token.name).width;
        ctx.fillRect(
            this.centerPoint.x * squareSize + offset.x - textSize / 2 - 5,
            this.centerPoint.y * squareSize + offset.y - 15,
            textSize + 10,
            25,
        );
        ctx.fillStyle = '#222222';
        ctx.fillText(
            this.token.name,
            this.centerPoint.x * squareSize + offset.x,
            this.centerPoint.y * squareSize + offset.y,
        );
    }

    // Blank function for building the path of the object.
    buildPath(squareSize: number, offset: Vec2) {
        return;
    }

    // Moves the object a set amount.
    move(xChange: number, yChange: number) {
        this.offset.x += xChange;
        this.offset.y += yChange;
        this.setCenter();
        return this.offset;
    }

    setColour(newColour: ColInst | string) {
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

    // Checks if a point is contained within the path of the object.
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

    // Function to set the center point of the object.
    setCenter() {
        this.centerPoint = { x: 0, y: 0 };
    }

    setSelected(newSelection: boolean) {
        this.selected = newSelection;
    }

    // Updates the object to match that of a provided payload.
    updateFromPayload(newSetting: ObjectCreatePayload) {
        this.offset.x = newSetting.x;
        this.offset.y = newSetting.y;
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
        this.setCenter();
        this.updateToken(newSetting.token);
    }
}

// Subclass for both rectangle/circle objects.
export class Box extends BoardObjectBase {
    points: Vec2[];
    declare shape: Shape.Rect | Shape.Ellipse;

    constructor(
        id: number,
        x: number,
        y: number,
        xSize: number,
        ySize: number,
        colour: ColInst | string,
        kind: Shape.Rect | Shape.Ellipse,
    ) {
        super(id, x, y, xSize, ySize, colour, kind);
        this.points = this.constructPoints();
        this.setCenter();
        this.shape = kind;
    }

    constructPoints() {
        const points: Vec2[] = [];
        points.push({ x: 0, y: 0 });
        points.push({ x: 1, y: 0 });
        points.push({ x: 1, y: 1 });
        points.push({ x: 0, y: 1 });
        return points;
    }

    buildPath(squareSize: number, offset: Vec2) {
        this.shape === Shape.Rect
            ? this.pathRect(squareSize, offset)
            : this.pathEllipse(squareSize, offset);
    }

    pathRect(squareSize: number, outerOffset: Vec2) {
        this.currPath = new Path2D();
        this.currPath.moveTo(
            Math.round(this.offset.x * squareSize + outerOffset.x),
            Math.round(this.offset.y * squareSize + outerOffset.y),
        );
        for (const pt of this.points) {
            this.currPath.lineTo(
                Math.round(
                    (pt.x * this.scale.x + this.offset.x) * squareSize +
                        outerOffset.x,
                ),
                Math.round(
                    (pt.y * this.scale.y + this.offset.y) * squareSize +
                        outerOffset.y,
                ),
            );
        }
        this.currPathSpecs = [
            squareSize,
            outerOffset.x,
            outerOffset.y,
            this.offset.x,
            this.offset.y,
        ];
        this.currPath.closePath();
    }

    pathEllipse(squareSize: number, outerOffset: Vec2) {
        const coords: Vec2 = {
            x:
                this.offset.x * squareSize +
                outerOffset.x +
                (squareSize * this.scale.x) / 2,
            y:
                this.offset.y * squareSize +
                outerOffset.y +
                (squareSize * this.scale.y) / 2,
        };
        this.currPath = new Path2D();
        this.currPath.ellipse(
            coords.x,
            coords.y,
            (this.scale.x * squareSize) / 2,
            (this.scale.y * squareSize) / 2,
            0,
            0,
            2 * Math.PI,
        );
        this.currPathSpecs = [
            squareSize,
            outerOffset.x,
            outerOffset.y,
            this.offset.x,
            this.offset.y,
        ];
        this.currPath.closePath();
    }

    setCenter() {
        this.centerPoint = {
            x: this.offset.x + this.scale.x / 2,
            y: this.offset.y + this.scale.y / 2,
        };
    }

    payloadFromObject(): RectCreatePayload {
        return {
            kind: this.shape,
            x: this.offset.x,
            y: this.offset.y,
            width: this.scale.x,
            height: this.scale.y,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
            token: this.token,
        };
    }

    getCorners() {
        const corners = [];
        const loc = this.offset;
        corners.push(loc);
        corners.push({ x: loc.x + this.scale.x, y: loc.y });
        corners.push({ x: loc.x + this.scale.x, y: loc.y + this.scale.y });
        corners.push({ x: loc.x, y: loc.y + this.scale.y });
        return corners;
    }
}

// Subclass for polyline/line objects.
export class Polyline extends BoardObjectBase {
    topLeft: any;
    points: Vec2[];
    declare shape: Shape.Polyline | Shape.Line;

    constructor(
        id: number,
        x: number,
        y: number,
        structure: Vec2[],
        colour: ColInst | string,
        kind: Shape.Polyline | Shape.Line,
    ) {
        super(id, x, y, 1, 1, colour, kind);
        this.points = structure;
        this.shape = kind;
        this.setCenter();
        this.topLeft = this.getCorners()[0];
    }

    buildPath(squareSize: number, outerOffset: Vec2) {
        this.currPath = new Path2D();
        this.currPath.moveTo(
            Math.round(
                (this.offset.x + this.points[0].x) * squareSize + outerOffset.x,
            ),
            Math.round(
                (this.offset.y + this.points[0].y) * squareSize + outerOffset.y,
            ),
        );
        for (const pt of this.points) {
            this.currPath.lineTo(
                Math.round((this.offset.x + pt.x) * squareSize + outerOffset.x),
                Math.round((this.offset.y + pt.y) * squareSize + outerOffset.y),
            );
        }
        this.currPathSpecs = [
            squareSize,
            outerOffset.x,
            outerOffset.y,
            this.offset.x,
            this.offset.y,
        ];
        if (this.shape === Shape.Polyline) {
            this.currPath.closePath();
        }
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
            x: (bottomRight.x + topLeft.x) / 2 + this.offset.x,
            y: (bottomRight.y + topLeft.y) / 2 + this.offset.y,
        };
    }

    payloadFromObject(): PolyCreatePayload {
        return {
            kind: this.shape,
            x: this.offset.x,
            y: this.offset.y,
            points: this.points,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
            token: this.token,
        };
    }

    getCorners() {
        const vals: (null | number)[] = [null, null, null, null];
        const loc = this.offset;
        for (const pt of this.points) {
            if (!vals[0] || vals[0] > pt.x * this.scale.x + loc.x) {
                vals[0] === pt.x * this.scale.x + loc.x;
            }
            if (!vals[1] || vals[1] < pt.x * this.scale.x + loc.x) {
                vals[1] === pt.x * this.scale.x + loc.x;
            }
            if (!vals[2] || vals[2] > pt.y * this.scale.y + loc.y) {
                vals[2] === pt.y * this.scale.y + loc.y;
            }
            if (!vals[3] || vals[3] < pt.y * this.scale.y + loc.y) {
                vals[3] === pt.y * this.scale.y + loc.y;
            }
        }
        return [
            { x: vals[0], y: vals[2] },
            { x: vals[1], y: vals[2] },
            { x: vals[1], y: vals[3] },
            { x: vals[0], y: vals[3] },
        ];
    }

    getPoints() {
        const vals = [];
        const loc = this.offset;
        vals.push(loc);
        for (const pt of this.points) {
            vals.push({
                x: pt.x * this.scale.x + loc.x,
                y: pt.y * this.scale.y + loc.y,
            });
        }
        return vals;
    }
}
