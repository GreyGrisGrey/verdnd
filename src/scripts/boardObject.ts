// Includes, tokens, drawings, map drawings, and areas of effect

export class BoardObject {
    ID: number
    zOrder: number
    location: Array<number>
    colour: string
    hasImage: boolean
    imagePath: string
    centerPoint: Array<number>
    
    constructor(id: number, x: number, y: number, col: string) {
        this.ID = id
        this.zOrder = 0
        this.location = [x, y]
        this.colour = col
        this.hasImage = false
        this.imagePath = ""
        this.centerPoint = [0, 0]
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
    
    isCenterInsideRect(point1: Array<number>, point2: Array<number>): boolean {
        if (this.centerPoint[0] >= point1[0] && this.centerPoint[0] <= point2[0] && this.centerPoint[1] >= point1[1] && this.centerPoint[1] <= point2[1]) {
            return true
        }
        return false
    }
}

export class Token extends BoardObject{
    owner: string
    radius: number
    name: string
    objType: string
    
    constructor(id: number, x: number, y: number, col: string) {
        super(id, x, y, col)
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
    
    constructor(id: number, x:number, y:number, xSize:number, ySize:number, col: string) {
        super(id, x, y, col)
        this.size = [xSize, ySize]
        this.objType = "Rect"
        this.centerPoint = [x + (xSize/2), y + (ySize/2)]
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        ctx.fillStyle = this.colour
        ctx.fillRect(this.location[0] * squareSize + offset[0], this.location[1] * squareSize + offset[1], this.size[0] * squareSize, this.size[1] * squareSize)
    }
    
    drawOutline(ctx:any, squareSize:number, offset:Array<number>) {
        ctx.fillStyle = "#ffd500"
        ctx.fillRect(this.location[0] * squareSize + offset[0] - 2, this.location[1] * squareSize + offset[1] - 2, this.size[0] * squareSize + 4, this.size[1] * squareSize + 4)
    }
    
    isPointInside(point: Array<number>): boolean{
        if (point[0] + 0.5 >= this.location[0] && point[1] + 0.5 >= this.location[1] && point[0] + 0.5 <= this.location[0] + this.size[0] && point[1] + 0.5 <= this.location[1] + this.size[1]) {
            return true
        }
        return false
    }
}

export class Circle extends BoardObject{
    diameter: number
    objType: string
    
