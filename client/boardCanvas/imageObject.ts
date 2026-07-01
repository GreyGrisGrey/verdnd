import { getRequiredElement } from '../dom.ts';
import type { Vec2 } from '../../shared/coords.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;

export class ImageObject {
    image: any;
    imageOffset: Vec2;
    drawFlag: boolean;
    stringUrl: string;
    width: number;
    height: number;
    blob: Blob;
    constructor() {
        this.image = new Image(300, 300);
        this.imageOffset = { x: 0, y: 0 };
        this.drawFlag = false;
        this.stringUrl = '';
        this.width = 0;
        this.height = 0;
        this.blob = new Blob();
    }

    // Stops the image being drawn.
    disableImage() {
        this.drawFlag = false;
    }

    // Updates the image to be drawn to a completely different one.
    async updateImage(
        width: number,
        height: number,
        objId: number,
        gameId: number,
        bg: boolean = false,
    ) {
        this.width = width;
        this.height = height;
        this.drawFlag = false;
        await this.updateImageSource(objId, gameId);
        this.updateImageSize(width, height, bg);
    }

    // Updates the image to be drawn, but it's for the object menu so the server doesn't need to get involved.
    async updateImageLocal(objectUrl: string, width: number, height: number) {
        this.stringUrl = objectUrl;
        this.width = width;
        this.height = height;
        this.image.src = objectUrl;
        await new Promise<void>((resolve, reject) => {
            this.image.onload = () => resolve();
            this.image.onerror = () =>
                reject(new Error('Image failed to load'));
        });
        this.updateImageSize(width, height, false);
        this.drawFlag = true;
    }

    // Updates the image's source by contacting the server.
    async updateImageSource(objId: number, gameId: number) {
        try {
            const fileString =
                './client/assets/games/' +
                gameId.toString() +
                '/obj' +
                objId.toString() +
                '.png';
            const response = await fetch(fileString);
            if (!response.ok) {
                throw new Error(`Could not fetch image`);
            }
            const imageBlob = await response.blob();
            const objectUrl = URL.createObjectURL(imageBlob);
            this.stringUrl = objectUrl;
            this.blob = imageBlob;
            this.image.src = objectUrl;
            await new Promise<void>((resolve, reject) => {
                this.image.onload = () => resolve();
                this.image.onerror = () =>
                    reject(new Error('Image failed to load'));
            });
            this.drawFlag = true;
        } catch (error) {
            console.error('Could not fetch image');
        }
    }

    // Updates the image size so it matches the object's size.
    updateImageSize(width: number, height: number, bg: boolean) {
        if (!this.drawFlag) {
            return;
        }
        if (!bg) {
            this.image.width = width;
            this.image.height = height;
        } else {
            const rescaleX = can.width / this.image.naturalWidth;
            const rescaleY = can.height / this.image.naturalHeight;
            const minRescale = Math.min(rescaleX, rescaleY);
            this.image.width = this.image.naturalWidth * minRescale;
            this.image.height = this.image.naturalHeight * minRescale;
            this.imageOffset.x = (can.width - this.image.width) / 2;
            this.imageOffset.y = (can.height - this.image.height) / 2;
        }
    }

    // Draws the image. Needs a ctx because of the object menu. Needs a path to clip to.
    draw(
        path: Path2D | null = null,
        squareSize: number = 1,
        offset: Vec2 = { x: 0, y: 0 },
        drawCtx: CanvasRenderingContext2D = ctx,
        drawOpac: number = 1,
    ): boolean {
        if (this.drawFlag) {
            if (path) {
                drawCtx.save();
                drawCtx.clip(path);
            }
            drawCtx.globalAlpha = drawOpac;
            drawCtx.drawImage(
                this.image,
                this.imageOffset.x + offset.x,
                this.imageOffset.y + offset.y,
                this.image.width * squareSize,
                this.image.height * squareSize,
            );
            drawCtx.globalAlpha = 1;
            if (path) {
                drawCtx.restore();
            }
            return true;
        }
        return false;
    }
}
