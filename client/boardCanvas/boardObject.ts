import type { Vec2 } from '../../shared/coords.ts';
import { GOLD } from '../../shared/colours.ts';
import type {
    ObjectCreatePayload,
    ObjectParams,
} from '../../shared/objectEvents.ts';
import { Token } from '../../shared/objectEvents.ts';
import { TempStore } from '../serveInter.ts';
import { ImageObject } from './imageObject.ts';
const serveInter = new TempStore();

// General purpose superclass for any shape that appears on the board.
// Includes tokens, rectangles, polylines.
// Future plans to include more specific subclasses
export class BoardObject {
    objectId: number;
    zOrder: number;
    colour: string;
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
    tl: Vec2;
    br: Vec2;
    opac: number;

    constructor(
        objectId: number,
        colour: string,
        drawParams: ObjectParams,
        structure: Vec2[],
    ) {
        this.drawParams = drawParams;
        this.objectId = objectId;
        this.zOrder = 0;
        this.colour = colour;
        this.selected = false;
        this.centerPoint = { x: 0, y: 0 };
        this.layerId = 0;
        this.currPathSpecs = [0, 0, 0];
        this.currPath = new Path2D();
        this.ctx = undefined;
        this.token = {
            name: '',
            movable: true,
            active: false,
            colour: '#cccccc',
        };
        this.owner = 'None';
        this.points = structure;
        this.imageObj = new ImageObject();
        this.tl = { x: 0, y: 0 };
        this.br = { x: 0, y: 0 };
        this.updateObject(false);
        this.opac = 1;
        this.setOpac();
    }

    // Standard getters
    getTopLeft(): Vec2 {
        return this.tl;
    }

    getBottomRight(): Vec2 {
        return this.br;
    }

    getColour(): string {
        return this.colour;
    }

    getPoints(): Vec2[] {
        return this.points;
    }

    // Updates image on a board object.
    async updateImage(addImage: boolean) {
        if (this.drawParams.fill) {
            if (addImage) {
                await this.imageObj.updateImage(
                    this.br.x - this.tl.x,
                    this.br.y - this.tl.y,
                    this.objectId,
                    Number(window.location.pathname.split('/')[2]) | 0,
                );
            } else {
                this.imageObj.disableImage();
            }
        } else if (addImage) {
            console.log(
                'how are you planning on adding an image to a wall object',
            );
        }
    }

    setOpac() {
        const check = this.colour.slice(0, this.colour.length - 1).split(' ');
        if (check.length === 4) {
            this.opac = Number(check[3]);
        }
    }

    // Updates secondary attributes of the object, also tells the server interface to update it if sendObj is set to true.
    updateObject(sendObj: boolean) {
        this.updateTopLeft();
        this.updateBottomRight();
        this.setCenter();
        this.setOpac();
        if (sendObj && this.objectId >= 0) {
            serveInter.updateObject(this.payloadFromObject());
        }
    }

    // Updates the top left point of the object.
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
        this.tl = {
            x: minX,
            y: minY,
        };
    }

    // Updates the bottom right point of the object.
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
        this.br = {
            x: maxX,
            y: maxY,
        };
    }

    // Checks if the object's token is active.
    hasToken(): boolean {
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
        }
        if (this.selected) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = this.token.active ? 5 : 3;
            ctx.stroke(this.currPath);
        }
        if (this.token.active) {
            this.drawToken(this.ctx as any, squareSize, offset);
        }
        if (
            !this.imageObj.draw(
                this.currPath,
                squareSize,
                {
                    x: offset.x + this.tl.x * squareSize,
                    y: offset.y + this.tl.y * squareSize,
                },
                ctx,
                this.opac,
            )
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
        if (this.token.name !== '') {
            this.drawLabel(ctx, squareSize, offset);
        }
    }

    // Draws the outline of the object's token.
    drawOutline(ctx: CanvasRenderingContext2D) {
        if (this.token.colour !== 'none') {
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
        this.updateObject(false);
    }

    // Standard setters
    setColour(newColour: string) {
        this.colour = newColour;
    }

    setZOrder(newOrder: number) {
        this.zOrder = newOrder;
    }

    // Checks if the center of the object is contained within a given rectangle.
    // Used for selection of board objects.
    // Probably should be replaced with something checking overlap properly.
    isCenterInsideRect(point1: Vec2, point2: Vec2): boolean {
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
    isPointInside(point: Vec2): boolean {
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
            x: this.tl.x + (this.br.x - this.tl.x) / 2,
            y: this.tl.y + (this.br.y - this.tl.y) / 2,
        };
    }

    setSelected(newSelection: boolean) {
        this.selected = newSelection;
    }

    // Updates the object to match that of a provided payload.
    updateFromPayload(newSetting: ObjectCreatePayload) {
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
        this.points = [];
        for (const pt of newSetting.points) {
            this.points.push({ x: pt.x, y: pt.y });
        }
        this.drawParams = newSetting.params;
        this.updateObject(false);
        this.currPathSpecs[0] = 0;
        this.updateToken(newSetting.token);
        this.imageObj.updateImageSize(
            this.br.x - this.tl.x,
            this.br.y - this.tl.y,
            false,
        );
    }

    // Returns an object payload built like the object itself.
    payloadFromObject(): ObjectCreatePayload {
        return {
            params: this.drawParams,
            points: this.points,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
            token: this.token,
            image: this.imageObj.drawFlag,
        };
    }

    // Updates a single vertex of the polygon.
    // Does update the server about it.
    updatePoint(newX: number, newY: number, specificPoint: number) {
        this.points[specificPoint].x = newX;
        this.points[specificPoint].y = newY;
        this.currPathSpecs[0] = 0;
        this.updateObject(true);
    }

    // the devil wrote this
    updateSize(newPoint: Vec2, corner: number) {
        const topLeft = this.tl;
        const bottomRight = this.br;
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
        this.updateObject(true);
    }

    // Constructs an ellipse path.
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

    // Constructs any other sort of path.
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
