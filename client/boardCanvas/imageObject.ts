import { getRequiredElement } from '../dom.ts';
import type { Vec2 } from '../../shared/coords.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;

export class ImageObject {
    imagePath: string;
    image: any;
    imageOffset: Vec2;
    drawFlag: boolean;
    constructor() {
        this.imagePath = '';
        this.image = new Image(300, 300);
        if (can.width !== window.innerWidth) {
            can.width = window.innerWidth;
            can.height = window.innerHeight;
        }
        this.imageOffset = { x: 0, y: 0 };
        this.drawFlag = false;
    }

    disableImage() {
        this.drawFlag = false;
    }

    async updateImage(
        width: number,
        height: number,
        objId: number,
        gameId: number,
        bg: boolean = false,
    ) {
        this.drawFlag = false;
        await this.updateImageSource(objId, gameId);
        this.updateImageSize(width, height, bg);
    }

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

    updateImageSize(width: number, height: number, bg: boolean) {
        if (!bg) {
            if (
                this.image.naturalHeight !== width ||
                this.image.naturalWidth !== height
            ) {
                this.image.width = width;
                this.image.height = height;
            }
        } else {
            if (
                this.image.naturalHeight !== width ||
                this.image.naturalWidth !== height
            ) {
                const rescaleX = can.width / this.image.naturalWidth;
                const rescaleY = can.height / this.image.naturalHeight;
                const minRescale = Math.min(rescaleX, rescaleY);
                this.image.width = this.image.naturalWidth * minRescale;
                this.image.height = this.image.naturalHeight * minRescale;
                this.imageOffset.x = (can.width - this.image.width) / 2;
                this.imageOffset.y = (can.height - this.image.height) / 2;
            }
        }
    }

    draw(path: Path2D, squareSize: number = 1, offset: Vec2 = { x: 0, y: 0 }) {
        if (this.drawFlag) {
            ctx.save();
            ctx.clip(path);
            ctx.drawImage(
                this.image,
                this.imageOffset.x + offset.x,
                this.imageOffset.y + offset.y,
                this.image.width * squareSize,
                this.image.height * squareSize,
            );
            ctx.restore();
            return true;
        }
        return false;
    }
}
