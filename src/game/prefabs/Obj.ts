import { Game1 } from "../scenes/Game1"
import * as p from 'planck'

export class Obj extends Phaser.GameObjects.Rectangle {

    scene: Game1
    pBody: p.Body

    inputElm: Phaser.GameObjects.DOMElement
    leftVectorLine: [Phaser.GameObjects.Line, Phaser.GameObjects.Triangle]
    rightVectorLine: [Phaser.GameObjects.Line, Phaser.GameObjects.Triangle]

    constructor(scene: Game1, x: number, y: number, width: number, height: number, color: number, inputHTML: string){
        super(scene, x, y, width, height, color)
        this.setStrokeStyle(2, color-0x111111)

        this.scene = scene
        this.scene.add.existing(this)

        this.pBody = scene.world.createDynamicBody({
            position: new p.Vec2(x/320, y/320),
            fixedRotation: true
        })
        let fixture = this.pBody.createFixture({
            shape: new p.Box(width/320/2, height/320/2),
            friction: 0.3,
        })

        this.pBody.setMassData({
            mass: 1,
            center: new p.Vec2(0, 0),
            I: 1,
        })

        this.pBody.setFixedRotation(false)

        this.inputElm = scene.add.dom(x, y-200).createFromCache(inputHTML)
        this.inputElm.setName(inputHTML)

        const massaElm = this.inputElm.getChildByName('massa') as HTMLInputElement
        const koefGesekBendaElm = this.inputElm.getChildByName('koef-gesek-benda') as HTMLInputElement
        const koefGesekLantaiElm = this.inputElm.getChildByName('koef-gesek-lantai') as HTMLInputElement
        const sudutLantaiElm = this.inputElm.getChildByName('sudut-lantai') as HTMLInputElement | undefined
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
                I: 0,
            })
        }

        koefGesekBendaElm.oninput = () => {
            koefGesekBendaElm.value = koefGesekBendaElm.value.replace(/(?![0-9.])./gmi,'')

            if((parseFloat(koefGesekBendaElm.value) || 0) > 1) koefGesekBendaElm.value = '1';
            const koefGesek = parseFloat(koefGesekBendaElm.value) || 0
            koefGesekBendaElm.nextElementSibling!.innerHTML = `μ = ${koefGesek}`

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
            koefGesekLantaiElm.nextElementSibling!.innerHTML = `μ = ${koefGesek}`

            this.scene.ground.setFriction(koefGesek)
        }

        if(sudutLantaiElm) sudutLantaiElm.oninput = () => {
            sudutLantaiElm.value = sudutLantaiElm.value.replace(/(?![0-9.])./gmi,'')

            if((parseFloat(sudutLantaiElm.value) || 0) > 90) sudutLantaiElm.value = '90';
            if((parseFloat(sudutLantaiElm.value) || 0) < -90) sudutLantaiElm.value = '-90';
            const sudutLantai = parseFloat(sudutLantaiElm.value) || 0

            this.scene.ground.pBody.setAngle(Phaser.Math.DegToRad(sudutLantai))
            this.pBody.setAngle(Phaser.Math.DegToRad(sudutLantai))

            this.pBody.applyForceToCenter(new p.Vec2(0, 0))
            
            this.pBody.setActive(false)
        }

        let gayaKiri = 0
        let gayaKanan = 0
        let sudutKiri = 0
        let sudutKanan = 0

        const createVectorLine = (x: number, y: number, length: number, angle: number, color: number): [Phaser.GameObjects.Line, Phaser.GameObjects.Triangle] => {
            const line = this.scene.add.line(0, 0, 0, 0, length*4, 0, color);
            line.setOrigin(0, 0.5);
            line.rotation = Phaser.Math.DegToRad(angle);
            line.setPosition(x, y);

            const triangle = this.scene.add.triangle(0, 0, 0, 0, 0, 0, 0, 0, color);
            triangle.setOrigin(0, 0.5);
            triangle.rotation = Phaser.Math.DegToRad(-angle);
            triangle.setPosition(x, y);

            return [line, triangle];
        };

        this.leftVectorLine = createVectorLine(this.x, this.y, gayaKiri, sudutKiri, 0xff0000);
        this.rightVectorLine = createVectorLine(this.x, this.y, gayaKanan, sudutKanan, 0x0000ff);

        const updateVectorLine = (arrow: [Phaser.GameObjects.Line, Phaser.GameObjects.Triangle], length: number, angle: number) => {
            arrow[0].setTo(0, 0, length*4, 0);
            arrow[0].setRotation(Phaser.Math.DegToRad(angle));

            const headangle = 15;

            const head1x = (length*4-4) * Math.cos(Phaser.Math.DegToRad(0 + headangle));
            const head1y = Math.min(length*3, 4*4) * Math.sin(Phaser.Math.DegToRad(0 + headangle));
            const head2x = (length*4-4) * Math.cos(Phaser.Math.DegToRad(0 - headangle));
            const head2y = Math.min(length*3, 4*4) * Math.sin(Phaser.Math.DegToRad(0 - headangle));

            arrow[1].setTo(length*4, 0, head1x, head1y, head2x, head2y)
            arrow[1].setRotation(Phaser.Math.DegToRad(angle));

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
            const x = Math.cos(sudutKiri*(Math.PI/180))*gayaKiri*10+Math.cos(sudutKanan*(Math.PI/180))*gayaKanan*10
            const y = Math.sin(sudutKiri*(Math.PI/180))*gayaKiri*10+Math.sin(sudutKanan*(Math.PI/180))*gayaKanan*10
            const vel = new p.Vec2(x, y)

            this.pBody.setActive(true)
            this.pBody.applyForceToCenter(vel)

            console.log(this.pBody.getAngle())
        })

        
        scene.add.existing(this.inputElm)
    }

    update() {
        const pos = this.pBody.getPosition()
        this.setX(pos.x*320)
        this.setY(pos.y*320)

        this.setRotation(this.pBody.getAngle())

        this.leftVectorLine[0].setPosition(this.x, this.y)
        this.leftVectorLine[1].setPosition(this.x, this.y)
        this.rightVectorLine[0].setPosition(this.x, this.y)
        this.rightVectorLine[1].setPosition(this.x, this.y)

        if(this.active && this.y > 1024){
            const scene = this.scene
            this.destroy()
            setTimeout(() => {
                scene.obj = new Obj(scene, 640, 400, 32, 32, 0x22aa88, this.inputElm.name)
                scene.ground.pBody.setAngle(0)
            }, 500)
        }
    }

    destroy(){
        this.scene.world.queueUpdate(world => world.destroyBody(this.pBody))
        this.inputElm.destroy()
        super.destroy()
    }
}