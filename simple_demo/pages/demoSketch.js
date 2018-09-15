
/* soundSling Demo Sketch - 1-Axis sound diffusion 
   [Anthony T. Marasco - 2018]
*/

var mgr, nexusDiv1, nexusDiv2, button, slider, client, context;
var seatClicked = false;
var curveCalc =[];

var speakerMean = 0.;//this is set to be the location chosen by the user at start.
var speakerBleed = 1.; //1 is maximum overlap of sound from one speaker to the next. More speakers, lower bleed.
var soundLoc = 0.;
var phoneLoc = 0.;

//The following actions need to happen onload
function setup() {
    context = new AudioContext();
    createCanvas(windowWidth, windowHeight);
    //***************  Nexus UI ******************
    //add NexusUI widgets to the P5 canvas

    nexusDiv1 = createDiv(`<div id="button"></div>`);
    nexusDiv1.class("interface");
    nexusDiv1.style('position', windowWidth/2-200, windowHeight/2+100);

    nexusDiv2 = createDiv(`<div id="slider"></div>`);
    nexusDiv2.class("interface");
    nexusDiv2.style('position', ((windowWidth / 2) - 505)+65, windowHeight/2-30);

    //Build NexusUI Widget, add them to the div
    button = new Nexus.TextButton('#button', {
        text: 'Start!',
        size: [400, 200]
    })

    button.on('change', function (v) {
        if (v) {
            client.send("/locationChosen", [1]);
            speakerMean = phoneLoc;
            document.getElementById('button').style.display = 'none';
            document.getElementById('slider').style.display = 'none';
            mgr.showScene(PerformancePage);
            StartAudioContext(Tone.context, '#button').then(function () {
                console.log("AudioStarted");
            })
            
        }
    })

    //Build NexusUI Widget, add them to the div
    slider = new Nexus.Slider('#slider', {
        size: [430, 40],
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
    //init rhizome
    //client = new rhizome.Client()

    // `rhizome.start` is the first function that should be called.
    // The function inside is executed once the client managed to connect.
    client.start(function (err) {
        // We want to receive all the messages, so we subscribe to '/'
        // we could have this page only receive certain messages if we wanted to
        client.send('/sys/subscribe', ['/'])
    });

    //special websocket client messages, monitoring for issues 
    client.on('connected', function () { console.log('connected') })
    client.on('connection lost', function () { console.log('connection lost') })
    client.on('server full', function () { console.log('server full') })


    //listening for specific messages from Rhizome
    client.on('message', function (address, args) {
        if (address === '/playAll') {
            play();
        }

         if (address === '/speakerBleed') {
             speakerBleed = args[0];
             console.log("Speaker Bleed value: "+ speakerBleed);
         }

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



//**********************Scenes to Switch Between*************************

function LandingPage() {

    this.setup = function () {
        Tone.Master.mute = true;
        background("green");
        for (var i = 1; i <= 10; i++) {
            fill("aqua");
            rect((i * 45)+((windowWidth/2)-500), windowHeight/2-100, 40, 40);
        }
    }
}

function PerformancePage() {
    this.enter = function () {
        Tone.Master.mute = false;
        background(0);
        for (var i = 0; i <= 10; i++) {
            var y = calcGaussian(i/10, speakerMean, 0.25 * speakerBleed, 0.627 * speakerBleed);
            curveCalc[i]=y
        } 
    }

    this.draw = function () {
        var xPos = slingIt();
        player.volume.value = Tone.gainToDb(xPos);
        var backColor = map(xPos, 0, 1, 0,255);
        // console.log(soundLoc)
        background(backColor);
        fill(255);
    }

}


// **************  Audio Elements *****************
const player = new Tone.Player("/media/templeBell.mp3").toMaster();
//const delay = new Tone.FeedbackDelay(0.5, 0.10).toMaster();


//player.connect(delay);
player.volume.value = Tone.gainToDb(slingIt());


function play() {
    player.start();
}



//************* Slingin'! *****************

function calcGaussian(x, mean, spread, scale) {
    return (Math.exp((-1 * (x - mean) * (x - mean)) / (2 * spread * spread)) / (spread * Math.sqrt(2 * Math.PI))) * scale;
}


function slingIt() {

    var ampCurve = calcGaussian(soundLoc, speakerMean, 0.25 * speakerBleed, 0.627 * speakerBleed);//Make "scale" parameter int a variable that can be set from Max and multiplied by a set number

    if (ampCurve) {
        return ampCurve;
    } else {
        return 0.;
    }
}
