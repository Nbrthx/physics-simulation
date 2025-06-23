import { Scene } from 'phaser';
import * as p from 'planck';
import { Ground } from '../prefabs/Ground';
import { Obj } from '../prefabs/Obj';
// import { createDebugGraphics } from '../components/DebugPhysics';

export class Game extends Scene{

    world: p.World
    // debugGraphics: Phaser.GameObjects.Graphics

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
        // this.debugGraphics = this.add.graphics().setDepth(100000000000)

        this.ground = new Ground(this, 640, 640, 800, 120, 0x888888)
        this.obj = new Obj(this, 640, 400, 32, 32, 0x22aa88)
        
        // this.input.keyboard?.on('keydown-SPACE', () => {
        //     this.debugGraphics.setVisible(!this.debugGraphics.visible)
        // })

        const grid = this.add.grid(this.scale.width/2, this.scale.height/2, 1280, 720, 320, 320, 0xffffff, 0.5)
        grid.setDepth(-1)
    }

    update(){
        this.world.step(1/60)

        this.obj.update()

        // createDebugGraphics(this, this.debugGraphics)
    }
}
