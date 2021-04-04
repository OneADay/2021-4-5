import './index.less';
import * as seedrandom from 'seedrandom';
import gsap from 'gsap';

import BaseRecorder from './recorders/baseRecorder';
import Recorder from './recorders/mediaRecorder';
import CCaptureRecorder from './recorders/ccaptureRecorder';
import saveThumbnail from './recorders/thumbnailCapture';

//import ThreeRenderer from './renderers/threeRenderer';
import CanvasRenderer from './renderers/canvasRenderer';

interface CanvasElement extends HTMLCanvasElement {               
    captureStream(int): MediaStream;             
}

const DEBUG: boolean = true;
const THUMBNAIL: boolean = false;

const srandom = seedrandom('a');

let tl;
let items = [];

class App {
    canvas: CanvasElement;
    renderer: CanvasRenderer;
    recorder: BaseRecorder;

    animating: boolean = true;

    constructor() {
        this.canvas = <CanvasElement> document.getElementById('canvas');

        this.recorder = new CCaptureRecorder(this.canvas);
        if (this.shouldRecord()) {
            this.recorder.start();
        }

        this.renderer = new CanvasRenderer(this.canvas);

        this.createTimeline();

        this.animation();

        if (THUMBNAIL && !DEBUG) {
            saveThumbnail(this.canvas);
        }
    }

    createTimeline() {
        items = this.renderer.items;

        tl = gsap.timeline({
            delay: 0.1,             // delay to capture first frame
            repeat: DEBUG ? -1 : 1, // if debug repeat forever
            yoyo: true, 
            paused: THUMBNAIL,
            onComplete: () => this.handleTLComplete()
        });

        tl.timeScale(0.3);

        for (let i = items.length - 1; i > 0; i--) {
            let item = items[i];

            tl.to(item, {
                size: i + this.renderer.randomSize() / 1000,
                color: this.renderer.randomColor(),
                duration: 0.2,
                ease: 'none'
            }, i / 500);
            

            tl.to(item, {
                size: i + this.renderer.randomSize() / 2000,
                color: this.renderer.randomColor(),
                duration: 0.2,
                ease: 'none'
            }, (i + 2) / 500);
            
            tl.to(item, {
                size: i + this.renderer.randomSize() / 3000,
                color: this.renderer.randomColor(),
                duration: 0.2,
                ease: 'none'
            }, (i + 3) / 500);
            /*
            tl.to(item, {
                size: i + this.renderer.randomSize() / 2000,
                color: this.renderer.randomColor(),
                duration: 0.2,
                ease: 'none'
            }, i / 1000);

            tl.to(item, {
                size: i + this.renderer.randomSize(),
                color: this.renderer.randomColor(),
                duration: 0.3,
                ease: 'none'
            }, 0.5);
            */
        }

        console.log('duration:', tl.duration());
    }

    handleTLComplete() {
        setTimeout(() => {
            if (this.shouldRecord()) {
                this.recorder.stop();
                this.animating = false;
            }
        }, 100); //delay to capture last frame.
    }

    animation() {
        this.renderer.render();
        if (this.shouldRecord()) {
            this.recorder.update();
        }
        if (this.animating) {
            requestAnimationFrame(() => this.animation());
        }
    }

    shouldRecord() {
        return !DEBUG && !THUMBNAIL;
    }
    
}

new App();