import { getRequiredElement } from '../dom.ts';
import type { Vec2 } from '../../shared/coords.ts';
const can = getRequiredElement('board', HTMLCanvasElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;

export class ImageObject {
    imagePath: string;
    image: any;
    imageOffset: Vec2;
    constructor() {
        this.imagePath = '';
        this.image = new Image(300, 300);
        if (can.width !== window.innerWidth) {
            can.width = window.innerWidth;
            can.height = window.innerHeight;
        }
        this.imageOffset = { x: 0, y: 0 };
    }

    async updateImageSource(newSource: string) {
        try {
            // Fetch the image from the URL
            const response = await fetch(newSource); //

            // Check for successful response
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Read the response body as a Blob
            const imageBlob = await response.blob(); //

            // Create a local object URL for the Blob
            const objectUrl = URL.createObjectURL(imageBlob); //

            // Set the src attribute of the image element
            this.image.src = objectUrl;
            this.imagePath = newSource;
            await new Promise<void>((resolve, reject) => {
                this.image.onload = () => resolve();
                this.image.onerror = () =>
                    reject(new Error('Image failed to load'));
            });
            this.image.overflow = 'hidden';
            this.updateImageSize();
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    }

    updateImageSize() {
        if (
            this.image.naturalHeight !== can.height ||
            this.image.naturalWidth !== can.width
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

    draw() {
        if (this.imagePath !== '') {
            ctx.drawImage(
                this.image,
                this.imageOffset.x,
                this.imageOffset.y,
                this.image.width,
                this.image.height,
            );
        }
    }
}
