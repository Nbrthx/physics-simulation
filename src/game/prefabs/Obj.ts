import { Game } from "../scenes/Game"
import * as p from 'planck'

export class Obj extends Phaser.GameObjects.Rectangle {

    scene: Game
    pBody: p.Body

    inputElm: Phaser.GameObjects.DOMElement
    leftVectorLine: Phaser.GameObjects.Line
    rightVectorLine: Phaser.GameObjects.Line

    constructor(scene: Game, x: number, y: number, width: number, height: number, color: number){
        super(scene, x, y, width, height, color)
        this.setStrokeStyle(2, color-0x111111)

        this.scene = scene
        this.scene.add.existing(this)

        this.pBody = scene.world.createDynamicBody(new p.Vec2(x/320, y/320))
        let fixture = this.pBody.createFixture({
            shape: new p.Box(width/320/2, height/320/2),
            friction: 0.3
        })

        this.inputElm = scene.add.dom(x, y-200).createFromCache('input-obj')

        const massaElm = this.inputElm.getChildByName('massa') as HTMLInputElement
        const koefGesekBendaElm = this.inputElm.getChildByName('koef-gesek-benda') as HTMLInputElement
        const koefGesekLantaiElm = this.inputElm.getChildByName('koef-gesek-lantai') as HTMLInputElement
        const gayaKiriElm = this.inputElm.getChildByName('gaya-kiri') as HTMLInputElement
        const sudutKiriElm = this.inputElm.getChildByName('sudut-kiri') as HTMLInputElement
        const gayaKananElm = this.inputElm.getChildByName('gaya-kanan') as HTMLInputElement
        const sudutKananElm = this.inputElm.getChildByName('sudut-kanan') as HTMLInputElement

        massaElm.oninput = () => {
            massaElm.value = massaElm.value.replace(/(?![0-9.])./gmi,'')

            const massa = parseFloat(massaElm.value) || 0

            this.pBody.setMassData({
                mass: massa,
                center: new p.Vec2(0, 0),
                I: 1,
            })
        }

        koefGesekBendaElm.oninput = () => {
            koefGesekBendaElm.value = koefGesekBendaElm.value.replace(/(?![0-9.])./gmi,'')

            if((parseFloat(koefGesekBendaElm.value) || 0) > 1) koefGesekBendaElm.value = '1';
            const koefGesek = parseFloat(koefGesekBendaElm.value) || 0

            this.pBody.destroyFixture(fixture)
            fixture = this.pBody.createFixture({
                shape: new p.Box(width/320/2, height/320/2),
                friction: koefGesek,
            })
        }

        koefGesekLantaiElm.oninput = () => {
            koefGesekLantaiElm.value = koefGesekLantaiElm.value.replace(/(?![0-9.])./gmi,'')

            if((parseFloat(koefGesekLantaiElm.value) || 0) > 1) koefGesekLantaiElm.value = '1';
            const koefGesek = parseFloat(koefGesekLantaiElm.value) || 0

            this.scene.ground.setFriction(koefGesek)
        }

        let gayaKiri = 0
        let gayaKanan = 0
        let sudutKiri = 0
        let sudutKanan = 0

        const createVectorLine = (x: number, y: number, length: number, angle: number, color: number) => {
            const line = this.scene.add.line(0, 0, 0, 0, length*4, 0, color);
            line.setOrigin(0, 0.5);
            line.rotation = Phaser.Math.DegToRad(angle);
            line.setPosition(x, y);
            return line;
        };

        this.leftVectorLine = createVectorLine(this.x, this.y, gayaKiri, sudutKiri, 0xff0000);
        this.rightVectorLine = createVectorLine(this.x, this.y, gayaKanan, sudutKanan, 0x0000ff);

        const updateVectorLine = (line: Phaser.GameObjects.Line, length: number, angle: number) => {
            line.setTo(0, 0, length*4, 0);
            line.rotation = Phaser.Math.DegToRad(angle);
        };

        gayaKiriElm.oninput = () => {
            gayaKiriElm.value = gayaKiriElm.value.replace(/(?![0-9.])./gmi,'');
            gayaKiri = -parseFloat(gayaKiriElm.value) || 0;
            updateVectorLine(this.leftVectorLine, gayaKiri, sudutKiri);
        };

        gayaKananElm.oninput = () => {
            gayaKananElm.value = gayaKananElm.value.replace(/(?![0-9.])./gmi,'');
            gayaKanan = parseFloat(gayaKananElm.value) || 0;
            updateVectorLine(this.rightVectorLine, gayaKanan, sudutKanan);
        };

        sudutKiriElm.oninput = () => {
            sudutKiriElm.value = sudutKiriElm.value.replace(/(?![0-9.-])./gmi,'');
            if((parseFloat(sudutKiriElm.value) || 0) > 90) sudutKiriElm.value = '90';
            if((parseFloat(sudutKiriElm.value) || 0) < -90) sudutKiriElm.value = '-90';
            sudutKiri = parseFloat(sudutKiriElm.value) || 0;
            updateVectorLine(this.leftVectorLine, gayaKiri, sudutKiri);
        };

        sudutKananElm.oninput = () => {
            sudutKananElm.value = sudutKananElm.value.replace(/(?![0-9.-])./gmi,'');
            if((parseFloat(sudutKananElm.value) || 0) > 90) sudutKananElm.value = '90';
            if((parseFloat(sudutKananElm.value) || 0) < -90) sudutKananElm.value = '-90';
            sudutKanan = parseFloat(sudutKananElm.value) || 0;
            updateVectorLine(this.rightVectorLine, gayaKanan, sudutKanan);
        };

        this.inputElm.getChildByName('apl')?.addEventListener('click', () => {
            const gaya = gayaKiri*10+gayaKanan*10
            const x = Math.cos((sudutKiri+sudutKanan)*(Math.PI/180))*gaya
            const y = Math.sin((sudutKiri+sudutKanan)*(Math.PI/180))*gaya
            const vel = new p.Vec2(x, y)
            this.pBody.applyForceToCenter(vel)
        })

        
        scene.add.existing(this.inputElm)
    }

    update() {
        const pos = this.pBody.getPosition()
        this.setX(pos.x*320)
        this.setY(pos.y*320)

        this.leftVectorLine.setPosition(this.x, this.y)
        this.rightVectorLine.setPosition(this.x, this.y)

        if(this.active && this.y > 1024){
            const scene = this.scene
            this.destroy()
            setTimeout(() => {
                scene.obj = new Obj(scene, 640, 400, 32, 32, 0x22aa88)
            }, 500)
        }
    }

    destroy(){
        this.scene.world.queueUpdate(world => world.destroyBody(this.pBody))
        this.inputElm.destroy()
        super.destroy()
    }
}