import type { ColInst } from '../../shared/colours.ts';
import type { Vec2 } from '../../shared/coords.ts';
import { GOLD } from '../../shared/colours.ts';
import type {
    ObjectCreatePayload,
    ObjectParams,
} from '../../shared/objectEvents.ts';
import { Token } from '../../shared/objectEvents.ts';
import { tempStore } from '../serveInter.ts';
import { ImageObject } from './imageObject.ts';
const serveInter = new tempStore();

// General purpose superclass for any shape that appears on the board.
// Includes tokens, rectangles, polylines.
// Future plans to include more specific subclasses
export class BoardObject {
    objectId: number;
    zOrder: number;
    colour: ColInst | string;
    hasImage: boolean;
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
    imageObj: ImageObject;

    constructor(
        objectId: number,
        colour: ColInst | string,
        drawParams: ObjectParams,
        structure: Vec2[],
    ) {
        this.drawParams = drawParams;
        this.objectId = objectId;
        this.zOrder = 0;
        this.colour = colour;
        this.hasImage = false;
        this.selected = false;
        this.centerPoint = { x: 0, y: 0 };
        this.layerId = 0;
        this.currPathSpecs = [0, 0, 0];
        this.currPath = new Path2D();
        this.ctx = undefined;
        this.token = {
            name: 'na',
            movable: true,
            active: false,
            colour: '#cccccc',
        };
        this.owner = 'None';
        this.points = structure;
        this.imageObj = new ImageObject();
        this.setCenter();
    }

    async updateImage(newSource: string) {
        const br = this.getBottomRight();
        const tl = this.getTopLeft();
        if (this.drawParams.fill) {
            await this.imageObj.updateImage(
                br.x - tl.x,
                br.y - tl.y,
                newSource,
            );
            this.currPathSpecs[0] = 0;
        } else {
            console.log(
                'how are you planning on adding an image to a wall object',
            );
        }
    }

    updateObject() {
        serveInter.updateObject(this.payloadFromObject());
    }

    updateTopLeft() {
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
        return {
            x: minX,
            y: minY,
        };
    }

    updateBottomRight() {
        let maxX = this.points[0].x;
        let maxY = this.points[0].y;
        for (const pt of this.points) {
            if (pt.x > maxX) {
                maxX = pt.x;
            }
            if (pt.y > maxY) {
                maxY = pt.y;
            }
        }
    }

