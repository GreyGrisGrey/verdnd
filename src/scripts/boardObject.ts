// Includes, tokens, drawings, map drawings, and areas of effect

export class BoardObject {
    ID: number
    zOrder: number
    location: Array<number>
    colour: string
    hasImage: boolean
    imagePath: string
    
    constructor(x: number, y: number) {
        this.ID = 0
        this.zOrder = 0
        this.location = [x, y]
        this.colour = "#cc0000"
        this.hasImage = false
        this.imagePath = ""
    }
    
    move(xChange: number, yChange:number): Array<number> {
        this.location[0] += xChange
        this.location[1] += yChange
        return this.location
    }
    
    setColour(newColour: string) {
        this.colour = newColour
    }
    
    setZOrder(newOrder: number) {
        this.zOrder = newOrder
    }
}

export class Token extends BoardObject{
    owner: string
    radius: number
    name: string
    objType: string
    
    constructor(x: number, y: number) {
        super(x, y)
        this.owner = ""
        this.radius = 1
        this.name = ""
        this.objType = "Token"
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        let coords = [(this.location[0] * squareSize) + offset[0] + squareSize * this.radius/2, (this.location[1] * squareSize) + offset[1] + squareSize * this.radius/2]
        ctx.beginPath()
        ctx.arc(coords[0], coords[1], this.radius * squareSize / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.colour
        ctx.fill()
        ctx.strokeStyle = "#cccccc"
        ctx.stroke()
        ctx.closePath()
    }
}

export class Rect extends BoardObject{
    size: Array<number>
    objType: string
    
    constructor(x:number, y:number, xSize:number, ySize:number) {
        super(x, y)
        this.size = [xSize, ySize]
        this.objType = "Rect"
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        ctx.fillStyle = this.colour
        ctx.fillRect(this.location[0] * squareSize + offset[0], this.location[1] * squareSize + offset[1], this.size[0] * squareSize, this.size[1] * squareSize)
    }
    
}

export class Circle extends BoardObject{
    radius: number
    objType: string
    
    constructor(x:number, y:number, rad:number) {
        super(x, y)
        this.radius = rad
        this.objType = "Circle"
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        let coords = [(this.location[0] * squareSize) + offset[0] + squareSize * this.radius/2, (this.location[1] * squareSize) + offset[1] + squareSize * this.radius/2]
        ctx.beginPath()
        ctx.arc(coords[0], coords[1], this.radius * squareSize / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.colour
        ctx.fill()
        ctx.closePath()
    }
}

export class Polyline extends BoardObject{
    points: Array<Array<number>>
    objType: string
    
    constructor(x: number, y:number, structure:Array<Array<number>>) {
        super(x, y)
        this.points = structure
        this.objType = "Polyline"
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        ctx.beginPath()
        ctx.moveTo(this.location[0] * squareSize + offset[0], this.location[1] * squareSize + offset[1])
        for (let i = 0; i < this.points.length; i++) {
            ctx.lineTo((this.location[0] + this.points[i][0]) * squareSize + offset[0], (this.location[1] + this.points[i][1]) * squareSize + offset[1])
        }
        ctx.fillStyle = this.colour
        ctx.fill()
    }
}