    constructor(id: number, x:number, y:number, rad:number, col: string) {
        super(id, x, y, col)
        this.diameter = rad
        this.objType = "Circle"
        this.centerPoint = [x + rad/2, y + rad/2]
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        let coords = [(this.location[0] * squareSize) + offset[0] + squareSize * this.diameter/2, (this.location[1] * squareSize) + offset[1] + squareSize * this.diameter/2]
        ctx.beginPath()
        ctx.arc(coords[0], coords[1], this.diameter * squareSize / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.colour
        ctx.fill()
        ctx.closePath()
    }
    
    drawOutline(ctx:any, squareSize:number, offset:Array<number>) {
        let coords = [(this.location[0] * squareSize) + offset[0] + squareSize * this.diameter/2, (this.location[1] * squareSize) + offset[1] + squareSize * this.diameter/2]
        ctx.beginPath()
        ctx.arc(coords[0], coords[1], (this.diameter * squareSize / 2) + 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#ffd500"
        ctx.fill()
        ctx.closePath()
    }
    
    isPointInside(point: Array<number>): boolean{
        let adj = Math.abs(this.location[0] + this.diameter/2 - point[0] - 0.5)
        let opp = Math.abs(this.location[1] + this.diameter/2 - point[1] - 0.5)
        let distance = Math.sqrt(adj * adj + opp * opp)
        if (distance <= this.diameter/2) {
            return true
        }
        return false
    }
}

export class Polyline extends BoardObject{
    points: Array<Array<number>>
    objType: string
    currPath: Path2D
    currPathSpecs: Array<number>
    ctx: any
    
    constructor(id: number, x: number, y:number, structure:Array<Array<number>>, col: string) {
        super(id, x, y, col)
        this.points = structure
        this.objType = "Polyline"
        this.currPath = new Path2D()
        this.currPathSpecs = [0, 0, 0]
        this.ctx = null
        this.getCenter()
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        if (squareSize != this.currPathSpecs[0] || offset[0] != this.currPathSpecs[1] || offset[1] != this.currPathSpecs[2]) {
            this.currPath = new Path2D()
            this.currPath.moveTo(this.location[0] * squareSize + offset[0], this.location[1] * squareSize + offset[1])
            for (let i = 0; i < this.points.length; i++) {
                this.currPath.lineTo((this.location[0] + this.points[i][0]) * squareSize + offset[0], (this.location[1] + this.points[i][1]) * squareSize + offset[1])
            }
            this.currPathSpecs = [squareSize, offset[0], offset[1]]
            this.currPath.closePath()
        }
        ctx.fillStyle = this.colour
        ctx.fill(this.currPath)
        this.ctx = ctx
    }
    
    drawOutline(ctx:any, squareSize:number, offset:Array<number>) {
        if (squareSize != this.currPathSpecs[0] || offset[0] != this.currPathSpecs[1] || offset[1] != this.currPathSpecs[2]) {
            this.currPath = new Path2D()
            this.currPath.moveTo(this.location[0] * squareSize + offset[0], this.location[1] * squareSize + offset[1])
            for (let i = 0; i < this.points.length; i++) {
                this.currPath.lineTo((this.location[0] + this.points[i][0]) * squareSize + offset[0], (this.location[1] + this.points[i][1]) * squareSize + offset[1])
            }
            this.currPathSpecs = [squareSize, offset[0], offset[1]]
            this.currPath.closePath()
        }
        ctx.strokeStyle = "#ffd500"
        ctx.lineWidth = 4
        ctx.stroke(this.currPath)
        this.ctx = ctx
    }
    
    isPointInside(point: Array<number>): boolean{
        if (this.ctx.isPointInPath(this.currPath, (point[0] + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[1], (point[1] + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[2])) {
            return true
        }
        return false
    }
    
    getCenter() {
        let coords = [0, 0, 0, 0]
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i][0] < coords[0]) {
                coords[0] = this.points[i][0]
            } else if (this.points[i][0] > coords[1]) {
                coords[1] = this.points[i][0]
            }
            if (this.points[i][1] < coords[2]) {
                coords[2] = this.points[i][1]
            } else if (this.points[i][1] > coords[3]) {
                coords[3] = this.points[i][1]
            }
        }
        this.centerPoint = [(coords[1] + coords[0]) / 2 + this.location[0], (coords[3] + coords[2]) / 2 + this.location[1]]
    }
}

export class Line extends BoardObject{
    points: Array<Array<number>>
    objType: string
    
    constructor(id: number, x: number, y:number, structure:Array<Array<number>>, col: string) {
        super(id, x, y, col)
        this.points = structure
        this.objType = "Line"
    }
    
    draw(ctx:any, squareSize:number, offset:Array<number>) {
        ctx.beginPath()
        ctx.moveTo(this.location[0] * squareSize + offset[0], this.location[1] * squareSize + offset[1])
        for (let i = 0; i < this.points.length; i++) {
            ctx.lineTo((this.location[0] + this.points[i][0]) * squareSize + offset[0], (this.location[1] + this.points[i][1]) * squareSize + offset[1])
        }
        ctx.lineWidth = 3
        ctx.strokeStyle = this.colour
        ctx.stroke()
    }
    
    getCenter() {
        let coords = [0, 0, 0, 0]
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i][0] < coords[0]) {
                coords[0] = this.points[i][0]
            } else if (this.points[i][0] > coords[1]) {
                coords[1] = this.points[i][0]
            }
            if (this.points[i][1] < coords[2]) {
                coords[2] = this.points[i][1]
            } else if (this.points[i][1] > coords[3]) {
                coords[3] = this.points[i][1]
            }
        }
        this.centerPoint = [(coords[1] + coords[0]) / 2 + this.location[0], (coords[3] + coords[2]) / 2 + this.location[1]]
    }
}