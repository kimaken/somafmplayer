import {Analyser} from "./analyser.js";

export class Sound {
    constructor(_visual, audio) {
        this.visual = _visual;
		this.audio = audio;
        this.audioContext = (window.AudioContext) ? new AudioContext : new webkitAudioContext;
        this.isReady = false;
        this.count = 0;
    }

    init() {
        this.analyser_1 = new Analyser({
			audio: this,
			smoothTime: 0.7,
			color: "#b0c2e6",
			scale: 2,
			min: 1,
			max: 600,
			offset: 1,
			radius: 350,
			isAlpha: true
		});

        this.analyser_2 = new Analyser({
			audio: this,
			smoothTime: 0.82,
			color: "#ec8585",
			scale: 1.8,
			min: 1,
			max: 600,
			offset: -1,
			radius: 350,
			isAlpha: false
		});

        this.render();

        this.isReady = true;

        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser_1.analyser);
        this.source.connect(this.analyser_2.analyser);
        this.source.connect(this.audioContext.destination);
    }

    render() {
        this.visual.draw();

        requestAnimationFrame(this.render.bind(this));
    }
}