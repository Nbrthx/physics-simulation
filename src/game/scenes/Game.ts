import { Scene } from 'phaser';
import * as p from 'planck';

// function createDebugGraphics(scene: Game, debugGraphics: Phaser.GameObjects.Graphics) {
//     debugGraphics.clear()

//     for (let body = scene.world.getBodyList(); body; body = body.getNext()) {
//         const position = body.getPosition();
//         const angle = body.getAngle();

//         let color: number = 0x999999
//         switch(body.getType()){
//             case p.Body.KINEMATIC: color = 0xffff00; break;
//             case p.Body.DYNAMIC: color = 0x00ffff; break;
//             case p.Body.STATIC: color = 0x0000ff; 
//         }
//         color = body.isActive() ? color : 0x999999

//         debugGraphics.lineStyle(2, color, 1);
//         for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
//             const shape = fixture.getShape();

//             if (shape instanceof p.Box) {
//                 const vertices = shape.m_vertices

//                 const transformedVertices = vertices.map(v => {
//                     return v.clone().add(shape.m_centroid);
//                 }).map(v => {
//                     const rotatedX = v.x * Math.cos(angle) - v.y * Math.sin(angle);
//                     const rotatedY = v.x * Math.sin(angle) + v.y * Math.cos(angle);
//                     return new p.Vec2(rotatedX, rotatedY).add(position).sub(shape.m_centroid);
//                 });

//                 debugGraphics.beginPath()
//                 debugGraphics.moveTo(transformedVertices[0].x * 320, transformedVertices[0].y * 320);
//                 for (let i = 1; i < transformedVertices.length; i++) {
//                     debugGraphics.lineTo(transformedVertices[i].x * 320, transformedVertices[i].y * 320);
//                 }
//                 debugGraphics.closePath();
//                 debugGraphics.strokePath();
//             }
//             if(shape instanceof p.Circle){
//                 const center = shape.m_p.clone().add(position);
//                 debugGraphics.strokeCircle(center.x * 320, center.y * 320, shape.m_radius * 320)
//             }
//         }
//     }
// }

class Ground extends Phaser.GameObjects.Rectangle {

    scene: Game
    pBody: p.Body

    constructor(scene: Game, x: number, y: number, width: number, height: number, color: number){
        super(scene, x, y, width, height, color)
        this.setStrokeStyle(2, color-0x222222)

        this.scene = scene
        this.scene.add.existing(this)

        this.pBody = scene.world.createBody(new p.Vec2(x/320, y/320))
        this.pBody.createFixture({
            shape: new p.Box(width/320/2, height/320/2),
            friction: 0.3
        })
    }
}

class Obj extends Phaser.GameObjects.Rectangle {

    scene: Game
    pBody: p.Body

    inputElm: Phaser.GameObjects.DOMElement

    constructor(scene: Game, x: number, y: number, width: number, height: number, color: number){
        super(scene, x, y, width, height, color)
        this.setStrokeStyle(2, color-0x111111)

        this.scene = scene
        this.scene.add.existing(this)

        this.pBody = scene.world.createDynamicBody(new p.Vec2(x/320, y/320))
        this.pBody.createFixture({
            shape: new p.Box(width/320/2, height/320/2),
            friction: 0.3
        })

        this.inputElm = scene.add.dom(x, y-100).createFromCache('input-obj')

        const massaElm = this.inputElm.getChildByName('massa') as HTMLInputElement
        const gayaKiriElm = this.inputElm.getChildByName('gaya-kiri') as HTMLInputElement
        const gayaKananElm = this.inputElm.getChildByName('gaya-kanan') as HTMLInputElement

        massaElm.oninput = () => {
            massaElm.value = massaElm.value.replace(/(?![0-9.])./gmi,'')

            const massa = parseFloat(massaElm.value) || 0

            this.pBody.setMassData({
                mass: massa,
                center: new p.Vec2(0, 0),
                I: 1,
            })
        }

        let gayaKiri = 0
        let gayaKanan = 0

        gayaKiriElm.oninput = () => {
            gayaKiriElm.value = gayaKiriElm.value.replace(/(?![0-9.])./gmi,'')

            gayaKiri = -parseFloat(gayaKiriElm.value) || 0
        }
        gayaKananElm.oninput = () => {
            gayaKananElm.value = gayaKananElm.value.replace(/(?![0-9.])./gmi,'')

            gayaKanan = parseFloat(gayaKananElm.value) || 0
        }

        this.inputElm.getChildByName('apl')?.addEventListener('click', () => {
            this.pBody.applyForceToCenter(new p.Vec2(gayaKiri*10+gayaKanan*10, 0))
        })

        
        scene.add.existing(this.inputElm)
    }

    update() {
        const pos = this.pBody.getPosition()
        this.setX(pos.x*320)
        this.setY(pos.y*320)

        if(this.active && this.y > 1024){
            const scene = this.scene
            this.destroy()
            setTimeout(() => {
                scene.obj = new Obj(scene, 640, 400, 32, 32, 0xee4433)
            }, 500)
        }
    }

    destroy(){
        this.scene.world.queueUpdate(world => world.destroyBody(this.pBody))
        this.inputElm.destroy()
        super.destroy()
    }
}

export class Game extends Scene{

    world: p.World
    debugGraphics: Phaser.GameObjects.Graphics

    ground: Ground
    obj: Obj

    constructor (){
        super('Game');
    }

    preload(){
        this.load.setPath('assets')

        this.load.html('input-obj', 'input-obj.html')
    }

    create (){
        this.world = new p.World({ gravity: new p.Vec2(0, 9.8) })
        this.debugGraphics = this.add.graphics().setDepth(100000000000)

        this.ground = new Ground(this, 640, 640, 800, 120, 0x888888)
        this.obj = new Obj(this, 640, 400, 32, 32, 0xee4433)
        
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible)
        })

        const grid = this.add.grid(this.scale.width/2, this.scale.height/2, 1280, 720, 320, 320, 0xffffff, 0.5)
        grid.setDepth(-1)
    }

    update(){
        this.world.step(1/60)

        this.obj.update()

        // createDebugGraphics(this, this.debugGraphics)
    }
}
