
/* soundSling Demo Sketch - 1-Axis sound diffusion 
   [Anthony T. Marasco - 2018]
*/

var mgr, phoneLoc, nexusDiv1, nexusDiv2, button, slider, client;
var seatClicked = false;

var speakerMean = 0.;//this is set to be the location chosen by the user at start.
var speakerBleed = 1.; //1 is maximum overlap of sound from one speaker to the next. More speakers, lower bleed.
var soundLoc = 0.;

//The following actions need to happen onload
function setup() {
    createCanvas(windowWidth, windowHeight);
    //***************  Nexus UI ******************
    //add NexusUI widgets to the P5 canvas

    nexusDiv1 = createDiv(`<div id="button"></div>`);
    nexusDiv1.class("interface");
    nexusDiv1.style('position', windowWidth/2-200, windowHeight/2+100);

    nexusDiv2 = createDiv(`<div id="slider"></div>`);
    nexusDiv2.class("interface");
    nexusDiv2.style('position', ((windowWidth / 2) - 400)+85, windowHeight/2-30);

    //Build NexusUI Widget, add them to the div
    button = new Nexus.TextButton('#button', {
        text: 'Tap your location, then click here to start!',
        size: [400, 200]
    })

    button.on('change', function (v) {
        if (v) {
            client.send("/locationChosen", [1]);
            speakerMean = phoneLoc;
            document.getElementById('button').style.display = 'none';
            document.getElementById('slider').style.display = 'none';
            mgr.showScene(PerformancePage);
        }
    })

    //Build NexusUI Widget, add them to the div
    slider = new Nexus.Slider('#slider', {
        size: [625, 40],
        min: 0,
        max: 1,
        step: 0,
        value: 0
    });

    slider.colorize("accent", "#EB984E");
    slider.colorize("fill", "#FFFFFF");

    slider.on('change', function (v) {
        phoneLoc = v;
        console.log("phoneLoc: "+phoneLoc)
    })
//******P5 Graphics Scene Set-Up*************
    //SceneManager library init
    mgr = new SceneManager();

    //Preload Scenes
    mgr.addScene(LandingPage);
    mgr.addScene(PerformancePage);
    mgr.showNextScene();

//****************  Rhizome Setup***********
    //init rhizome
    client = new rhizome.Client()

    // `rhizome.start` is the first function that should be called.
    // The function inside is executed once the client managed to connect.
    client.start((err) => {
        // We want to receive all the messages, so we subscribe to '/'
        // we could have this page only receive certain messages if we wanted to
        client.send('/sys/subscribe', ['/'])
    });

    //special websocket client messages, monitoring for issues 
    client.on('connected', () => console.log('connected'))
    client.on('connection lost', () => console.log('connection lost'))
    client.on('server full', () => console.log('server full'))


    //listening for specific messages from Rhizome
    client.on('message', (address, args) => {
        if (address === '/playAll') {
            play();
        }

        // if (address === '/speakerBleed') {
        //     speakerBleed = args[0];
        //     console.log("Speaker Bleed value: "+ speakerBleed);
        // }

        if (address === '/soundLocation') {
            soundLoc = args[0];
            console.log("Sound Location: " + soundLoc);
        }
    })

    

}

function draw() {
    mgr.draw();
}


function mousePressed() {

    mgr.mousePressed();
}

function keyPressed() {
    mgr.keyPressed();
}


//**********************Scenes to Switch Between*************************

function LandingPage() {

    this.setup = function () {
        background("grey");
        for (var i = 1; i <= 11; i++) {
            fill("aqua");
            rect((i * 60)+((windowWidth/2)-400), windowHeight/2-100, 50, 50);
        }
    }

    // this.mousePressed = function () {

    //     if (mouseX < 110 && mouseX > 60 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             console.log("cool");
    //             fill("red");
    //             ellipse(85, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = 0;
    //         }

    //     } else if (mouseX < 170 && mouseX > 110 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(145, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = 0.1;
    //         }
    //     } else if (mouseX < 230 && mouseX > 170 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(205, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = 0.2;
    //         }
    //     } else if (mouseX < 290 && mouseX > 230 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(265, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = 0.3;
    //         }
    //     } else if (mouseX < 350 && mouseX > 290 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(325, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = .4;
    //         }
    //     } else if (mouseX < 410 && mouseX > 350 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(385, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = .5;
    //         }
    //     } else if (mouseX < 470 && mouseX > 410 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(445, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = .6;
    //         }
    //     } else if (mouseX < 530 && mouseX > 470 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(505, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = .7;
    //         }
    //     } else if (mouseX < 590 && mouseX > 530 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(565, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = .8;
    //         }
    //     } else if (mouseX < 650 && mouseX > 590 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(625, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = .9;
    //         }
    //     } else if (mouseX < 710 && mouseX > 650 && mouseY < 60 && mouseY > 10) {
    //         if (seatClicked == false) {
    //             fill("red");
    //             ellipse(685, 35, 20, 20);
    //             seatClicked = true;
    //             phoneLoc = 1;
    //         }
    //     }
        
    // }

}

function PerformancePage() {
    this.enter = function () {
        background(0);
        
    }

    this.draw = function () {
        var xPos = slingIt();
        player.volume.value = Tone.gainToDb(xPos);
        var backColor = map(xPos, 0, 1, 0,255);
        // console.log(soundLoc)
        background(backColor);
    }

    this.keyPressed = function () {
        play();
    }
}


// **************  Audio Elements *****************


const player = new Tone.Player("/media/tremolo/373785__samulis__solo-violin-tremolo-e5-llvln-trem-e4-v1-rr1.mp3").toMaster();
player.volume.value = Tone.gainToDb(slingIt());


function play() {
    player.start();
}



//************* Slingin'! *****************

function calcGaussian(x, mean, spread, scale) {
    // return (1 / Math.sqrt((2*Math.PI)* spread)) * Math.exp(-Math.pow(x - mean,2) / (2 * spread));
    return (Math.exp((-1 * (x - mean) * (x - mean)) / (2 * spread * spread)) / (spread * Math.sqrt(2 * Math.PI))) * scale;
}


function slingIt() {

    var ampY = calcGaussian(soundLoc, speakerMean, 0.25 * speakerBleed, 0.627 * speakerBleed);//Make "scale" parameter int a variable that can be set from Max and multiplied by a set number


    console.log("Amplitude:" + ampY);//send to Tone Gain node
    console.log("speakerBleed: " + speakerBleed);
    console.log("soundLoc: " + soundLoc);
    // client.send('/curveX', [ampY]);
    //client.send('/regX', [v]);
    if (ampY) {
        return ampY;
    }

}
