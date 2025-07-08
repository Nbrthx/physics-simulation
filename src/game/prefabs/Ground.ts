import { Game1 } from "../scenes/Game1"
import * as p from 'planck'

export class Ground extends Phaser.GameObjects.Rectangle {

    scene: Game1
    pBody: p.Body
    fixture: p.Fixture

    constructor(scene: Game1, x: number, y: number, width: number, height: number, color: number){
        super(scene, x, y, width, height, color)
        this.setStrokeStyle(2, color-0x222222)

        this.scene = scene
        this.scene.add.existing(this)

        this.pBody = scene.world.createBody(new p.Vec2(x/320, y/320))
        this.fixture = this.pBody.createFixture({
            shape: new p.Box(width/320/2, height/320/2),
            friction: 1
        })
    }

    setFriction(koefGesek: number){
        this.pBody.destroyFixture(this.fixture);
        this.fixture = this.pBody.createFixture({
            shape: new p.Box(this.width/320/2, this.height/320/2),
            friction: koefGesek
        });
    }

    update(): void {
        const pos = this.pBody.getPosition()
        this.setX(pos.x*320)
        this.setY(pos.y*320)

        this.setRotation(this.pBody.getAngle())
    }
}