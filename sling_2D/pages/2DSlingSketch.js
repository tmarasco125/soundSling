
/* SoundSling 2D Demo Sketch - Multiple Slings, 2-Axis sound diffusion 
   [Anthony T. Marasco - 2018]
*/

var mgr, nexusDiv1, nexusDiv2, button, position, client, context;

var curveCalcX = [];
var curveCalcY = [];
var row = 1;
var speakerMeanX = 0.;//this is set to be the location chosen by the user at start.
var speakerMeanY = 0.;//this is set to be the location chosen by the user at start.

var speakerBleed = [1, 1]; //1 is maximum overlap of sound from one speaker to the next. More speakers, lower bleed.

var soundLoc = [0., 0.];
var soundLocY = [0., 0.];
var phoneLocX = 0.;
var phoneLocY = 0.;

//The following actions need to happen onload
function setup() {
    context = new AudioContext();
    createCanvas(windowWidth, windowHeight);
    //***************  Nexus UI ******************
    //add NexusUI widgets to the P5 canvas

    nexusDiv1 = createDiv(`<div id="button"></div>`);
    nexusDiv1.class("interface");
    nexusDiv1.style('position', windowWidth / 2 - 200, windowHeight / 2 + 300);
    nexusDiv1.style('color', "#FFF");
    nexusDiv2 = createDiv(`<div id="slider"></div>`);
    nexusDiv2.class("interface");
    nexusDiv2.style('position', ((windowWidth / 2) - 518) + 85, windowHeight / 2 - 228);


    //Build NexusUI Widget, add them to the div
    button = new Nexus.TextButton('#button', {
        text: 'Start!',
        size: [400, 200],
        textSize: 14,

    })
    button.colorize("fill", "#96016e");
    button.colorize("light", "#FFF");

    button.on('change', function (v) {
        if (v) {
            client.send("/locationChosen", [1]);
            speakerMeanX = phoneLocX;
            speakerMeanY = phoneLocY;

            document.getElementById('button').style.display = 'none';
            document.getElementById('slider').style.display = 'none';
            mgr.showScene(PerformancePage);
            StartAudioContext(Tone.context, '#button').then(function () {
                console.log("AudioStarted");
                //reverb.generate();
            })

        }
    })

    //Build NexusUI Widget, add them to the div
    position = new Nexus.Position('#slider', {
        size: [900, 515],
        mode: "absolute",
        x: 0.04,
        minX: 0,
        maxX: 1,
        stepX: 0,
        y: 8,
        minY: 0,
        maxY: 1,
        stepY: 0,
    });



    position.colorize("accent", "#EB984E");
    position.colorize("fill", "rgba(0,0,0,0)");//transparent background for position slider

    position.on('change', function (v) {
        phoneLocX = v.x;
        //do I need .floor for y?
        phoneLocY = ((1-v.y ) * 7.99999)+1;//flips Nexus slider Y value so row  is at the front of the hall/top of seating diagram
        
        //result = isOdd(phoneLocY);
        //console.log("phoneLocX: " + phoneLocX)
        //console.log("phoneLocY: " + phoneLocY)
        //console.log("result is" + result);
        //row = result;
    });


    // function isOdd(num) {
    //     return (num % 2);
    // };

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

        //    if(phoneLocY == true)
        if (address === '/play') {

            play(args[0]);
        }


        if (address === '/speakerBleed') {
            
                speakerBleed[args[0]] = args[1];//second element of the array, data stream
            //console.log("Speaker Bleed value: " + speakerBleed);
        }



        if (address === '/soundLocation') {
            
                soundLoc[args[0]] = args[1];
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
        background("white");
        for (var i = 1; i <= 15; i++) {
            for (var j = 1; j <= 8; j++) {
                fill("lightBlue");
                rect((i * 60.5) + ((windowWidth / 2) - 500), (j * 66) + ((windowHeight / 2) - 300), 50, 50);
            }
        }
    }
}

function PerformancePage() {
    this.enter = function () {
        Tone.Master.mute = false;
        background(0);
        for (var i = 0; i <= 10; i++) {
            var x = calcGaussian(i / 10, speakerMeanX, 0.25 * speakerBleed[row], 0.627 * speakerBleed[row]);
            var y = calcGaussian(i / 10, speakerMeanY, 0.25 * speakerBleed[row], 0.627 * speakerBleed[row]);
            curveCalcX[i] = x;
            curveCalcY[i] = y;
        }
    }

    this.draw = function () {
        var xPos = slingIt();
        player.volume.value = Tone.gainToDb(xPos);
        player2.volume.value = Tone.gainToDb(xPos);
        var backColor = map(xPos, 0, 1, 0, 255);
         
        if (row ==1){
            background(backColor);
            fill(255);
        } else if (row ==0){
            background(backColor, 0, backColor);
            fill(255);
        }
        
    }

}


// **************  Audio Elements *****************
const player = new Tone.Player({
    "url": "/media/Indian_Bell.mp3",
    "loop": true
}).toMaster();

const player2 = new Tone.Player({
    "url": "/media/templeBell.mp3",
    "loop": true
}).toMaster();

//const delay = new Tone.FeedbackDelay(0.5);




//player.chain(delay,Tone.Master);
player.volume.value = Tone.gainToDb(slingIt());

player2.toMaster();
player2.volume.value = Tone.gainToDb(slingIt());

function play(number) {
    if (row == 1) {
        if (number == 1) {
            player.start();
        } else if (number == 0){
            player.stop();     
        }
    } else {
        if (number == 2) {
            player2.start();

        } else if (number ==0) {
            player2.stop();    
        }
    }

}


//************* Slingin'! *****************

function calcGaussian(x, mean, spread, scale) {
    // return (1 / Math.sqrt((2*Math.PI)* spread)) * Math.exp(-Math.pow(x - mean,2) / (2 * spread));
    return (Math.exp((-1 * (x - mean) * (x - mean)) / (2 * spread * spread)) / (spread * Math.sqrt(2 * Math.PI))) * scale;
}


function slingIt2D() {

    var ampCurveOnX = calcGaussian(soundLoc[row], speakerMean, 0.25 * speakerBleed[row], 0.627 * speakerBleed[row]);
    var ampCuvreOnY

    if (ampCurveOnX) {
        return ampCurveOnX;
    } else {
        return 0.;
    }
}
