document.getElementsByTagName("body")[0].innerHTML = `<div class="mb10">
        <div class="title">Scroll AI</div>
        <label class="switch">
        <input type="checkbox" onclick="toggleVideo()" id="trackbutton" class="bx--btn bx--btn--secondary">
        <span class="slider round"></span>
        </label>
        <div class="loader" id="loader"></div>
     </div>` + document.getElementsByTagName("body")[0].innerHTML;
const video = document.getElementById("myvideo");
const handimg = document.getElementById("handimage");
//const canvas = document.getElementById("canvas");
//const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let nextImageButton = document.getElementById("nextimagebutton");
let updateNote = document.getElementById("loader");

let imgindex = 1
let isVideo = false;
let model = null;

video.width = 500
video.height = 400

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            //updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            //updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        //updateNote.innerText = "Starting video"
        startVideo();
    } else {
        //updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        //updateNote.innerText = "Video stopped"
    }
}

function nextImage() {

    imgindex++;
    handimg.src = "images/" + imgindex % 15 + ".jpg"
    runDetectionImage(handimg)
}

// 5 frame coordinate subract 
var partitionsX = video.width / 4;
var partitionsY = video.height / 4;
var task_start = 0;
var task_end = 0;
var task_startY = 0;
var task_endY = 0;

var div = 0;
var divY = 0;
var jump = -500;

function runDetection() {
    threshold = 0.6
    model.detect(video).then(predictions => {
        predictions.forEach(function (element) {

            x = element['bbox'][0]
            y = element['bbox'][1]
            if (x < 1 * partitionsX) {
                task_start = performance.now(); console.log('Left', task_start);
                if ((task_start - task_end) < 2000 && div == 1) {
                    console.log('<<<<<<<<<<RIGHT_TO_LEFT');
                    setMotionPosition('Left','R-L');
                    div = 0;
                    window.scrollBy({top:0,left:-1*jump,  behavior: 'smooth'}); // Scroll 100px to the right
                }
            }
            else if (x < 2 * partitionsX)
                {div = 1;setMotionPosition('NONE','NONE');}
            else if (x < 3 * partitionsX)
                {div = 2;setMotionPosition('NONE','NONE');}
            else {
                task_end = performance.now(); console.log('Right', task_end);
                if ((task_end - task_start) < 2000 && div == 2) {
                    console.log('LEFT_TO_RIGHT>>>>>>>>>>>>');
                    setMotionPosition('Right','L-R');
                    div = 3;
                    window.scrollBy({top:0,left:jump,  behavior: 'smooth'});
                }
            }
            
            ///////////////////////////////////////////////////////////////////////////////////////////

            if (y < 1 * partitionsY) {
                task_startY = performance.now(); console.log('TOP', task_startY);
                if ((task_startY - task_endY) < 1000 && divY == 1) {
                    console.log('BOTTOM_TO_TOP..............');
                    setMotionPosition('TOP','B-T');
                    divY = 0;
                    window.scrollBy({top:-1*jump,left:0,  behavior: 'smooth'});
                }
            }
            else if (y < 2 * partitionsY)
                {divY = 1;setMotionPosition('NONE','NONE');}
            else if (y < 3 * partitionsY)
                {divY = 2;setMotionPosition('NONE','NONE');}
            else {
                task_endY = performance.now(); console.log('BOTTOM', task_endY);
                if ((task_endY - task_startY) < 1000 && divY == 2) {
                    console.log('--------------TOP_TO_BOTTOM');
                    setMotionPosition('BOTTOM','T-B');
                    divY = 3;
                    window.scrollBy({top:jump,left:0,  behavior: 'smooth'});
                }
            }

        });
        //model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function setMotionPosition(position,motion){
    document.getElementById('MOTION').innerHTML = motion;
    document.getElementById('POSITION').innerHTML = position;
}

function runDetectionImage(img) {
    model.detect(img).then(predictions => {
        //console.log("Predictions: ", predictions);
        predictions.forEach(function (element) {
            if (element['class'] == 'hand') {
                element['score'] >= threshold;
                console.log(element['bbox']);
            }
        });
        //model.renderPredictions(predictions, canvas, context, img);
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    //<div class = "loader"></div>
    updateNote.style.display="none";

    runDetectionImage(handimg)
    trackButton.disabled = false
    nextImageButton.disabled = false
});
