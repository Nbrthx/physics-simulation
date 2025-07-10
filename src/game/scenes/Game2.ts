import { Scene } from 'phaser';
import * as p from 'planck';
import { Ground } from '../prefabs/Ground';
import { Obj } from '../prefabs/Obj';
import { createDebugGraphics } from '../components/DebugPhysics';

export class Game2 extends Scene{

    world: p.World
    debugGraphics: Phaser.GameObjects.Graphics

    ground: Ground
    obj: Obj

    accelText: Phaser.GameObjects.Text

    constructor (){
        super('Game2');
    }

    preload(){
        this.load.setPath('assets')

        this.load.html('menu', 'menu.html')
        this.load.html('input2', 'game2.html')
    }

    create (){
        this.world = new p.World({ gravity: new p.Vec2(0, 9.8) })
        this.debugGraphics = this.add.graphics().setDepth(100000000000).setVisible(false)

        const menuElm = this.add.dom(this.scale.width-50, 200).createFromCache('menu').setOrigin(1, 0.5)
        const btnGame1 = menuElm.getChildByID('btnGame1') as HTMLLabelElement
        const btnGame2 = menuElm.getChildByID('btnGame2') as HTMLLabelElement

        btnGame2.style.fontWeight = 'bold'

        btnGame1?.addEventListener('click', () => {
            this.scene.start('Game1')
        })

        this.ground = new Ground(this, 640, 560, 800, 120, 0x888888)
        this.obj = new Obj(this, 640, 400, 32, 32, 0x22aa88, 'input2')
        
        this.accelText = this.add.text(this.obj.x, this.obj.y - 50, '0 m/s²', { fontSize: 24, color: '#000000' }).setDepth(1).setOrigin(0.5);
        
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible)
        })

        const grid = this.add.grid(this.scale.width/2, this.scale.height/2, 1280, 720, 320, 320, 0xffffff, 0.5)
        grid.setDepth(-1)
    }

    update(){
        this.world.step(1/60)

        this.ground.update()
        this.obj.update()

        const accel = Math.sqrt(this.obj.pBody.getLinearVelocity().x**2 + this.obj.pBody.getLinearVelocity().y**2)

        this.accelText.setPosition(this.obj.x, this.obj.y - 50)
        this.accelText.setText(`${accel.toFixed(2)} m/s²`)

        createDebugGraphics(this, this.debugGraphics)
    }
}
