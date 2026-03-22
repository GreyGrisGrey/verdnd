import type { ColInst } from '../../shared/colours.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { GOLD } from '../../shared/colours.ts';
import type {
    ObjectCreatePayload,
    ObjectParams,
} from '../../shared/objectEvents.ts';
import { Token } from '../../shared/objectEvents.ts';

// General purpose superclass for any shape that appears on the board.
// Includes tokens, rectangles, polylines.
// Future plans to include more specific subclasses
export class BoardObject {
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
    token: Token;
    owner: string;
    points: Vec2[];
    drawParams: ObjectParams;

    constructor(
        objectId: number,
        x: number,
        y: number,
        colour: ColInst | string,
        drawParams: ObjectParams,
        width: number = 1,
        height: number = 1,
        structure: Vec2[] = [],
    ) {
        this.drawParams = drawParams;
        this.objectId = objectId;
        this.zOrder = 0;
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
        this.token = {
            name: 'na',
            movable: true,
            active: false,
            colour: '#cccccc',
        };
        this.owner = 'None';
        this.points = drawParams.rect ? this.constructPoints() : structure;
        this.offset = { x, y };
    }

    getTopLeft() {
        let minX = this.points[0].x;
        let minY = this.points[0].y;
        for (const pt of this.points) {
            if (pt.x < minX) {
                minX = pt.x;
            }
            if (pt.y < minY) {
                minY = pt.y;
            }
        }
        return { x: minX, y: minY };
    }

    constructPoints() {
        const points: Vec2[] = [];
        points.push({ x: 0, y: 0 });
        points.push({ x: 1, y: 0 });
        points.push({ x: 1, y: 1 });
        points.push({ x: 0, y: 1 });
        return points;
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
        if (!this.drawParams.fill) {
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
        this.drawParams.ellipse
            ? this.pathEllipse(squareSize, offset)
            : this.pathOther(squareSize, offset);
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
        this.centerPoint = {
            x: this.offset.x + this.scale.x / 2,
            y: this.offset.y + this.scale.y / 2,
        };
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

    payloadFromObject(): ObjectCreatePayload {
        return {
            params: this.drawParams,
            x: this.offset.x,
            y: this.offset.y,
            width: this.scale.x,
            height: this.scale.y,
            points: this.points,
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

    getPoints() {
        const vals = [];
        if (!this.drawParams.ellipse) {
            const loc = this.offset;
            vals.push(loc);
            for (const pt of this.points) {
                vals.push({
                    x: pt.x * this.scale.x + loc.x,
                    y: pt.y * this.scale.y + loc.y,
                });
            }
        }
        return vals;
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

    pathOther(squareSize: number, outerOffset: Vec2) {
        this.currPath = new Path2D();
        this.currPath.moveTo(
            Math.round(
                (this.points[0].x * this.scale.x + this.offset.x) * squareSize +
                    outerOffset.x,
            ),
            Math.round(
                (this.points[0].y * this.scale.y + this.offset.y) * squareSize +
                    outerOffset.y,
            ),
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
        if (this.drawParams.close) {
            this.currPath.closePath();
        }
    }
}