    getBottomRight() {
        let maxX = this.points[0].x;
        let maxY = this.points[0].y;
        for (const pt of this.points) {
            if (pt.x > maxX) {
                maxX = pt.x;
            }
            if (pt.y > maxY) {
                maxY = pt.y;
            }
        }
        return {
            x: maxX,
            y: maxY,
        };
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
            offset.y !== this.currPathSpecs[2]
        ) {
            this.buildPath(squareSize, offset);
            this.ctx = ctx;
            this.updateImage('./client/assets/gay.jpg');
        }
        if (this.token.active) {
            this.drawToken(this.ctx as any, squareSize, offset);
        }
        if (this.selected) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 3;
            ctx.stroke(this.currPath);
        }
        const tl = this.getTopLeft();
        if (
            !this.imageObj.draw(squareSize, {
                x: offset.x + tl.x * squareSize,
                y: offset.y + tl.y * squareSize,
            })
        ) {
            if (!this.drawParams.fill) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = this.colour.toString();
                ctx.stroke(this.currPath);
            } else {
                ctx.fillStyle = this.colour.toString();
                ctx.fill(this.currPath);
            }
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
        for (const pt of this.points) {
            pt.x += xChange;
            pt.y += yChange;
        }
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
        const topLeft = this.getTopLeft();
        const bottomRight = this.getBottomRight();
        this.centerPoint = {
            x: topLeft.x + (bottomRight.x - topLeft.x) / 2,
            y: topLeft.y + (bottomRight.y - topLeft.y) / 2,
        };
    }

    setSelected(newSelection: boolean) {
        this.selected = newSelection;
    }

    // Updates the object to match that of a provided payload.
    updateFromPayload(newSetting: ObjectCreatePayload) {
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
        this.points = newSetting.points;
        this.setCenter();
        this.currPathSpecs[0] = 0;
        this.updateToken(newSetting.token);
    }

    payloadFromObject() {
        return {
            params: this.drawParams,
            points: this.points,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
            token: this.token,
        };
    }

    getPoints() {
        return this.points;
    }

    updatePoint(newX: number, newY: number, specificPoint: number) {
        this.points[specificPoint].x = newX;
        this.points[specificPoint].y = newY;
        this.currPathSpecs[0] = 0;
        this.setCenter();
        this.updateObject();
    }

    // the devil wrote this
    updateSize(newPoint: Vec2, corner: number) {
        const topLeft = this.getTopLeft();
        const bottomRight = this.getBottomRight();
        for (const pt of this.points) {
            if (corner === 0) {
                const transform = {
                    x: topLeft.x - newPoint.x,
                    y: topLeft.y - newPoint.y,
                };
                const percentX =
                    (bottomRight.x - pt.x) / (bottomRight.x - topLeft.x);
                const percentY =
                    (bottomRight.y - pt.y) / (bottomRight.y - topLeft.y);
                pt.x = pt.x - transform.x * percentX;
                pt.y = pt.y - transform.y * percentY;
            } else if (corner === 1) {
                const transform = {
                    x: newPoint.x - bottomRight.x,
                    y: topLeft.y - newPoint.y,
                };
                const percentX =
                    (pt.x - topLeft.x) / (bottomRight.x - topLeft.x);
                const percentY =
                    (bottomRight.y - pt.y) / (bottomRight.y - topLeft.y);
                pt.x = transform.x * percentX + pt.x;
                pt.y = pt.y - transform.y * percentY;
            } else if (corner === 2) {
                const transform = {
                    x: newPoint.x - bottomRight.x,
                    y: newPoint.y - bottomRight.y,
                };
                const percentX =
                    (pt.x - topLeft.x) / (bottomRight.x - topLeft.x);
                const percentY =
                    (pt.y - topLeft.y) / (bottomRight.y - topLeft.y);
                pt.x = transform.x * percentX + pt.x;
                pt.y = transform.y * percentY + pt.y;
            } else if (corner === 3) {
                const transform = {
                    x: topLeft.x - newPoint.x,
                    y: newPoint.y - bottomRight.y,
                };
                const percentX =
                    (bottomRight.x - pt.x) / (bottomRight.x - topLeft.x);
                const percentY =
                    (pt.y - topLeft.y) / (bottomRight.y - topLeft.y);
                pt.x = pt.x - transform.x * percentX;
                pt.y = transform.y * percentY + pt.y;
            }
        }
        this.currPathSpecs[0] = 0;
        this.setCenter();
        this.updateObject();
    }

    pathEllipse(squareSize: number, outerOffset: Vec2) {
        this.currPath = new Path2D();
        this.currPath.ellipse(
            ((this.points[0].x + this.points[2].x) / 2) * squareSize +
                outerOffset.x,
            ((this.points[0].y + this.points[2].y) / 2) * squareSize +
                outerOffset.y,
            (Math.abs(this.points[0].x - this.points[2].x) * squareSize) / 2,
            (Math.abs(this.points[0].y - this.points[2].y) * squareSize) / 2,
            0,
            0,
            2 * Math.PI,
        );
        this.currPathSpecs = [squareSize, outerOffset.x, outerOffset.y];
        this.currPath.closePath();
    }

    pathOther(squareSize: number, outerOffset: Vec2) {
        this.currPath = new Path2D();
        this.currPath.moveTo(
            Math.round(this.points[0].x * squareSize + outerOffset.x),
            Math.round(this.points[0].y * squareSize + outerOffset.y),
        );
        for (const pt of this.points) {
            this.currPath.lineTo(
                Math.round(pt.x * squareSize + outerOffset.x),
                Math.round(pt.y * squareSize + outerOffset.y),
            );
        }
        this.currPathSpecs = [squareSize, outerOffset.x, outerOffset.y];
        if (this.drawParams.close) {
            this.currPath.closePath();
        }
    }
}
