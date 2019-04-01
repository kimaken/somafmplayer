import {Sound} from "./sound.js";

export class Visualiser {
    constructor(audio) {
        this.canvas = document.getElementById('visualiser');
        this.canvasContext = this.canvas.getContext('2d');

        this.resize();

        this.sound = new Sound(this, audio);
        this.sound.init();
        this.tick = 0;
    }

    resize() {
        this.canvasW = this.canvas.width = 1400;
        this.canvasH = this.canvas.height = 1400;
    }

    calcPolorCoord(a, b) {
        let x = Math.cos(a * 2 * Math.PI) * b;
        let y = Math.sin(a * 2 * Math.PI) * b * 0.95;

        return {
            x: x,
            y: y
        };
    }

    draw() {
        this.tick += 0.07;
        let canvasContext = this.canvasContext;

        canvasContext.save();
        canvasContext.clearRect(0, 0, this.canvasW, this.canvasH);
        canvasContext.translate(this.canvasW / 2, this.canvasH / 2);
        canvasContext.lineWidth = 3;

        this.sound.analyser_1.update();
        this.sound.analyser_2.update();

        canvasContext.restore();
    }
}