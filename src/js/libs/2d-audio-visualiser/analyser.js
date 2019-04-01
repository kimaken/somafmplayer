export class Analyser {
    constructor(analyserOptions) {
        this.audio = analyserOptions.audio;
        this.visual = this.audio.visual;

        this.scale = analyserOptions.scale;

        this.radius = analyserOptions.radius;

        this.isAlpha = analyserOptions.isAlpha;

        this.color = analyserOptions.color;

        this.audioContext = this.audio.audioContext;
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.frequencyNum = 1024;
        this.hz = 22028;
        this.analyser.smoothingTimeConstant = analyserOptions.smoothTime;

        this.filterLP = this.audioContext.createBiquadFilter();
        this.filterHP = this.audioContext.createBiquadFilter();

        this.filterLP.type = "lowpass";
        this.filterLP.frequency.value = analyserOptions.max;

        this.maxHz = analyserOptions.max;
        this.minHz = analyserOptions.min;

        this.offset = analyserOptions.offset;
        this.radiusOffset = 16 * this.offset;
        this.count = 0;

        this.stockSpectrums = [];

        this.sourceStart = Math.ceil(this.frequencyNum * this.minHz / this.hz);
        this.sourceEnd = Math.round(this.frequencyNum * this.maxHz / this.hz);
        this.sourceLength = this.sourceEnd - this.sourceStart + 1;

        this.adjustOffset = Math.round(this.sourceLength * 0.12);

        this.distLength = 120;
        this.interval = (this.sourceLength - 1) / (this.distLength - 1);

        this.totalLength = Math.round(this.distLength * 3 / 2);
    }

    adjustFrequency(i, avr) {
        let f = Math.max(0, this.spectrums[this.sourceStart + i] - avr) * this.scale;
        let offset = i - this.sourceStart;
        let ratio = offset / this.adjustOffset;

        f *= Math.max(0, Math.min(1, 5 / 6 * (ratio - 1) * (ratio - 1) * (ratio - 1) + 1));

        return f;
    }

    update() {
        let spectrums = new Float32Array(this.frequencyNum);
        if (this.audio.isReady) {
            this.analyser.getFloatFrequencyData(spectrums);
            this.stockSpectrums.push(spectrums);
        }

        if (this.count < this.offset) {
            this.spectrums = new Float32Array(this.frequencyNum);
        } else {
            if (this.audio.isReady) {
                let _spectrums = this.stockSpectrums[0];

                if (!isFinite(_spectrums[0])) {
                    this.spectrums = new Float32Array(this.frequencyNum);
                } else {
                    this.spectrums = _spectrums;
                }

                this.stockSpectrums.shift();
            } else {
                this.spectrums = new Float32Array(this.frequencyNum);
            }
        }

        if (this.audio.isReady) {
            this.count++;
        }

        let canvasContext = this.visual.canvasContext;
        canvasContext.strokeStyle = this.color;
        canvasContext.fillStyle = this.color;

        let avr = 0;

        for (let i = this.sourceStart; i <= this.sourceEnd; i++) {
            avr += this.spectrums[i];
        }

        avr /= this.sourceLength;

        avr = (!this.audio.isReady || avr === 0) ? avr : Math.min(-40, Math.max(avr, -60));

        canvasContext.beginPath();

        let frequencyArray = [];

        for (let i = 0; i < this.distLength; i++) {
            let n1 = Math.floor(i * this.interval);
            let n2 = n1 + 1;
            let n0 = Math.abs(n1 - 1);
            let n3 = n1 + 2;

            n2 = (n2 > this.sourceLength - 1) ? (this.sourceLength - 1) * 2 - n2 : n2;
            n3 = (n3 > this.sourceLength - 1) ? (this.sourceLength - 1) * 2 - n3 : n3;

            let p0 = this.adjustFrequency(n0, avr);
            let p1 = this.adjustFrequency(n1, avr);
            let p2 = this.adjustFrequency(n2, avr);
            let p3 = this.adjustFrequency(n3, avr);

            let mu = i * this.interval - n1;

            let mu2 = mu * mu;

            let a0 = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
            let a1 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
            let a2 = -0.5 * p0 + 0.5 * p2;

            let targetFrequency = a0 * mu * mu2 + a1 * mu2 + a2 * mu + p1;
            targetFrequency = Math.max(0, targetFrequency);
            frequencyArray.push(targetFrequency);

            let pos = this.visual.calcPolorCoord((i + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius + targetFrequency + 3);
            canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
        };

        for (let i = 1; i <= this.distLength; i++) {
            let targetFrequency = frequencyArray[this.distLength - i];
            let pos = this.visual.calcPolorCoord((i / 2 + this.distLength - 1 + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius + targetFrequency + 3);
            canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
        }

        for (let i = this.distLength; i > 0; i--) {
            let targetFrequency = frequencyArray[this.distLength - i];
            let pos = this.visual.calcPolorCoord((i / 2 + this.distLength - 1 + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius - targetFrequency - 3);
            canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
        }


        for (let i = this.distLength - 1; i >= 0; i--) {
            let targetFrequency = frequencyArray[i];
            let pos = this.visual.calcPolorCoord((i + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius - targetFrequency - 3);
            canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
        }

        canvasContext.fill();
    }
}