import type { ColInst } from '../colours.ts';
import type { Vec2 } from './coords.ts';

export class BoardToken {
    name: string;
    owner: string;
    colour: string;
    movable: boolean;

    constructor(name: string, owner: string, colour: string, move: boolean) {
        this.name = name;
        this.owner = owner;
        this.colour = colour;
        this.movable = move;
    }

    drawOutline(ctx: CanvasRenderingContext2D, currPath: Path2D) {
        ctx.strokeStyle = this.colour;
        ctx.stroke(currPath);
    }

    drawLabel(
        ctx: CanvasRenderingContext2D,
        squareSize: number,
        offset: Vec2,
        location: Vec2,
    ) {
        console.log(location);
        console.log(location.x * squareSize + offset.x);
        console.log((location.y - 20) * squareSize + offset.y);
        ctx.font = '20px serif';
        ctx.fillStyle = '#eeeeee';
        ctx.textAlign = 'center';
        const textSize = ctx.measureText(this.name).width;
        ctx.fillRect(
            location.x * squareSize + offset.x - textSize / 2 - 5,
            location.y * squareSize + offset.y - 15,
            textSize + 10,
            25,
        );
        ctx.fillStyle = '#222222';
        ctx.fillText(
            this.name,
            location.x * squareSize + offset.x,
            location.y * squareSize + offset.y,
        );
    }
}
